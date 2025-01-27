'use client';

import { addDays, differenceInDays, isSameDay } from 'date-fns';
import type { Schedule, ShiftPattern, Employee, Shift } from './types';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, DatabaseError } from '@/lib/errors';
import { differenceInHours, parseISO } from 'date-fns';
import { z } from 'zod';

export interface ValidationError {
  type: 'consecutive_days' | 'pattern_violation' | 'insufficient_rest';
  message: string;
  employeeId: string;
  date: string;
}

interface PatternConstraints {
  max_consecutive_days: number;
  min_rest_hours: number;
  max_weekly_hours: number;
  min_break_duration: number;
  max_daily_hours: number;
}

interface ValidationResult {
  isValid: boolean;
  details: {
    consecutive_days_valid: boolean;
    rest_hours_valid: boolean;
    weekly_hours_valid: boolean;
    daily_hours_valid: boolean;
  };
  metrics?: {
    validation_time_ms: number;
    pattern_id: string;
  };
}

// Zod schema for shift pattern
const ShiftPatternSchema = z.object({
  consecutive_days: z.number().int().min(1),
  rest_hours: z.number().min(0),
  weekly_hours: z.number().min(0),
  daily_hours: z.number().min(0),
  shifts: z.array(z.object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    break_duration: z.number().min(0)
  }))
});

export class PatternValidator {
  private supabase = createClient();
  private constraints: PatternConstraints | null = null;
  private readonly environment: string;

  constructor(environment: string = process.env.NODE_ENV || 'development') {
    this.environment = environment;
  }

  /**
   * Initialize pattern constraints from database
   */
  private async initializeConstraints(): Promise<void> {
    try {
      const { data: config, error } = await this.supabase.rpc(
        'get_scheduler_config',
        { 
          p_config_key: 'pattern_constraints',
          p_environment: this.environment
        }
      );

      if (error) {
        throw new DatabaseError(`Failed to get pattern constraints: ${error.message}`);
      }

      this.constraints = config as PatternConstraints;
    } catch (error) {
      logger.error('Failed to initialize pattern constraints', {
        error,
        context: 'PatternValidator.initializeConstraints'
      });
      throw new AppError('Failed to initialize pattern validator', 'VALIDATOR_INIT_ERROR');
    }
  }

  /**
   * Validate a shift pattern against the defined constraints
   */
  public async validatePattern(pattern: unknown, patternId: string): Promise<ValidationResult> {
    try {
      // Initialize constraints if not already done
      if (!this.constraints) {
        await this.initializeConstraints();
      }

      const startTime = performance.now();

      // Validate pattern structure
      const validatedPattern = ShiftPatternSchema.parse(pattern);

      // Perform pattern validation
      const validationDetails = await this.validateShiftPattern(validatedPattern);

      const validationTime = Math.round(performance.now() - startTime);

      // Record validation metrics
      await this.recordValidationMetrics(patternId, validationTime, validationDetails);

      return {
        isValid: Object.values(validationDetails).every(v => v),
        details: validationDetails,
        metrics: {
          validation_time_ms: validationTime,
          pattern_id: patternId
        }
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Invalid pattern structure', {
          error: error.errors,
          context: 'PatternValidator.validatePattern'
        });
        throw new AppError('Invalid pattern structure', 'PATTERN_VALIDATION_ERROR');
      }

