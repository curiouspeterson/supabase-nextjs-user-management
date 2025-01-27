import {
  Employee,
  ShiftPattern,
  EmployeePattern,
  Shift,
  StaffingRequirement,
  ScheduleAssignment
} from './types';
import {
  getHoursBetween,
  doTimeRangesOverlap,
  getConsecutiveWorkingDays,
  groupDatesByWeek
} from './date-utils';
import { parseTimeToMs, formatMsToTime } from './date-utils';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { addDays, differenceInHours, isAfter, isBefore } from 'date-fns';

// Error codes for validation
export enum ValidationErrorCode {
  INSUFFICIENT_REST = 'INSUFFICIENT_REST',
  PATTERN_MISMATCH = 'PATTERN_MISMATCH',
  OVERTIME_VIOLATION = 'OVERTIME_VIOLATION',
  CONSECUTIVE_DAYS = 'CONSECUTIVE_DAYS',
  INVALID_SHIFT_TIME = 'INVALID_SHIFT_TIME',
  SHIFT_OVERLAP = 'SHIFT_OVERLAP',
  INSUFFICIENT_STAFF = 'INSUFFICIENT_STAFF',
  SUPERVISOR_REQUIRED = 'SUPERVISOR_REQUIRED'
}

// Structured validation error
export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  details?: Record<string, any>;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Calculate rest hours between shifts, properly handling overnight shifts
 */
export function calculateRestHours(
  currentShift: Shift,
  nextShift: Shift,
  timezone: string = 'UTC'
): number {
  const currentDate = utcToZonedTime(currentShift.date, timezone);
  const nextDate = utcToZonedTime(nextShift.date, timezone);
  
  // Convert times to full datetime
  let currentEnd = new Date(currentDate);
  let nextStart = new Date(nextDate);
  
  const [currentEndHours, currentEndMinutes] = currentShift.endTime.split(':').map(Number);
  const [nextStartHours, nextStartMinutes] = nextShift.startTime.split(':').map(Number);
  
  currentEnd.setHours(currentEndHours, currentEndMinutes, 0, 0);
  nextStart.setHours(nextStartHours, nextStartMinutes, 0, 0);
  
  // Handle overnight shifts
  if (currentEndHours > nextStartHours || 
     (currentEndHours === nextStartHours && currentEndMinutes > nextStartMinutes)) {
    currentEnd = addDays(currentEnd, 1);
  }
  
  // Calculate hours between shifts
  const restHours = differenceInHours(nextStart, currentEnd);
  return Math.max(0, restHours);
}

/**
 * Validate rest hours between shifts
 */
export function validateRestHours(
  shifts: Shift[],
  minRestHours: number,
  timezone: string = 'UTC'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  const sortedShifts = [...shifts].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (let i = 0; i < sortedShifts.length - 1; i++) {
    const currentShift = sortedShifts[i];
    const nextShift = sortedShifts[i + 1];
    
    const restHours = calculateRestHours(currentShift, nextShift, timezone);
    
    if (restHours < minRestHours) {
      result.isValid = false;
      result.errors.push({
        code: ValidationErrorCode.INSUFFICIENT_REST,
        message: `Insufficient rest period (${restHours} hours) between shifts`,
        details: {
          currentShift,
          nextShift,
          actualRestHours: restHours,
          requiredRestHours: minRestHours
        }
      });
    } else if (restHours < minRestHours + 2) {
      result.warnings.push({
        code: ValidationErrorCode.INSUFFICIENT_REST,
        message: `Rest period (${restHours} hours) is close to minimum requirement`,
        details: {
          currentShift,
          nextShift,
          actualRestHours: restHours,
          requiredRestHours: minRestHours
        }
      });
    }
  }
  
  return result;
}

/**
 * Validate pattern compliance
 */
