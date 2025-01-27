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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate rest hours between shifts for an employee
 */
export function validateRestHours(
  assignments: ScheduleAssignment[],
  shifts: Shift[],
  minimumRestHours: number
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
    const sortedAssignments = employeeAssignments.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    for (let i = 1; i < sortedAssignments.length; i++) {
      const prevAssignment = sortedAssignments[i - 1];
      const currAssignment = sortedAssignments[i];
      
      const prevShift = shifts.find(s => s.id === prevAssignment.shiftId);
      const currShift = shifts.find(s => s.id === currAssignment.shiftId);
      
      if (prevShift && currShift) {
        const prevEnd = new Date(prevAssignment.date);
        prevEnd.setHours(
          parseInt(prevShift.endTime.split(':')[0]),
          parseInt(prevShift.endTime.split(':')[1])
        );

        const currStart = new Date(currAssignment.date);
        currStart.setHours(
          parseInt(currShift.startTime.split(':')[0]),
          parseInt(currShift.startTime.split(':')[1])
        );

        const restHours = getHoursBetween(prevEnd, currStart);
        
        if (restHours < minimumRestHours) {
          result.isValid = false;
          result.errors.push(
            `Employee ${employeeId} has insufficient rest between shifts: ${restHours} hours (minimum: ${minimumRestHours})`
          );
        } else if (restHours < minimumRestHours + 2) {
          result.warnings.push(
            `Employee ${employeeId} has minimal rest between shifts: ${restHours} hours`
          );
        }
      }
    }
  });

  return result;
}

/**
 * Validate consecutive working days
 */
export function validateConsecutiveDays(
  assignments: ScheduleAssignment[],
  maximumConsecutiveDays: number
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
    const dates = employeeAssignments.map(a => a.date);
    const consecutiveDays = getConsecutiveWorkingDays(dates);
    
    if (consecutiveDays > maximumConsecutiveDays) {
      result.isValid = false;
      result.errors.push(
        `Employee ${employeeId} has ${consecutiveDays} consecutive working days (maximum: ${maximumConsecutiveDays})`
      );
    } else if (consecutiveDays === maximumConsecutiveDays) {
      result.warnings.push(
        `Employee ${employeeId} is working ${consecutiveDays} consecutive days`
      );
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
  staffingRequirements: StaffingRequirement[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Group assignments by date
  const assignmentsByDate = assignments.reduce((acc, curr) => {
    const dateKey = curr.date.toISOString().split('T')[0];
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
            if (employee.employeeRole === 'Shift Supervisor') {
              supervisorPresent = true;
            }
          }
        }
      });

      // Check minimum staffing
      if (totalEmployees < requirement.minimumEmployees) {
        result.isValid = false;
        result.errors.push(
          `Insufficient staffing on ${dateStr} during ${requirement.periodName}: ` +
          `${totalEmployees} employees (minimum: ${requirement.minimumEmployees})`
        );
      }

      // Check supervisor requirement
      if (requirement.shiftSupervisorRequired && !supervisorPresent) {
        result.isValid = false;
        result.errors.push(
          `No supervisor present on ${dateStr} during ${requirement.periodName}`
        );
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
  shifts: Shift[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Group assignments by employee and week
  const assignmentsByEmployee = assignments.reduce((acc, curr) => {
    acc[curr.employeeId] = acc[curr.employeeId] || [];
    acc[curr.employeeId].push(curr);
    return acc;
  }, {} as Record<string, ScheduleAssignment[]>);

  // Check each employee's weekly hours
  Object.entries(assignmentsByEmployee).forEach(([employeeId, employeeAssignments]) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const weeklyAssignments = groupDatesByWeek(employeeAssignments.map(a => a.date));
    
    Object.entries(weeklyAssignments).forEach(([weekStart, weekDates]) => {
      let totalHours = 0;
      
      weekDates.forEach(date => {
        const assignment = employeeAssignments.find(
          a => a.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
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
        result.errors.push(
          `Employee ${employeeId} is scheduled for ${totalHours} hours in week of ${weekStart} ` +
          `(maximum: ${employee.weeklyHoursScheduled})`
        );
      } else if (totalHours < employee.weeklyHoursScheduled) {
        result.warnings.push(
          `Employee ${employeeId} is scheduled for ${totalHours} hours in week of ${weekStart} ` +
          `(target: ${employee.weeklyHoursScheduled})`
        );
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
  options: { minimumRestHours: number; maximumConsecutiveDays: number }
): ValidationResult {
  return combineValidationResults(
    validateRestHours(assignments, shifts, options.minimumRestHours),
    validateConsecutiveDays(assignments, options.maximumConsecutiveDays),
    validateStaffingRequirements(assignments, employees, shifts, staffingRequirements),
    validateWeeklyHours(assignments, employees, shifts),
    validatePatternCompliance(assignments, employeePatterns, patterns, shifts)
  );
} 