import { 
  Employee,
  ShiftPattern,
  EmployeePattern,
  Shift,
  StaffingRequirement,
  ScheduleAssignment,
  SchedulingOptions,
  SchedulingResult
} from './types';
import {
  calculateWorkingDays as calculateWorkingDaysUtil,
  doTimeRangesOverlap,
  getHoursBetween,
  getNextDateWithTime,
  isDateInRange
} from './date-utils';
import {
  validateSchedule,
  validateStaffingRequirements,
  ValidationResult
} from './validation';

interface ShiftScore {
  shift: Shift;
  score: number;
  reasons: string[];
}

export class ScheduleGenerator {
  private employees: Employee[];
  private patterns: ShiftPattern[];
  private employeePatterns: EmployeePattern[];
  private shifts: Shift[];
  private staffingRequirements: StaffingRequirement[];
  private options: SchedulingOptions;

  constructor(
    employees: Employee[],
    patterns: ShiftPattern[],
    employeePatterns: EmployeePattern[],
    shifts: Shift[],
    staffingRequirements: StaffingRequirement[],
    options: SchedulingOptions
  ) {
    this.employees = employees;
    this.patterns = patterns;
    this.employeePatterns = employeePatterns;
    this.shifts = shifts;
    this.staffingRequirements = staffingRequirements;
    this.options = {
      minimumRestHours: 10,
      maximumConsecutiveDays: 6,
      ...options
    };
  }

  /**
   * Generate a schedule for the given date range
   */
  public async generateSchedule(): Promise<SchedulingResult> {
    const result: SchedulingResult = {
      success: false,
      assignments: [],
      unassignedShifts: [],
      coverageGaps: [],
      warnings: [],
      errors: []
    };

    try {
      // 1. Filter available employees
      const availableEmployees = this.filterAvailableEmployees();
      
      // 2. Generate initial schedule based on patterns
      const initialAssignments = await this.generateInitialAssignments(availableEmployees);
      
      // 3. Validate and adjust for coverage requirements
      const validatedAssignments = await this.validateAndAdjustCoverage(initialAssignments);
      
      // 4. Optimize schedule
      const optimizedAssignments = await this.optimizeSchedule(validatedAssignments);
      
      // 5. Final validation
      const finalValidation = await this.validateFinalSchedule(optimizedAssignments);
      
      if (finalValidation.isValid) {
        result.success = true;
        result.assignments = optimizedAssignments;
      } else {
        result.errors.push(...finalValidation.errors);
        result.warnings.push(...finalValidation.warnings);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        result.errors.push(`Failed to generate schedule: ${error.message}`);
      } else {
        result.errors.push('Failed to generate schedule: Unknown error');
      }
    }

    return result;
  }

  /**
   * Filter employees based on availability and options
   */
  private filterAvailableEmployees(): Employee[] {
    return this.employees.filter(employee => {
      // Filter based on includeEmployeeIds if specified
      if (this.options.includeEmployeeIds?.length) {
        return this.options.includeEmployeeIds.includes(employee.id);
      }
      
      // Filter out excluded employees
      if (this.options.excludeEmployeeIds?.length) {
        return !this.options.excludeEmployeeIds.includes(employee.id);
      }

      return true;
    });
  }

  /**
   * Generate initial assignments based on employee patterns
   */
  private async generateInitialAssignments(availableEmployees: Employee[]): Promise<ScheduleAssignment[]> {
    const assignments: ScheduleAssignment[] = [];
    
    for (const employee of availableEmployees) {
      const pattern = this.getEmployeePattern(employee.id);
      if (!pattern) continue;

      const employeeAssignments = await this.generateEmployeeAssignments(employee, pattern);
      assignments.push(...employeeAssignments);
    }

    return assignments;
  }

  /**
   * Get the active pattern for an employee
   */
  private getEmployeePattern(employeeId: string): EmployeePattern | null {
    return this.employeePatterns.find(pattern => 
      pattern.employeeId === employeeId &&
      pattern.startDate <= this.options.startDate &&
      (!pattern.endDate || pattern.endDate >= this.options.endDate)
    ) || null;
  }

