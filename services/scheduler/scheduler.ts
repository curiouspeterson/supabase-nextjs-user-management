import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, DatabaseError, ValidationError } from '@/lib/errors';
import { format, parseISO, addDays, isValid } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { z } from 'zod';
import { PatternValidator } from './pattern-validator';
import type { Schedule, Employee, Department, Shift, Pattern, PatternShift, TimeOffRequest } from './types';
import { EmployeeRole, ScheduleStatus, PatternType, ShiftDurationCategory, TimeOffStatus, TimeOffType } from './types';
import type { Database } from '@/types/supabase';
import crypto from 'crypto';

interface SchedulerConstraints {
  max_weekly_hours: number;
  max_consecutive_days: number;
  min_hours_between_shifts: number;
  max_daily_hours: number;
  max_overtime_hours: number;
  preferred_shift_length: number;
  max_shifts_per_day: number;
  optimization_timeout_ms: number;
  max_retry_attempts: number;
  retry_delay_ms: number;
}

interface GenerationMetrics {
  generation_time_ms: number;
  optimization_iterations: number;
  constraints_checked: number;
  errors_encountered: number;
  schedules_generated: number;
  patterns_used: number;
  shifts_generated: number;
  shifts_skipped: number;
  constraint_violations: Record<string, number>;
  employee_assignments: Record<string, number>;
  pattern_usage: Record<string, number>;
  time_off_conflicts: number;
  performance_metrics: Record<string, number>;
}

// Zod schema for schedule generation request
const ScheduleRequestSchema = z.object({
  department_id: z.string().uuid(),
  start_date: z.string().refine(val => isValid(parseISO(val)), {
    message: 'Invalid start date format'
  }),
  end_date: z.string().refine(val => isValid(parseISO(val)), {
    message: 'Invalid end date format'
  }),
  timezone: z.string().default('UTC')
});

export class Scheduler {
  private supabase = createClient();
  private patternValidator: PatternValidator;
  private constraints: SchedulerConstraints | null = null;
  private shifts: Shift[] = [];
  private readonly environment: string;
  private readonly retryOptions: {
    maxAttempts: number;
    delayMs: number;
  };

  constructor(
    environment: string = process.env.NODE_ENV || 'development',
    retryOptions = { maxAttempts: 3, delayMs: 1000 }
  ) {
    this.environment = environment;
    this.patternValidator = new PatternValidator(environment);
    this.retryOptions = retryOptions;
  }

  /**
   * Initialize scheduler constraints from database
   */
  private async initializeConstraints(): Promise<void> {
    try {
      const { data: config, error } = await this.supabase.rpc(
        'get_scheduler_config',
        { 
          p_config_key: 'scheduler_constraints',
          p_environment: this.environment
        }
      );

      if (error) {
        throw new DatabaseError(`Failed to get scheduler constraints: ${error.message}`);
      }

      if (!config || typeof config.config_value !== 'object') {
        throw new DatabaseError('Invalid scheduler constraints configuration');
      }

      // Extract constraints from config_value
      const constraintsData = config.config_value as Record<string, unknown>;
      
      this.constraints = {
        max_weekly_hours: Number(constraintsData.max_weekly_hours) || 40,
        max_consecutive_days: Number(constraintsData.max_consecutive_days) || 5,
        min_hours_between_shifts: Number(constraintsData.min_hours_between_shifts) || 8,
        max_daily_hours: Number(constraintsData.max_daily_hours) || 12,
        max_overtime_hours: Number(constraintsData.max_overtime_hours) || 10,
        preferred_shift_length: Number(constraintsData.preferred_shift_length) || 8,
        max_shifts_per_day: Number(constraintsData.max_shifts_per_day) || 2,
        optimization_timeout_ms: Number(constraintsData.optimization_timeout_ms) || 30000,
        max_retry_attempts: Number(constraintsData.max_retry_attempts) || 3,
        retry_delay_ms: Number(constraintsData.retry_delay_ms) || 1000
      };
    } catch (error) {
      logger.error('Failed to initialize scheduler constraints', {
        error,
        context: 'Scheduler.initializeConstraints'
      });
      throw new AppError('Failed to initialize scheduler', 'SCHEDULER_INIT_ERROR');
    }
  }