export function validatePatternCompliance(
  shifts: Shift[],
  pattern: ShiftPattern,
  timezone: string = 'UTC'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Sort shifts by date
  const sortedShifts = [...shifts].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Group shifts by day
  const shiftsByDay = sortedShifts.reduce((acc, shift) => {
    const date = new Date(shift.date).toISOString().split('T')[0];
    acc[date] = acc[date] || [];
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);
  
  // Check pattern sequence
  let patternIndex = 0;
  const dates = Object.keys(shiftsByDay).sort();
  
  for (const date of dates) {
    const dayShifts = shiftsByDay[date];
    const expectedPattern = pattern.pattern[patternIndex];
    
    // Check if day's shifts match pattern
    const matchesPattern = dayShifts.some(shift => {
      const shiftSpan = `${shift.startTime}-${shift.endTime}`;
      return expectedPattern.includes(shiftSpan);
    });
    
    if (!matchesPattern) {
      result.isValid = false;
      result.errors.push({
        code: ValidationErrorCode.PATTERN_MISMATCH,
        message: `Shifts on ${date} do not match expected pattern`,
        details: {
          date,
          shifts: dayShifts,
          expectedPattern,
          patternIndex
        }
      });
    }
    
    patternIndex = (patternIndex + 1) % pattern.pattern.length;
  }
  
  // Check consecutive days
  let consecutiveDays = 1;
  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const prevDate = new Date(dates[i - 1]);
    
    if (differenceInHours(currentDate, prevDate) <= 24) {
      consecutiveDays++;
      
      if (consecutiveDays > pattern.maxConsecutiveDays) {
        result.isValid = false;
        result.errors.push({
          code: ValidationErrorCode.CONSECUTIVE_DAYS,
          message: `Maximum consecutive days exceeded`,
          details: {
            consecutiveDays,
            maxAllowed: pattern.maxConsecutiveDays,
            startDate: dates[i - consecutiveDays + 1],
            endDate: dates[i]
          }
        });
      }
    } else {
      consecutiveDays = 1;
    }
  }
  
  return result;
}

/**
 * Validate shift overlaps
 */