      logger.error('Pattern validation failed', {
        error,
        context: 'PatternValidator.validatePattern'
      });
      throw new AppError('Failed to validate pattern', 'PATTERN_VALIDATION_ERROR');
    }
  }

  /**
   * Validate a shift pattern against constraints
   */
  private async validateShiftPattern(pattern: z.infer<typeof ShiftPatternSchema>) {
    const constraints = this.constraints!;
    
    // Validate consecutive days
    const consecutive_days_valid = pattern.consecutive_days <= constraints.max_consecutive_days;

    // Validate rest hours
    const rest_hours_valid = pattern.rest_hours >= constraints.min_rest_hours;

    // Validate weekly hours
    const weekly_hours_valid = pattern.weekly_hours <= constraints.max_weekly_hours;

    // Validate daily hours and breaks
    let daily_hours_valid = true;
    for (const shift of pattern.shifts) {
      const shiftStart = parseISO(shift.start_time);
      const shiftEnd = parseISO(shift.end_time);
      const shiftHours = differenceInHours(shiftEnd, shiftStart);

      if (shiftHours > constraints.max_daily_hours) {
        daily_hours_valid = false;
        break;
      }

      if (shift.break_duration < constraints.min_break_duration) {
        daily_hours_valid = false;
        break;
      }
    }

    return {
      consecutive_days_valid,
      rest_hours_valid,
      weekly_hours_valid,
      daily_hours_valid
    };
  }

  /**
   * Record validation metrics
   */
  private async recordValidationMetrics(
    patternId: string,
    validationTime: number,
    validationDetails: Record<string, boolean>
  ): Promise<void> {
    try {
      const isValid = Object.values(validationDetails).every(v => v);

      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: 'pattern_validation',
        p_metrics_value: {
          pattern_id: patternId,
          validation_time_ms: validationTime,
          validation_result: isValid,
          error_details: isValid ? null : validationDetails
        },
        p_environment: this.environment
      });
    } catch (error) {
      logger.error('Failed to record validation metrics', {
        error,
        context: 'PatternValidator.recordValidationMetrics'
      });
      // Don't throw here, as this is not critical for the validation process
    }
  }

  async validateAssignments(
    assignments: Schedule[],
    patterns: ShiftPattern[],
    employees: Employee[],
    shifts: Shift[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Group assignments by employee
    const employeeAssignments = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.employee_id]) {
        acc[assignment.employee_id] = [];
      }
      acc[assignment.employee_id].push(assignment);
      return acc;
    }, {} as Record<string, Schedule[]>);

    // Check each employee's assignments
    for (const [employeeId, employeeSchedules] of Object.entries(employeeAssignments)) {
      // Sort assignments by date
      const sortedSchedules = employeeSchedules.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Check consecutive days
      const consecutiveDaysErrors = this.checkConsecutiveDays(employeeId, sortedSchedules);
      errors.push(...consecutiveDaysErrors);

      // Check shift patterns
      const patternErrors = this.checkShiftPatterns(
        employeeId,
        sortedSchedules,
        patterns,
        shifts
      );
      errors.push(...patternErrors);

      // Check rest periods
      const restErrors = this.checkRestPeriods(
        employeeId,
        sortedSchedules,
        shifts
      );
      errors.push(...restErrors);
    }

    return errors;
  }

  private checkConsecutiveDays(
    employeeId: string,
    schedules: Schedule[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    let consecutiveDays = 1;
    let startDate = new Date(schedules[0]?.date || '');

    for (let i = 1; i < schedules.length; i++) {
      const currentDate = new Date(schedules[i].date);
      const prevDate = new Date(schedules[i - 1].date);
      
      if (differenceInDays(currentDate, prevDate) === 1) {
        consecutiveDays++;
        if (consecutiveDays > this.constraints!.max_consecutive_days) {
          errors.push({
            type: 'consecutive_days',
            message: `Employee has been scheduled for more than ${this.constraints!.max_consecutive_days} consecutive days`,
            employeeId,
            date: currentDate.toISOString().split('T')[0]
          });
        }
      } else {
        consecutiveDays = 1;
        startDate = currentDate;
      }
    }

    return errors;
  }

  private checkShiftPatterns(
    employeeId: string,
    schedules: Schedule[],
    patterns: ShiftPattern[],
    shifts: Shift[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for forbidden patterns
    const forbiddenPatterns = patterns.filter(p => p.is_forbidden);
    
    for (let i = 0; i < schedules.length - 1; i++) {
      const currentShift = shifts.find(s => s.id === schedules[i].shift_id);
      const nextShift = shifts.find(s => s.id === schedules[i + 1].shift_id);
      
      if (!currentShift || !nextShift) continue;

      forbiddenPatterns.forEach(pattern => {
        if (this.matchesPattern(currentShift, nextShift, pattern)) {
          errors.push({
            type: 'pattern_violation',
            message: `Forbidden shift pattern "${pattern.name}" detected`,
            employeeId,
            date: schedules[i].date
          });
        }
      });
    }

    return errors;
  }

  private checkRestPeriods(
    employeeId: string,
    schedules: Schedule[],
    shifts: Shift[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < schedules.length - 1; i++) {
      const currentShift = shifts.find(s => s.id === schedules[i].shift_id);
      const nextShift = shifts.find(s => s.id === schedules[i + 1].shift_id);
      
      if (!currentShift || !nextShift) continue;

      const currentEnd = new Date(`${schedules[i].date}T${currentShift.end_time}`);
      const nextStart = new Date(`${schedules[i + 1].date}T${nextShift.start_time}`);
      
      // Handle midnight crossing shifts
      if (currentShift.end_time < currentShift.start_time) {
        currentEnd.setDate(currentEnd.getDate() + 1);
      }
      if (nextShift.start_time < nextShift.end_time) {
        nextStart.setDate(nextStart.getDate() + 1);
      }

      const restHours = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60);
      
      if (restHours < this.constraints!.min_rest_hours) {
        errors.push({
          type: 'insufficient_rest',
          message: `Insufficient rest period (${restHours.toFixed(1)} hours) between shifts`,
          employeeId,
          date: schedules[i + 1].date
        });
      }
    }

    return errors;
  }

  private matchesPattern(
    currentShift: Shift,
    nextShift: Shift,
    pattern: ShiftPattern
  ): boolean {
    // Example pattern matching logic - can be expanded based on requirements
    const currentDuration = currentShift.duration_hours;
    const nextDuration = nextShift.duration_hours;
    
    // Check if the shift durations match the pattern
    return currentDuration === pattern.shift_duration && 
           nextDuration === pattern.shift_duration;
  }
} 