  private mapPatternType(type: string): PatternType {
    switch (type) {
      case '4x10':
        return PatternType.FOUR_BY_TEN;
      case '3x12_1x4':
        return PatternType.THREE_BY_TWELVE_ONE_BY_FOUR;
      default:
        return PatternType.CUSTOM;
    }
  }

  /**
   * Get available employees for a given date
   */
  private getAvailableEmployees(
    date: Date,
    employees: Employee[],
    timeOffRequests: TimeOffRequest[]
  ): Employee[] {
    if (!date || !(date instanceof Date)) {
      throw new ValidationError('Invalid date for availability check');
    }

    if (!employees || !Array.isArray(employees)) {
      throw new ValidationError('Invalid employees list');
    }

    if (!timeOffRequests || !Array.isArray(timeOffRequests)) {
      throw new ValidationError('Invalid time off requests');
    }

    return employees.filter(employee => {
      // Check if employee has time off on this date
      const hasTimeOff = timeOffRequests.some(request => {
        if (!request.start_date || !request.end_date) {
          throw new ValidationError(`Invalid time off request dates for request ${request.id}`);
        }

        const startDate = new Date(request.start_date);
        const endDate = new Date(request.end_date);
        const checkDate = new Date(date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new ValidationError(`Invalid time off request dates for request ${request.id}`);
        }

        return (
          request.employee_id === employee.id &&
          checkDate >= startDate &&
          checkDate <= endDate
        );
      });

      return !hasTimeOff;
    });
  }