export function validateShiftOverlaps(
  shifts: Shift[],
  timezone: string = 'UTC'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Group shifts by employee
  const shiftsByEmployee = shifts.reduce((acc, shift) => {
    acc[shift.employeeId] = acc[shift.employeeId] || [];
    acc[shift.employeeId].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);
  
  // Check overlaps for each employee
  for (const [employeeId, employeeShifts] of Object.entries(shiftsByEmployee)) {
    const sortedShifts = [...employeeShifts].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (let i = 0; i < sortedShifts.length - 1; i++) {
      for (let j = i + 1; j < sortedShifts.length; j++) {
        const shift1 = sortedShifts[i];
        const shift2 = sortedShifts[j];
        
        if (doTimeRangesOverlap(
          shift1.startTime,
          shift1.endTime,
          shift2.startTime,
          shift2.endTime
        )) {
          result.isValid = false;
          result.errors.push({
            code: ValidationErrorCode.SHIFT_OVERLAP,
            message: `Overlapping shifts detected for employee`,
            details: {
              employeeId,
              shift1,
              shift2
            }
          });
        }
      }
    }
  }
  
  return result;
}

/**
 * Comprehensive shift validation
 */
export function validateShifts(
  shifts: Shift[],
  pattern: ShiftPattern,
  timezone: string = 'UTC'
): ValidationResult {
  const results: ValidationResult[] = [
    validateRestHours(shifts, pattern.minRestHours, timezone),
    validatePatternCompliance(shifts, pattern, timezone),
    validateShiftOverlaps(shifts, timezone)
  ];
  
  // Combine all validation results
  return results.reduce((acc, result) => ({
    isValid: acc.isValid && result.isValid,
    errors: [...acc.errors, ...result.errors],
    warnings: [...acc.warnings, ...result.warnings]
  }), {
    isValid: true,
    errors: [],
    warnings: []
  });
}

/**
 * Validate consecutive working days
 */
export function validateConsecutiveDays(
  assignments: ScheduleAssignment[],
  maximumConsecutiveDays: number,
  timezone: string = 'UTC'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Group assignments by employee
  const assignmentsByEmployee = assignments.reduce((acc, curr) => {
    acc[curr.employeeId] = acc[curr.employeeId] || [];
    acc[curr.employeeId].push(curr);
    return acc;
  }, {} as Record<string, ScheduleAssignment[]>);

  // Check each employee's assignments
  Object.entries(assignmentsByEmployee).forEach(([employeeId, employeeAssignments]) => {
    const dates = employeeAssignments.map(a => utcToZonedTime(a.date, timezone));
    const consecutiveDays = getConsecutiveWorkingDays(dates);
    
    if (consecutiveDays > maximumConsecutiveDays) {
      result.isValid = false;
      result.errors.push({
        code: ValidationErrorCode.CONSECUTIVE_DAYS,
        message: `Employee has exceeded maximum consecutive working days`,
        details: {
          employeeId,
          consecutiveDays,
          maximumConsecutiveDays,
          dates: dates.map(d => d.toISOString())
        }
      });
    } else if (consecutiveDays === maximumConsecutiveDays) {
      result.warnings.push({
        code: ValidationErrorCode.CONSECUTIVE_DAYS,
        message: `Employee is at maximum consecutive working days`,
        details: {
          employeeId,
          consecutiveDays,
          maximumConsecutiveDays,
          dates: dates.map(d => d.toISOString())
        }
      });
    }
  });

  return result;
}

/**
 * Validate staffing requirements
 */
export function validateStaffingRequirements(
  assignments: ScheduleAssignment[],
  employees: Employee[],
  shifts: Shift[],
  staffingRequirements: StaffingRequirement[],
  timezone: string = 'UTC'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Group assignments by date
  const assignmentsByDate = assignments.reduce((acc, curr) => {
    const dateKey = utcToZonedTime(curr.date, timezone).toISOString().split('T')[0];
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(curr);
    return acc;
  }, {} as Record<string, ScheduleAssignment[]>);

  // Check each date's staffing requirements
  Object.entries(assignmentsByDate).forEach(([dateStr, dateAssignments]) => {
    staffingRequirements.forEach(requirement => {
      // Count employees working during the requirement period
      let totalEmployees = 0;
      let supervisorPresent = false;

      dateAssignments.forEach(assignment => {
        const shift = shifts.find(s => s.id === assignment.shiftId);
        const employee = employees.find(e => e.id === assignment.employeeId);
        
        if (shift && employee) {
          if (doTimeRangesOverlap(
            requirement.startTime,
            requirement.endTime,
            shift.startTime,
            shift.endTime
          )) {
            totalEmployees++;
            if (employee.employeeRole === 'SUPERVISOR') {
              supervisorPresent = true;
            }
          }
        }
      });

      // Check minimum staffing
      if (totalEmployees < requirement.minimumEmployees) {
        result.isValid = false;
        result.errors.push({
          code: ValidationErrorCode.INSUFFICIENT_STAFF,
          message: `Insufficient staffing during required period`,
          details: {
            date: dateStr,
            period: {
              start: requirement.startTime,
              end: requirement.endTime,
              name: requirement.periodName
            },
            actualCount: totalEmployees,
            requiredCount: requirement.minimumEmployees
          }
        });
      }

      // Check supervisor requirement
      if (requirement.shiftSupervisorRequired && !supervisorPresent) {
        result.isValid = false;
        result.errors.push({
          code: ValidationErrorCode.SUPERVISOR_REQUIRED,
          message: `No supervisor present during required period`,
          details: {
            date: dateStr,
            period: {
              start: requirement.startTime,
              end: requirement.endTime,
              name: requirement.periodName
            }
          }
        });
      }
    });
  });

  return result;
}

/**
 * Validate weekly hours
 */
export function validateWeeklyHours(
  assignments: ScheduleAssignment[],
  employees: Employee[],
  shifts: Shift[],
  timezone: string = 'UTC'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Group assignments by employee
  const assignmentsByEmployee = assignments.reduce((acc, curr) => {
    acc[curr.employeeId] = acc[curr.employeeId] || [];
    acc[curr.employeeId].push(curr);
    return acc;
  }, {} as Record<string, ScheduleAssignment[]>);

  // Check each employee's weekly hours
  Object.entries(assignmentsByEmployee).forEach(([employeeId, employeeAssignments]) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const weeklyAssignments = groupDatesByWeek(
      employeeAssignments.map(a => utcToZonedTime(a.date, timezone))
    );
    
    Object.entries(weeklyAssignments).forEach(([weekStart, weekDates]) => {
      let totalHours = 0;
      
      weekDates.forEach(date => {
        const assignment = employeeAssignments.find(
          a => utcToZonedTime(a.date, timezone).toISOString().split('T')[0] === 
             date.toISOString().split('T')[0]
        );
        if (assignment) {
          const shift = shifts.find(s => s.id === assignment.shiftId);
          if (shift) {
            totalHours += shift.durationHours;
          }
        }
      });

      if (totalHours > employee.weeklyHoursScheduled) {
        result.isValid = false;
        result.errors.push({
          code: ValidationErrorCode.OVERTIME_VIOLATION,
          message: `Employee exceeds scheduled weekly hours`,
          details: {
            employeeId,
            weekStart,
            totalHours,
            scheduledHours: employee.weeklyHoursScheduled,
            dates: weekDates.map(d => d.toISOString())
          }
        });
      } else if (totalHours < employee.weeklyHoursScheduled) {
        result.warnings.push({
          code: ValidationErrorCode.OVERTIME_VIOLATION,
          message: `Employee is under scheduled weekly hours`,
          details: {
            employeeId,
            weekStart,
            totalHours,
            scheduledHours: employee.weeklyHoursScheduled,
            dates: weekDates.map(d => d.toISOString())
          }
        });
      }
    });
  });

  return result;
}

