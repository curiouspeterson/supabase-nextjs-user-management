import { createClient } from '@/utils/supabase/server';
import { addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { 
  Employee, 
  Shift, 
  Schedule,
  StaffingRequirement,
  SchedulingConstraints,
  CoverageReport,
  ScheduleGenerationOptions,
  ScheduleValidationResult,
  AssignmentPhase,
  ShiftAssignment,
  ShiftPattern,
  ShiftPreference
} from './types';

export class ScheduleGenerator {
  private supabase = createClient();
  private readonly MAX_WEEKLY_HOURS = 40;
  private readonly MAX_CONSECUTIVE_DAYS = 6;

  /**
   * Generate a schedule for the specified date range
   */
  public async generateSchedule(options: ScheduleGenerationOptions): Promise<Schedule[]> {
    const {
      startDate,
      endDate,
      employees,
      shifts,
      patterns,
      preferences = []
    } = options;

    try {
      // Track weekly hours for each employee
      const weeklyHours = new Map<string, number>();
      const schedules: Schedule[] = [];

      // Process each day in the date range
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Reset weekly hours at the start of each week
        if (currentDate.getDay() === 0) {
          weeklyHours.clear();
        }

        // Get staffing requirements for the current date
        const requirements = await this.getStaffingRequirements(currentDate);
        
        // Generate daily schedule
        const dailyAssignments = await this.generateDailySchedule(
          currentDate,
          employees,
          shifts,
          requirements,
          weeklyHours,
          patterns,
          preferences
        );

        // Create schedule entries
        for (const assignment of dailyAssignments) {
          const schedule = await this.createScheduleEntry(assignment);
          if (schedule) {
            schedules.push(schedule);
            
            // Update weekly hours
            const shift = shifts.find(s => s.id === assignment.shiftId);
            if (shift) {
              const currentHours = weeklyHours.get(assignment.employeeId) || 0;
              weeklyHours.set(assignment.employeeId, currentHours + shift.duration_hours);
            }
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return schedules;
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      throw new Error('Schedule generation failed');
    }
  }

  /**
   * Generate schedule for a single day
   */
  private async generateDailySchedule(
    date: Date,
    employees: Employee[],
    shifts: Shift[],
    requirements: StaffingRequirement[],
    weeklyHours: Map<string, number>,
    patterns: ShiftPattern[],
    preferences: ShiftPreference[]
  ): Promise<ShiftAssignment[]> {
    const assignments: ShiftAssignment[] = [];

    // Sort requirements by priority (supervisor required first)
    const sortedRequirements = requirements.sort((a, b) => 
      Number(b.shift_supervisor_required) - Number(a.shift_supervisor_required)
    );

    // Process each staffing requirement
    for (const requirement of sortedRequirements) {
      let assignedCount = 0;
      let supervisorAssigned = false;

      // Try to fill positions in phases (ideal -> fallback -> override)
      for (const phase of ['ideal', 'fallback', 'override'] as AssignmentPhase[]) {
        const candidates = this.getPhaseCandidates(
          phase,
          employees,
          date,
          requirement,
          weeklyHours,
          patterns,
          preferences
        );

        for (const employee of candidates) {
          // Stop if we've met the requirement
          if (assignedCount >= requirement.minimum_employees && 
              (!requirement.shift_supervisor_required || supervisorAssigned)) {
            break;
          }

          // Find best matching shift
          const shift = this.findBestShiftMatch(employee, requirement, shifts);
          if (!shift) continue;

          // Validate assignment
          const validation = await this.validateAssignment(
            employee,
            shift,
            date,
            weeklyHours,
            patterns
          );

          if (validation.isValid) {
            assignments.push({
              employeeId: employee.id,
              shiftId: shift.id,
              date: date,
              phase: phase,
              isOvertime: (weeklyHours.get(employee.id) || 0) + shift.duration_hours > this.MAX_WEEKLY_HOURS,
              isSupervisor: employee.employee_role === 'Shift Supervisor'
            });

            assignedCount++;
            if (employee.employee_role === 'Shift Supervisor') {
              supervisorAssigned = true;
            }
          }
        }
      }
    }

    return assignments;
  }

  /**
   * Get candidates for a specific assignment phase
   */
  private getPhaseCandidates(
    phase: AssignmentPhase,
    employees: Employee[],
    date: Date,
    requirement: StaffingRequirement,
    weeklyHours: Map<string, number>,
    patterns: ShiftPattern[],
    preferences: ShiftPreference[]
  ): Employee[] {
    // Filter available employees
    let candidates = employees.filter(employee => 
      this.isEmployeeAvailable(employee, date, weeklyHours)
    );

    // Apply phase-specific filtering
    switch (phase) {
      case 'ideal':
        // Preferred employees who match pattern and have low hours
        candidates = candidates.filter(employee => {
          const hours = weeklyHours.get(employee.id) || 0;
          return hours < this.MAX_WEEKLY_HOURS &&
                 this.matchesPattern(employee, date, patterns) &&
                 this.hasPreference(employee, requirement, preferences);
        });
        break;

      case 'fallback':
        // Employees who can work overtime or don't perfectly match pattern
        candidates = candidates.filter(employee => {
          const hours = weeklyHours.get(employee.id) || 0;
          return (hours < this.MAX_WEEKLY_HOURS || employee.allow_overtime) &&
                 !this.hasNegativePreference(employee, requirement, preferences);
        });
        break;

      case 'override':
        // Any available employee as a last resort
        break;
    }

    // Prioritize supervisors if required
    if (requirement.shift_supervisor_required) {
      candidates.sort((a, b) => 
        Number(b.employee_role === 'Shift Supervisor') - 
        Number(a.employee_role === 'Shift Supervisor')
      );
    }

    return candidates;
  }

  /**
   * Find the best matching shift for an employee and requirement
   */
  private findBestShiftMatch(
    employee: Employee,
    requirement: StaffingRequirement,
    shifts: Shift[]
  ): Shift | null {
    return shifts.find(shift => 
      shift.start_time >= requirement.start_time &&
      shift.end_time <= requirement.end_time
    ) || null;
  }

  /**
   * Validate a potential assignment
   */
  private async validateAssignment(
    employee: Employee,
    shift: Shift,
    date: Date,
    weeklyHours: Map<string, number>,
    patterns: ShiftPattern[]
  ): Promise<ScheduleValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check weekly hours
    const currentHours = weeklyHours.get(employee.id) || 0;
    if (currentHours + shift.duration_hours > this.MAX_WEEKLY_HOURS) {
      if (!employee.allow_overtime) {
        errors.push('Would exceed maximum weekly hours');
      } else {
        warnings.push('Assignment will result in overtime');
      }
    }

    // Check consecutive days
    const consecutiveDays = await this.getConsecutiveWorkDays(employee.id, date);
    if (consecutiveDays >= this.MAX_CONSECUTIVE_DAYS) {
      errors.push('Would exceed maximum consecutive days');
    }

    // Check pattern compliance
    if (!this.matchesPattern(employee, date, patterns)) {
      warnings.push('Assignment does not match preferred pattern');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a schedule entry in the database
   */
  private async createScheduleEntry(
    assignment: ShiftAssignment
  ): Promise<Schedule | null> {
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .insert({
          employee_id: assignment.employeeId,
          shift_id: assignment.shiftId,
          date: assignment.date.toISOString().split('T')[0],
          status: 'Draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create schedule entry:', error);
      return null;
    }
  }

  /**
   * Get staffing requirements for a date
   */
  private async getStaffingRequirements(
    date: Date
  ): Promise<StaffingRequirement[]> {
    try {
      const { data, error } = await this.supabase
        .from('staffing_requirements')
        .select('*')
        .eq('date', date.toISOString().split('T')[0]);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get staffing requirements:', error);
      return [];
    }
  }

  /**
   * Get the number of consecutive days worked
   */
  private async getConsecutiveWorkDays(
    employeeId: string,
    date: Date
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('schedules')
        .select('date')
        .eq('employee_id', employeeId)
        .lt('date', date.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;

      let consecutiveDays = 0;
      let currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() - 1);

      for (const schedule of data) {
        if (schedule.date === currentDate.toISOString().split('T')[0]) {
          consecutiveDays++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return consecutiveDays;
    } catch (error) {
      console.error('Failed to get consecutive work days:', error);
      return 0;
    }
  }

  /**
   * Check if an employee is available on a date
   */
  private isEmployeeAvailable(
    employee: Employee,
    date: Date,
    weeklyHours: Map<string, number>
  ): boolean {
    const hours = weeklyHours.get(employee.id) || 0;
    return hours < (employee.allow_overtime ? employee.max_weekly_hours : this.MAX_WEEKLY_HOURS);
  }

  /**
   * Check if an assignment matches the employee's pattern
   */
  private matchesPattern(
    employee: Employee,
    date: Date,
    patterns: ShiftPattern[]
  ): boolean {
    // TODO: Implement pattern matching logic
    return true;
  }

  /**
   * Check if an employee has a preference for a requirement
   */
  private hasPreference(
    employee: Employee,
    requirement: StaffingRequirement,
    preferences: ShiftPreference[]
  ): boolean {
    return preferences.some(p => 
      p.employee_id === employee.id &&
      p.preference_level === 'Preferred' &&
      (!p.expiry_date || new Date(p.expiry_date) > new Date())
    );
  }

  /**
   * Check if an employee has a negative preference for a requirement
   */
  private hasNegativePreference(
    employee: Employee,
    requirement: StaffingRequirement,
    preferences: ShiftPreference[]
  ): boolean {
    return preferences.some(p => 
      p.employee_id === employee.id &&
      p.preference_level === 'Avoid' &&
      (!p.expiry_date || new Date(p.expiry_date) > new Date())
    );
  }
} 