  /**
   * Generate shifts for a pattern
   */
  private generateShifts(
    pattern: Pattern,
    employees: Employee[],
    timeOffRequests: TimeOffRequest[]
  ): Shift[] {
    const shifts: Shift[] = [];
    const patternShifts = pattern.pattern_shifts || pattern.shifts;

    if (!patternShifts || !Array.isArray(patternShifts)) {
      throw new ValidationError('Pattern has no valid shifts defined');
    }

    patternShifts.forEach(patternShift => {
      const shift: Shift = {
        id: crypto.randomUUID(),
        shift_type_id: patternShift.shift_type_id,
        start_time: patternShift.start_time,
        end_time: patternShift.end_time,
        duration_hours: patternShift.duration_hours,
        duration_category: patternShift.duration_category as ShiftDurationCategory,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      shifts.push(shift);
    });

    return shifts;
  }

  /**
   * Assign an employee to a shift
   */
  private assignEmployee(
    availableEmployees: Employee[],
    requiredRole: EmployeeRole,
    existingSchedules: Schedule[]
  ): string {
    if (!availableEmployees || availableEmployees.length === 0) {
      throw new ValidationError('No available employees for assignment');
    }

    if (!Object.values(EmployeeRole).includes(requiredRole)) {
      throw new ValidationError(`Invalid employee role: ${requiredRole}`);
    }

    // Filter employees by role
    const eligibleEmployees = availableEmployees.filter(
      emp => emp.employee_role === requiredRole
    );

    if (eligibleEmployees.length === 0) {
      throw new ValidationError(`No available employees with role ${requiredRole}`);
    }

    // Sort employees by number of assigned shifts (ascending)
    const sortedEmployees = [...eligibleEmployees].sort((a, b) => {
      const aShifts = existingSchedules.filter(s => s.employee_id === a.id).length;
      const bShifts = existingSchedules.filter(s => s.employee_id === b.id).length;
      return aShifts - bShifts;
    });

    // Return the ID of the employee with the least number of shifts
    return sortedEmployees[0].id;
  }

  /**
   * Generate a schedule for a department
   */
  public async generateSchedule(request: unknown): Promise<{
    schedule_id: string;
    metrics: GenerationMetrics;
  }> {
    const startTime = performance.now();
    let lastError: Error | null = null;
    let attempt = 0;

    try {
      // Initialize constraints if not already done
      if (!this.constraints) {
        await this.initializeConstraints();
      }

      // Validate request
      const validatedRequest = ScheduleRequestSchema.parse(request);
      const { department_id, start_date, end_date, timezone } = validatedRequest;

      // Convert dates to UTC
      const utcStartDate = toDate(parseISO(start_date), { timeZone: timezone });
      const utcEndDate = toDate(parseISO(end_date), { timeZone: timezone });

      // Start generation process with retry mechanism
      while (attempt < this.retryOptions.maxAttempts) {
        try {
          // Get employees for the department
          const { data: employees, error: employeesError } = await this.supabase
            .from('employees')
            .select(`
              id,
              employee_role,
              weekly_hours_scheduled,
              default_shift_type_id,
              created_at,
              updated_at,
              user_role,
              profiles (
                full_name,
                avatar_url,
                username
              )
            `)
            .eq('department_id', department_id)
            .eq('is_active', true)
            .order('employee_role');

          if (employeesError) throw new DatabaseError(`Failed to fetch employees: ${employeesError.message}`);
          if (!employees || employees.length === 0) {
            throw new ValidationError(`No active employees found for department ${department_id}`);
          }

          // Transform the employees data to match the Employee type
          const transformedEmployees: Employee[] = (employees || []).map(emp => ({
            id: emp.id,
            user_id: emp.id, // Using the same ID since profiles are 1:1 with employees
            employee_role: emp.employee_role === 'Dispatcher' ? EmployeeRole.DISPATCHER :
                         emp.employee_role === 'Shift Supervisor' ? EmployeeRole.SHIFT_SUPERVISOR :
                         EmployeeRole.MANAGEMENT,
            weekly_hours_scheduled: emp.weekly_hours_scheduled || 0,
            default_shift_type_id: emp.default_shift_type_id,
            created_at: emp.created_at,
            updated_at: emp.updated_at,
            full_name: emp.profiles?.full_name || undefined,
            avatar_url: emp.profiles?.avatar_url || undefined,
            username: emp.profiles?.username || undefined,
            user_role: emp.user_role === 'Admin' ? 'Admin' : 'Employee'
          }));

          // Get shift patterns
          type ShiftPatternRow = Database['public']['Tables']['shift_patterns']['Row'];
          type PatternShiftRow = Database['public']['Tables']['pattern_shifts']['Row'];
          
          interface ShiftPatternWithShifts extends Omit<ShiftPatternRow, 'pattern_shifts'> {
            pattern_shifts: Array<PatternShiftRow>;
          }

          const { data: patterns, error: patternsError } = await this.supabase
            .from('shift_patterns')
            .select(`
              id,
              name,
              pattern_type,
              days_on,
              days_off,
              shift_duration,
              created_at,
              updated_at,
              pattern_shifts (
                id,
                start_time,
                end_time,
                shift_type_id,
                duration_hours,
                duration_category,
                employee_role
              )
            `)
            .eq('department_id', department_id)
            .eq('is_active', true)
            .order('name') as { 
              data: ShiftPatternWithShifts[] | null, 
              error: Error | null 
            };

          if (patternsError) throw new DatabaseError(`Failed to fetch patterns: ${patternsError.message}`);
          if (!patterns || patterns.length === 0) {
            throw new ValidationError(`No active patterns found for department ${department_id}`);
          }

          // Transform the patterns data to match the Pattern type
          const transformedPatterns: Pattern[] = (patterns || []).map(pattern => {
            if (!pattern.pattern_shifts || pattern.pattern_shifts.length === 0) {
              throw new ValidationError(`Pattern ${pattern.id} has no shifts defined`);
            }

            // Validate each pattern shift
            pattern.pattern_shifts.forEach(shift => {
              if (!shift.start_time || !shift.end_time) {
                throw new ValidationError(`Pattern ${pattern.id} has invalid shift times`);
              }
              if (!shift.shift_type_id) {
                throw new ValidationError(`Pattern ${pattern.id} has invalid shift type`);
              }
              if (!shift.duration_hours || shift.duration_hours <= 0) {
                throw new ValidationError(`Pattern ${pattern.id} has invalid duration`);
              }
              if (!Object.values(EmployeeRole).includes(shift.employee_role as EmployeeRole)) {
                throw new ValidationError(`Pattern ${pattern.id} has invalid employee role`);
              }
            });

            return {
              id: pattern.id,
              name: pattern.name,
              pattern_type: this.mapPatternType(pattern.pattern_type),
              days_on: pattern.days_on,
              days_off: pattern.days_off,
              shift_duration: pattern.shift_duration,
              pattern_shifts: pattern.pattern_shifts.map(shift => ({
                start_time: shift.start_time,
                end_time: shift.end_time,
                shift_type_id: shift.shift_type_id,
                duration_hours: shift.duration_hours,
                duration_category: shift.duration_category as ShiftDurationCategory,
                employee_role: shift.employee_role as EmployeeRole
              })),
              shifts: [], // Keep this for backward compatibility
              created_at: pattern.created_at,
              updated_at: pattern.updated_at
            };
          });

          if (transformedPatterns.length === 0) {
            throw new ValidationError('No valid patterns found for department');
          }

          // Get time off requests for the period
          const { data: timeOffRequests, error: timeOffError } = await this.supabase
            .from('time_off_requests')
            .select('*')
            .eq('status', TimeOffStatus.APPROVED)
            .in('employee_id', employees.map(e => e.id))
            .gte('start_date', format(utcStartDate, 'yyyy-MM-dd'))
            .lte('end_date', format(utcEndDate, 'yyyy-MM-dd'))
            .order('start_date');

          if (timeOffError) throw new DatabaseError(`Failed to fetch time off requests: ${timeOffError.message}`);

          // Transform time off requests to match our interface
          const transformedTimeOffRequests: TimeOffRequest[] = (timeOffRequests || []).map(request => ({
            id: request.id,
            employee_id: request.employee_id,
            start_date: request.start_date,
            end_date: request.end_date,
            type: request.type as TimeOffType,
            notes: request.notes,
            status: request.status as TimeOffStatus,
            submitted_at: request.submitted_at,
            reviewed_at: request.reviewed_at,
            reviewed_by: request.reviewed_by,
            created_at: request.created_at,
            updated_at: request.updated_at
          }));

          // Generate schedules
          const schedules: Schedule[] = [];
          const currentDate = new Date(utcStartDate);
          const endDate = new Date(utcEndDate);

          while (currentDate <= endDate) {
            // Get available employees for this day
            const availableEmployees = this.getAvailableEmployees(
              currentDate,
              transformedEmployees,
              transformedTimeOffRequests
            );

            // Generate shifts for each pattern
            for (const pattern of transformedPatterns) {
              const shifts = this.generateShifts(pattern, availableEmployees, transformedTimeOffRequests);
              
              // Create schedules for each shift
              for (const shift of shifts) {
                const employeeRole = pattern.pattern_shifts?.find(
                  ps => ps.shift_type_id === shift.shift_type_id
                )?.employee_role || EmployeeRole.DISPATCHER;

                const schedule: Schedule = {
                  id: crypto.randomUUID(),
                  date: format(currentDate, 'yyyy-MM-dd'),
                  employee_id: this.assignEmployee(
                    availableEmployees,
                    employeeRole,
                    schedules
                  ),
                  shift_id: shift.id,
                  status: ScheduleStatus.DRAFT,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };

                // Check constraints before adding the schedule
                const employee = transformedEmployees.find(e => e.id === schedule.employee_id);
                if (!employee) {
                  throw new ValidationError(`Employee ${schedule.employee_id} not found`);
                }

                const { isValid, violations } = this.checkConstraints(
                  schedule,
                  schedules,
                  employee,
                  shift
                );

                if (!isValid) {
                  logger.warn('Schedule violates constraints', {
                    schedule,
                    violations,
                    context: 'Scheduler.generateSchedule'
                  });
                  continue; // Skip this schedule and try the next one
                }

                schedules.push(schedule);
                this.shifts.push(shift);
              }
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }

          if (schedules.length === 0) {
            throw new ValidationError('No valid schedules could be generated');
          }

          // Start a transaction
          const { error: transactionError } = await this.supabase.rpc('begin_transaction');

          if (transactionError) {
            throw new DatabaseError(`Failed to start transaction: ${transactionError.message}`);
          }

          try {
            // Helper function to validate duration category
            function validateDurationCategory(category: unknown): ShiftDurationCategory | null {
              if (category === '4 hours' || category === '10 hours' || category === '12 hours') {
                return category;
              }
              return null;
            }

            // Insert shifts first
            const shifts = schedules.reduce((acc, schedule) => {
              const shift = this.shifts.find(s => s.id === schedule.shift_id);
              if (shift) {
                acc.push({
                  id: schedule.shift_id,
                  shift_type_id: shift.shift_type_id,
                  start_time: shift.start_time,
                  end_time: shift.end_time,
                  duration_hours: shift.duration_hours,
                  duration_category: validateDurationCategory(shift.duration_category),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
              return acc;
            }, [] as Array<{
              id: string;
              shift_type_id: string;
              start_time: string;
              end_time: string;
              duration_hours: number;
              duration_category: ShiftDurationCategory | null;
              created_at: string;
              updated_at: string;
            }>);

            const { error: shiftsError } = await this.supabase
              .from('shifts')
              .insert(shifts)
              .select();

            if (shiftsError) {
              throw new DatabaseError(`Failed to insert shifts: ${shiftsError.message}`);
            }

            // Insert schedules
            const { error: schedulesError } = await this.supabase
              .from('schedules')
              .insert(schedules)
              .select();

            if (schedulesError) {
              throw new DatabaseError(`Failed to insert schedules: ${schedulesError.message}`);
            }

            // Commit transaction
            const { error: commitError } = await this.supabase.rpc('commit_transaction');
            if (commitError) {
              throw new DatabaseError(`Failed to commit transaction: ${commitError.message}`);
            }

          } catch (error) {
            // Rollback transaction on error
            const { error: rollbackError } = await this.supabase.rpc('rollback_transaction');
            if (rollbackError) {
              logger.error('Failed to rollback transaction', {
                error: rollbackError,
                context: 'Scheduler.generateSchedule.rollback'
              });
            }
            throw error;
          }

          // Record success metrics
          const metrics: GenerationMetrics = {
            generation_time_ms: performance.now() - startTime,
            optimization_iterations: 1,
            constraints_checked: schedules.length,
            errors_encountered: 0,
            schedules_generated: schedules.length,
            patterns_used: transformedPatterns.length,
            shifts_generated: this.shifts.length,
            shifts_skipped: 0,
            constraint_violations: {
              weekly_hours: 0,
              consecutive_days: 0,
              hours_between_shifts: 0,
              daily_hours: 0
            },
            employee_assignments: Object.values(EmployeeRole).reduce((acc, role) => {
              acc[role] = schedules.filter(s => {
                const shift = this.shifts.find(sh => sh.id === s.shift_id);
                const pattern = transformedPatterns.find(p => 
                  p.pattern_shifts?.some(ps => ps.shift_type_id === shift?.shift_type_id)
                );
                return pattern?.pattern_shifts?.some(ps => ps.employee_role === role);
              }).length;
              return acc;
            }, {} as Record<string, number>),
            pattern_usage: transformedPatterns.reduce((acc, pattern) => {
              acc[pattern.name] = schedules.filter(s => {
                const shift = this.shifts.find(sh => sh.id === s.shift_id);
                return pattern.pattern_shifts?.some(ps => ps.shift_type_id === shift?.shift_type_id);
              }).length;
              return acc;
            }, {} as Record<string, number>),
            time_off_conflicts: 0,
            performance_metrics: {
              database_time_ms: 0,
              constraint_check_time_ms: 0,
              assignment_time_ms: 0,
              transaction_time_ms: 0
            }
          };

          await this.recordGenerationMetrics('success', metrics);

          return {
            schedule_id: schedules[0]?.id || crypto.randomUUID(),
            metrics
          };

        } catch (error) {
          lastError = error as Error;
          const retryableError = error instanceof DatabaseError || 
            (error instanceof Error && error.message.includes('deadlock'));

          if (!retryableError) {
            // Don't retry validation errors or other non-retryable errors
            throw error;
          }

          logger.warn(`Schedule generation attempt ${attempt + 1} failed`, {
            error,
            context: 'Scheduler.generateSchedule',
            attempt: attempt + 1,
            maxAttempts: this.retryOptions.maxAttempts,
            retryDelay: this.retryOptions.delayMs
          });

          // Record failure metrics
          const metrics: GenerationMetrics = {
            generation_time_ms: performance.now() - startTime,
            optimization_iterations: attempt + 1,
            constraints_checked: 0,
            errors_encountered: attempt + 1,
            schedules_generated: 0,
            patterns_used: 0,
            shifts_generated: 0,
            shifts_skipped: 0,
            constraint_violations: {
              weekly_hours: 0,
              consecutive_days: 0,
              hours_between_shifts: 0,
              daily_hours: 0
            },
            employee_assignments: {},
            pattern_usage: {},
            time_off_conflicts: 0,
            performance_metrics: {
              database_time_ms: 0,
              constraint_check_time_ms: 0,
              assignment_time_ms: 0,
              transaction_time_ms: 0
            }
          };

          await this.recordGenerationMetrics('failure', metrics);

          if (attempt + 1 === this.retryOptions.maxAttempts) {
            throw new AppError(
              `Failed to generate schedule after ${this.retryOptions.maxAttempts} attempts`,
              'MAX_RETRIES_EXCEEDED'
            );
          }

          // Wait before retrying with exponential backoff
          const backoffDelay = this.retryOptions.delayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          attempt++;
        }
      }

      // This should never be reached due to the throw in the retry loop
      throw new Error('Unexpected end of retry loop');

    } catch (error) {
      const totalTime = performance.now() - startTime;

      if (error instanceof z.ZodError) {
        logger.error('Invalid schedule generation request', {
          error: error.errors,
          context: 'Scheduler.generateSchedule',
          totalTime
        });
        throw new ValidationError('Invalid schedule generation request');
      }

      if (error instanceof ValidationError) {
        logger.error('Schedule generation validation failed', {
          error,
          context: 'Scheduler.generateSchedule',
          totalTime
        });
        throw error;
      }

      if (error instanceof DatabaseError) {
        logger.error('Schedule generation database error', {
          error,
          context: 'Scheduler.generateSchedule',
          totalTime,
          attempt
        });
        throw error;
      }

      logger.error('Schedule generation failed', {
        error,
        context: 'Scheduler.generateSchedule',
        totalTime,
        attempt
      });
      throw new AppError('Failed to generate schedule', 'SCHEDULE_GENERATION_ERROR');
    }
  }

  /**
   * Record generation metrics
   */
  private async recordGenerationMetrics(
    status: 'success' | 'failure',
    metrics: GenerationMetrics
  ): Promise<void> {
    try {
      // Convert metrics to a JSON-serializable object
      const metricsValue = {
        ...metrics,
        constraint_violations: { ...metrics.constraint_violations },
        employee_assignments: { ...metrics.employee_assignments },
        pattern_usage: { ...metrics.pattern_usage },
        performance_metrics: { ...metrics.performance_metrics }
      };

      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: `schedule_generation_${status}`,
        p_metrics_value: metricsValue,
        p_environment: this.environment,
        p_measured_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to record scheduler metrics', {
        error,
        context: 'Scheduler.recordGenerationMetrics'
      });
    }
  }

  /**
   * Check if adding this schedule would violate any constraints
   */
  private checkConstraints(
    schedule: Schedule,
    existingSchedules: Schedule[],
    employee: Employee,
    shift: Shift
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    const scheduleDate = new Date(schedule.date);

    // Check weekly hours
    const weekStart = new Date(scheduleDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of week

    const weeklySchedules = existingSchedules.filter(s => {
      const date = new Date(s.date);
      return (
        s.employee_id === employee.id &&
        date >= weekStart &&
        date <= weekEnd
      );
    });

    const totalHours = weeklySchedules.reduce((total, s) => {
      const shiftHours = this.getShiftDuration(s.shift_id);
      return total + shiftHours;
    }, shift.duration_hours);

    if (totalHours > (this.constraints?.max_weekly_hours || 40)) {
      violations.push(`Weekly hours (${totalHours}) exceeds maximum (${this.constraints?.max_weekly_hours || 40})`);
    }

    // Check consecutive days
    const consecutiveDays = this.getConsecutiveWorkDays(schedule, existingSchedules, employee.id);
    if (consecutiveDays > (this.constraints?.max_consecutive_days || 5)) {
      violations.push(`Consecutive days (${consecutiveDays}) exceeds maximum (${this.constraints?.max_consecutive_days || 5})`);
    }

    // Check hours between shifts
    const previousShift = this.getPreviousShift(schedule, existingSchedules, employee.id);
    if (previousShift) {
      const hoursBetween = this.getHoursBetweenShifts(previousShift, shift);
      if (hoursBetween < (this.constraints?.min_hours_between_shifts || 8)) {
        violations.push(`Hours between shifts (${hoursBetween}) is less than minimum (${this.constraints?.min_hours_between_shifts || 8})`);
      }
    }

    // Check daily hours
    const dailySchedules = existingSchedules.filter(s => 
      s.employee_id === employee.id && s.date === schedule.date
    );
    const dailyHours = dailySchedules.reduce((total, s) => {
      const shiftHours = this.getShiftDuration(s.shift_id);
      return total + shiftHours;
    }, shift.duration_hours);

    if (dailyHours > (this.constraints?.max_daily_hours || 12)) {
      violations.push(`Daily hours (${dailyHours}) exceeds maximum (${this.constraints?.max_daily_hours || 12})`);
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Get the duration of a shift in hours
   */
  private getShiftDuration(shiftId: string): number {
    const shift = this.shifts.find(s => s.id === shiftId);
    return shift?.duration_hours || 0;
  }

  /**
   * Get the number of consecutive work days including this schedule
   */
  private getConsecutiveWorkDays(
    schedule: Schedule,
    existingSchedules: Schedule[],
    employeeId: string
  ): number {
    const scheduleDate = new Date(schedule.date);
    let consecutiveDays = 1;
    let currentDate = new Date(scheduleDate);

    // Check backward
    currentDate.setDate(currentDate.getDate() - 1);
    while (this.hasShiftOnDate(currentDate, existingSchedules, employeeId)) {
      consecutiveDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Check forward
    currentDate = new Date(scheduleDate);
    currentDate.setDate(currentDate.getDate() + 1);
    while (this.hasShiftOnDate(currentDate, existingSchedules, employeeId)) {
      consecutiveDays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return consecutiveDays;
  }

  /**
   * Check if an employee has a shift on a specific date
   */
  private hasShiftOnDate(
    date: Date,
    schedules: Schedule[],
    employeeId: string
  ): boolean {
    return schedules.some(s =>
      s.employee_id === employeeId &&
      s.date === format(date, 'yyyy-MM-dd')
    );
  }

  /**
   * Get the previous shift for an employee
   */
  private getPreviousShift(
    schedule: Schedule,
    existingSchedules: Schedule[],
    employeeId: string
  ): Shift | null {
    const scheduleDate = new Date(schedule.date);
    const previousSchedules = existingSchedules
      .filter(s => 
        s.employee_id === employeeId &&
        new Date(s.date) <= scheduleDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (previousSchedules.length === 0) return null;

    const previousSchedule = previousSchedules[0];
    return this.shifts.find(s => s.id === previousSchedule.shift_id) || null;
  }

  /**
   * Calculate hours between two shifts
   */
  private getHoursBetweenShifts(previousShift: Shift, nextShift: Shift): number {
    const previousEnd = new Date(previousShift.end_time);
    const nextStart = new Date(nextShift.start_time);
    return (nextStart.getTime() - previousEnd.getTime()) / (1000 * 60 * 60);
  }
}