/**
 * Validate pattern compliance
 */
export function validatePatternCompliance(
  assignments: ScheduleAssignment[],
  employeePatterns: EmployeePattern[],
  patterns: ShiftPattern[],
  shifts: Shift[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Group assignments by employee
  const assignmentsByEmployee = assignments.reduce((acc, curr) => {
    acc[curr.employeeId] = acc[curr.employeeId] || [];
    acc[curr.employeeId].push(curr);
    return acc;
  }, {} as Record<string, ScheduleAssignment[]>);
    
  // Check each employee's pattern compliance
  Object.entries(assignmentsByEmployee).forEach(([employeeId, employeeAssignments]) => {
    const employeePattern = employeePatterns.find(ep => ep.employeeId === employeeId);
    if (!employeePattern) return;
  
    const pattern = patterns.find(p => p.id === employeePattern.patternId);
    if (!pattern) return;
    
    // Group assignments by week
    const weeklyAssignments = groupDatesByWeek(employeeAssignments.map(a => a.date));
      
    Object.entries(weeklyAssignments).forEach(([weekStart, weekDates]) => {
      // Check number of working days
      if (weekDates.length !== pattern.daysOn) {
        result.isValid = false;
        result.errors.push(
          `Employee ${employeeId} is scheduled for ${weekDates.length} days in week of ${weekStart} ` +
          `(pattern requires ${pattern.daysOn} days)`
        );
      }

      // Check shift durations
      weekDates.forEach(date => {
        const assignment = employeeAssignments.find(
          a => a.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
        );
        if (assignment) {
          const shift = shifts.find(s => s.id === assignment.shiftId);
          if (shift && shift.durationHours !== pattern.shiftDuration) {
            result.isValid = false;
            result.errors.push(
              `Employee ${employeeId} is scheduled for ${shift.durationHours}-hour shift on ${date.toISOString().split('T')[0]} ` +
              `(pattern requires ${pattern.shiftDuration}-hour shifts)`
            );
          }
        }
      });
    });
  });
  
  return result;
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  return results.reduce(
    (acc, curr) => ({
      isValid: acc.isValid && curr.isValid,
      errors: [...acc.errors, ...curr.errors],
      warnings: [...acc.warnings, ...curr.warnings]
    }),
    { isValid: true, errors: [], warnings: [] }
  );
}

/**
 * Validate an entire schedule
 */
export function validateSchedule(
  assignments: ScheduleAssignment[],
  employees: Employee[],
  employeePatterns: EmployeePattern[],
  patterns: ShiftPattern[],
  shifts: Shift[],
  staffingRequirements: StaffingRequirement[],
  options: {
    minimumRestHours: number;
    maximumConsecutiveDays: number;
    timezone?: string;
  }
): ValidationResult {
  const timezone = options.timezone || 'UTC';
  
  return combineValidationResults(
    validateRestHours(shifts, options.minimumRestHours, timezone),
    validateConsecutiveDays(assignments, options.maximumConsecutiveDays, timezone),
    validateStaffingRequirements(assignments, employees, shifts, staffingRequirements, timezone),
    validateWeeklyHours(assignments, employees, shifts, timezone),
    validateShifts(shifts, patterns[0], timezone)
  );
} 