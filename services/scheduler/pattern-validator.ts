'use client';

import { addDays, differenceInDays, isSameDay } from 'date-fns';
import type { Schedule, ShiftPattern, Employee, Shift } from './types';

export interface ValidationError {
  type: 'consecutive_days' | 'pattern_violation' | 'insufficient_rest';
  message: string;
  employeeId: string;
  date: string;
}

export class PatternValidator {
  private readonly MAX_CONSECUTIVE_DAYS = 6;
  private readonly MIN_REST_HOURS = 10;

  constructor() {}

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
        if (consecutiveDays > this.MAX_CONSECUTIVE_DAYS) {
          errors.push({
            type: 'consecutive_days',
            message: `Employee has been scheduled for more than ${this.MAX_CONSECUTIVE_DAYS} consecutive days`,
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
      
      if (restHours < this.MIN_REST_HOURS) {
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