  /**
   * Generate assignments for a single employee based on their pattern
   */
  private async generateEmployeeAssignments(
    employee: Employee,
    pattern: EmployeePattern
  ): Promise<ScheduleAssignment[]> {
    const assignments: ScheduleAssignment[] = [];
    const shiftPattern = this.patterns.find(p => p.id === pattern.patternId);
    if (!shiftPattern) return assignments;

    // Calculate working days based on pattern
    const workingDays = this.calculateWorkingDays(pattern, shiftPattern);
    
    // Assign shifts for working days
    for (const workDay of workingDays) {
      const shift = await this.findSuitableShift(employee, workDay, assignments);
      if (shift) {
        assignments.push({
          employeeId: employee.id,
          shiftId: shift.id,
          date: workDay,
          status: 'Draft'
        });
      }
    }

    return assignments;
  }

  /**
   * Calculate working days for an employee based on their pattern
   */
  private calculateWorkingDays(
    pattern: EmployeePattern,
    shiftPattern: ShiftPattern
  ): Date[] {
    return calculateWorkingDaysUtil(
      this.options.startDate,
      this.options.endDate,
      pattern.rotationStartDate,
      shiftPattern.daysOn,
      shiftPattern.daysOff
    );
  }

  /**
   * Find a suitable shift for an employee on a given day
   */
  private async findSuitableShift(
    employee: Employee,
    date: Date,
    existingAssignments: ScheduleAssignment[]
  ): Promise<Shift | null> {
    const shiftScores: ShiftScore[] = [];

    // Score each possible shift
    for (const shift of this.shifts) {
      const score = this.scoreShiftForEmployee(
        shift,
        employee,
        date,
        existingAssignments
      );
      
      if (score.score > 0) {
        shiftScores.push(score);
      }
    }

    // Sort by score (highest first) and return the best shift
    shiftScores.sort((a, b) => b.score - a.score);
    return shiftScores[0]?.shift || null;
  }

  /**
   * Score a shift for an employee based on various factors
   */
  private scoreShiftForEmployee(
    shift: Shift,
    employee: Employee,
    date: Date,
    existingAssignments: ScheduleAssignment[]
  ): ShiftScore {
    const score: ShiftScore = {
      shift,
      score: 0,
      reasons: []
    };

    // Check if shift duration matches employee pattern
    const pattern = this.getEmployeePattern(employee.id);
    const shiftPattern = pattern ? this.patterns.find(p => p.id === pattern.patternId) : null;
    
    if (shiftPattern && shift.durationHours !== shiftPattern.shiftDuration) {
      return score; // Wrong duration, reject immediately
    }

    // Base score
    score.score = 100;
    score.reasons.push('Base score');

    // Preferred shift type bonus
    if (employee.defaultShiftTypeId === shift.shiftTypeId) {
      score.score += 50;
      score.reasons.push('Preferred shift type');
    }

    // Check rest period violations
    const lastAssignment = existingAssignments
      .filter(a => a.employeeId === employee.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    if (lastAssignment) {
      const lastShift = this.shifts.find(s => s.id === lastAssignment.shiftId);
      if (lastShift) {
        const lastEnd = new Date(lastAssignment.date);
        lastEnd.setHours(
          parseInt(lastShift.endTime.split(':')[0]),
          parseInt(lastShift.endTime.split(':')[1])
        );

        const nextStart = new Date(date);
        nextStart.setHours(
          parseInt(shift.startTime.split(':')[0]),
          parseInt(shift.startTime.split(':')[1])
        );

        const restHours = getHoursBetween(lastEnd, nextStart);
        if (restHours < (this.options.minimumRestHours || 10)) {
          return { ...score, score: 0 }; // Insufficient rest, reject
        }
      }
    }

    // Coverage needs bonus
    const coverage = this.calculateCoverageForShift(shift, date, existingAssignments);
    if (coverage < this.getMinimumCoverageNeeded(shift)) {
      score.score += 30;
      score.reasons.push('Helps meet coverage requirements');
    }

    return score;
  }

  /**
   * Calculate current coverage for a shift
   */
  private calculateCoverageForShift(
    shift: Shift,
    date: Date,
    existingAssignments: ScheduleAssignment[]
  ): number {
    return existingAssignments.filter(assignment => {
      if (assignment.date.toISOString().split('T')[0] !== date.toISOString().split('T')[0]) {
        return false;
      }

      const assignmentShift = this.shifts.find(s => s.id === assignment.shiftId);
      return assignmentShift && doTimeRangesOverlap(
        shift.startTime,
        shift.endTime,
        assignmentShift.startTime,
        assignmentShift.endTime
      );
    }).length;
  }

  /**
   * Get minimum coverage needed for a shift
   */
  private getMinimumCoverageNeeded(shift: Shift): number {
    return Math.max(
      ...this.staffingRequirements
        .filter(req => doTimeRangesOverlap(
          shift.startTime,
          shift.endTime,
          req.startTime,
          req.endTime
        ))
        .map(req => req.minimumEmployees)
    );
  }

  /**
   * Validate and adjust coverage based on staffing requirements
   */
  private async validateAndAdjustCoverage(
    assignments: ScheduleAssignment[]
  ): Promise<ScheduleAssignment[]> {
    const adjustedAssignments = [...assignments];
    let coverageValid = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!coverageValid && attempts < maxAttempts) {
      const validation = validateStaffingRequirements(
        adjustedAssignments,
        this.employees,
        this.shifts,
        this.staffingRequirements
      );

      if (validation.isValid) {
        coverageValid = true;
      } else {
        // Try to fix coverage issues
        const fixed = await this.fixCoverageIssues(adjustedAssignments, validation);
        if (!fixed) break; // Can't fix more issues
      }

      attempts++;
    }

    return adjustedAssignments;
  }

  /**
   * Try to fix coverage issues by adding or adjusting assignments
   */
  private async fixCoverageIssues(
    assignments: ScheduleAssignment[],
    validation: ValidationResult
  ): Promise<boolean> {
    let fixed = false;

    // Extract dates and periods with coverage issues from validation errors
    const coverageIssues = validation.errors
      .filter(error => error.includes('Insufficient staffing'))
      .map(error => {
        const matches = error.match(/on (\d{4}-\d{2}-\d{2}) during (.+?):/)!;
        return {
          date: new Date(matches[1]),
          period: matches[2]
        };
      });

    for (const issue of coverageIssues) {
      const requirement = this.staffingRequirements.find(r => r.periodName === issue.period);
      if (!requirement) continue;

      // Find available employees for this period
      const availableEmployees = this.findAvailableEmployeesForPeriod(
        issue.date,
        requirement,
        assignments
      );

      // Try to assign an available employee
      for (const employee of availableEmployees) {
        const shift = await this.findSuitableShift(
          employee,
          issue.date,
          assignments
        );

        if (shift) {
          assignments.push({
            employeeId: employee.id,
            shiftId: shift.id,
            date: issue.date,
            status: 'Draft'
          });
          fixed = true;
          break;
        }
      }
    }

    return fixed;
  }

  /**
   * Find available employees for a specific period
   */
  private findAvailableEmployeesForPeriod(
    date: Date,
    requirement: StaffingRequirement,
    assignments: ScheduleAssignment[]
  ): Employee[] {
    return this.employees.filter(employee => {
      // Check if employee is already assigned during this period
      const hasConflictingAssignment = assignments.some(assignment => {
        if (assignment.employeeId !== employee.id) return false;
        if (assignment.date.toISOString().split('T')[0] !== date.toISOString().split('T')[0]) return false;

        const shift = this.shifts.find(s => s.id === assignment.shiftId);
        return shift && doTimeRangesOverlap(
          requirement.startTime,
          requirement.endTime,
          shift.startTime,
          shift.endTime
        );
      });

      if (hasConflictingAssignment) return false;

      // Check if employee has pattern allowing work on this date
      const pattern = this.getEmployeePattern(employee.id);
      if (!pattern) return false;

      const shiftPattern = this.patterns.find(p => p.id === pattern.patternId);
      if (!shiftPattern) return false;

      const workingDays = this.calculateWorkingDays(pattern, shiftPattern);
      return workingDays.some(d => 
        d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
      );
    });
  }

  /**
   * Optimize the schedule to improve efficiency and fairness
   */
  private async optimizeSchedule(
    assignments: ScheduleAssignment[]
  ): Promise<ScheduleAssignment[]> {
    const optimizedAssignments = [...assignments];
    let improved = true;
    let iterations = 0;
    const maxIterations = 5;

    while (improved && iterations < maxIterations) {
      improved = false;

      // Try to optimize each day
      const dateMap = new Map<string, ScheduleAssignment[]>();
      optimizedAssignments.forEach(assignment => {
        const dateKey = assignment.date.toISOString().split('T')[0];
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, []);
        }
        dateMap.get(dateKey)!.push(assignment);
      });

      for (const [, dayAssignments] of dateMap) {
        const optimizedDay = await this.optimizeDay(dayAssignments, optimizedAssignments);
        if (optimizedDay.some((a, i) => a.shiftId !== dayAssignments[i].shiftId)) {
          improved = true;
          // Update assignments
          dayAssignments.forEach((assignment, i) => {
            const index = optimizedAssignments.findIndex(a => 
              a.employeeId === assignment.employeeId &&
              a.date.toISOString() === assignment.date.toISOString()
            );
            if (index !== -1) {
              optimizedAssignments[index] = optimizedDay[i];
            }
          });
        }
      }

      iterations++;
    }

    return optimizedAssignments;
  }

  /**
   * Optimize assignments for a single day
   */
  private async optimizeDay(
    dayAssignments: ScheduleAssignment[],
    allAssignments: ScheduleAssignment[]
  ): Promise<ScheduleAssignment[]> {
    const optimizedAssignments = [...dayAssignments];
    let improved = true;

    while (improved) {
      improved = false;

      // Try swapping shifts between employees
      for (let i = 0; i < optimizedAssignments.length; i++) {
        for (let j = i + 1; j < optimizedAssignments.length; j++) {
          const assignment1 = optimizedAssignments[i];
          const assignment2 = optimizedAssignments[j];

          // Calculate current score
          const currentScore = this.calculateAssignmentScore(assignment1, allAssignments) +
                             this.calculateAssignmentScore(assignment2, allAssignments);

          // Try swapping shifts
          const swapped1 = { ...assignment1, shiftId: assignment2.shiftId };
          const swapped2 = { ...assignment2, shiftId: assignment1.shiftId };

          // Calculate new score
          const newScore = this.calculateAssignmentScore(swapped1, allAssignments) +
                          this.calculateAssignmentScore(swapped2, allAssignments);

          if (newScore > currentScore) {
            optimizedAssignments[i] = swapped1;
            optimizedAssignments[j] = swapped2;
            improved = true;
          }
        }
      }
    }

    return optimizedAssignments;
  }

  /**
   * Calculate score for an assignment
   */
  private calculateAssignmentScore(
    assignment: ScheduleAssignment,
    allAssignments: ScheduleAssignment[]
  ): number {
    const employee = this.employees.find(e => e.id === assignment.employeeId);
    const shift = this.shifts.find(s => s.id === assignment.shiftId);
    
    if (!employee || !shift) return 0;

    return this.scoreShiftForEmployee(
      shift,
      employee,
      assignment.date,
      allAssignments.filter(a => a !== assignment)
    ).score;
  }

  /**
   * Perform final validation of the schedule
   */
  private async validateFinalSchedule(
    assignments: ScheduleAssignment[]
  ): Promise<ValidationResult> {
    return validateSchedule(
      assignments,
      this.employees,
      this.employeePatterns,
      this.patterns,
      this.shifts,
      this.staffingRequirements,
      {
        minimumRestHours: this.options.minimumRestHours || 10,
        maximumConsecutiveDays: this.options.maximumConsecutiveDays || 6
      }
    );
  }
} 