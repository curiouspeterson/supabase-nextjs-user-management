import { createClient } from '@/utils/supabase/server';
import {
  Employee,
  Shift,
  Schedule,
  StaffingRequirement,
  SchedulingConstraints,
  CoverageReport,
  ScheduleGenerationOptions,
  ScheduleValidationResult,
  AssignmentPhase,
  ShiftAssignment
} from './types';

export class ScheduleGenerator {
  private supabase = createClient();

  constructor() {}

  /**
   * Generate a schedule for the given date range
   */
  public async generateSchedule(options: ScheduleGenerationOptions): Promise<Schedule[]> {
    const assignments: Schedule[] = [];
    const weeklyHours = new Map<string, number>();
    const coverageMap = new Map<string, CoverageReport>();

    // Get staffing requirements
    const { data: requirements } = await this.supabase
      .from('staffing_requirements')
      .select('*')
      .order('start_time');

    if (!requirements) {
      throw new Error('Failed to fetch staffing requirements');
    }

    // Process each day in the date range
    for (let currentDate = new Date(options.startDate); 
         currentDate <= options.endDate; 
         currentDate.setDate(currentDate.getDate() + 1)) {
      
      // Reset weekly hours at start of week
      if (currentDate.getDay() === 0) {
        weeklyHours.clear();
      }

      const dailyAssignments = await this.generateDailySchedule(
        currentDate,
        options.employees,
        options.shifts,
        requirements,
        weeklyHours
      );

      assignments.push(...dailyAssignments);
    }

    return assignments;
  }

  /**
   * Generate schedule for a single day
   */
  private async generateDailySchedule(
    date: Date,
    employees: Employee[],
    shifts: Shift[],
    requirements: StaffingRequirement[],
    weeklyHours: Map<string, number>
  ): Promise<Schedule[]> {
    const assignments: Schedule[] = [];
    const dailyCoverage = new Map<string, number>();
    const supervisorCoverage = new Map<string, number>();

    // Sort requirements by priority (minimum employees needed)
    const sortedRequirements = [...requirements].sort(
      (a, b) => b.minimum_employees - a.minimum_employees
    );

    // Process each staffing requirement period
    for (const requirement of sortedRequirements) {
      let coverageCount = dailyCoverage.get(requirement.id) || 0;
      let supervisorCount = supervisorCoverage.get(requirement.id) || 0;

      // Try to fill positions in phases
      for (const phase of ['ideal', 'fallback', 'override'] as AssignmentPhase[]) {
        if (coverageCount >= requirement.minimum_employees && 
            (!requirement.shift_supervisor_required || supervisorCount > 0)) {
          break;
        }

        const candidates = await this.getPhaseCandidates(
          phase,
          employees,
          date,
          requirement
        );

        for (const employee of candidates) {
          if (coverageCount >= requirement.minimum_employees && 
              (!requirement.shift_supervisor_required || supervisorCount > 0)) {
            break;
          }

          const constraints = await this.getEmployeeConstraints(
            employee,
            date,
            weeklyHours.get(employee.id) || 0
          );

          const bestShift = this.findBestShiftMatch(
            constraints,
            shifts,
            requirement,
            phase
          );

          if (bestShift && await this.validateAssignment(
            employee,
            bestShift,
            date,
            weeklyHours.get(employee.id) || 0
          )) {
            const assignment = await this.createAssignment(
              employee,
              bestShift,
              date,
              phase
            );

            assignments.push(assignment);
            weeklyHours.set(
              employee.id,
              (weeklyHours.get(employee.id) || 0) + bestShift.duration_hours
            );

            coverageCount++;
            dailyCoverage.set(requirement.id, coverageCount);

            if (employee.employee_role === 'Shift Supervisor') {
              supervisorCount++;
              supervisorCoverage.set(requirement.id, supervisorCount);
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
  private async getPhaseCandidates(
    phase: AssignmentPhase,
    employees: Employee[],
    date: Date,
    requirement: StaffingRequirement
  ): Promise<Employee[]> {
    // Get employee preferences
    const { data: preferences } = await this.supabase
      .from('employee_shift_preferences')
      .select('*')
      .lte('effective_date', date)
      .gt('expiry_date', date)
      .in('employee_id', employees.map(e => e.id));

    // Filter and sort candidates based on phase
    return employees
      .filter(employee => {
        switch (phase) {
          case 'ideal':
            // Preferred shift type and role matches
            return preferences?.some(p => 
              p.employee_id === employee.id && 
              p.preference_level > 0
            ) && (!requirement.shift_supervisor_required || 
                  employee.employee_role === 'Shift Supervisor');
          
          case 'fallback':
            // No strong preferences against
            return !preferences?.some(p =>
              p.employee_id === employee.id &&
              p.preference_level < -1
            );
          
          case 'override':
            // Any available employee
            return true;
        }
      })
      .sort((a, b) => {
        // Sort by preference level and weekly hours
        const aPreference = preferences?.find(p => p.employee_id === a.id)?.preference_level || 0;
        const bPreference = preferences?.find(p => p.employee_id === b.id)?.preference_level || 0;
        
        if (aPreference !== bPreference) {
          return bPreference - aPreference;
        }
        
        return (a.weekly_hours_scheduled || 0) - (b.weekly_hours_scheduled || 0);
      });
  }

  /**
   * Get current constraints for an employee
   */
  private async getEmployeeConstraints(
    employee: Employee,
    date: Date,
    currentWeekHours: number
  ): Promise<SchedulingConstraints> {
    // Get consecutive days worked
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const { data: recentShifts } = await this.supabase
      .from('schedules')
      .select('*, shifts(*)')
      .eq('employee_id', employee.id)
      .gte('date', new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .lte('date', date.toISOString())
      .order('date', { ascending: false });

    const consecutiveDays = recentShifts?.reduce((count, shift) => {
      const shiftDate = new Date(shift.date);
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - count - 1);
      
      return shiftDate.toISOString().split('T')[0] === 
             prevDate.toISOString().split('T')[0] ? count + 1 : count;
    }, 0) || 0;

    const lastShiftType = recentShifts?.[0]?.shifts?.shift_type_id;

    return {
      employee,
      currentWeekHours,
      consecutiveDays,
      lastShiftType
    };
  }

  /**
   * Find the best matching shift for the given constraints
   */
  private findBestShiftMatch(
    constraints: SchedulingConstraints,
    shifts: Shift[],
    requirement: StaffingRequirement,
    phase: AssignmentPhase
  ): Shift | null {
    return shifts
      .filter(shift => {
        // Basic time overlap check
        const shiftStart = new Date(`1970-01-01T${shift.start_time}`);
        const shiftEnd = new Date(`1970-01-01T${shift.end_time}`);
        const reqStart = new Date(`1970-01-01T${requirement.start_time}`);
        const reqEnd = new Date(`1970-01-01T${requirement.end_time}`);

        return (shiftStart <= reqEnd && shiftEnd >= reqStart);
      })
      .sort((a, b) => {
        let aScore = 0;
        let bScore = 0;

        // Prefer shifts that match the last shift type in ideal phase
        if (phase === 'ideal' && constraints.lastShiftType) {
          aScore += a.shift_type_id === constraints.lastShiftType ? 2 : 0;
          bScore += b.shift_type_id === constraints.lastShiftType ? 2 : 0;
        }

        // Prefer shifts that don't cause overtime
        const aOvertime = constraints.currentWeekHours + a.duration_hours > 40;
        const bOvertime = constraints.currentWeekHours + b.duration_hours > 40;
        aScore -= aOvertime ? 3 : 0;
        bScore -= bOvertime ? 3 : 0;

        return bScore - aScore;
      })[0] || null;
  }

  /**
   * Validate a potential assignment
   */
  private async validateAssignment(
    employee: Employee,
    shift: Shift,
    date: Date,
    currentWeekHours: number
  ): Promise<boolean> {
    const validation = await this.validateSchedule({
      employee_id: employee.id,
      shift_id: shift.id,
      date: date.toISOString(),
      status: 'Draft'
    });

    return validation.isValid;
  }

  /**
   * Create a new schedule assignment
   */
  private async createAssignment(
    employee: Employee,
    shift: Shift,
    date: Date,
    phase: AssignmentPhase
  ): Promise<Schedule> {
    const { data, error } = await this.supabase
      .from('schedules')
      .insert({
        employee_id: employee.id,
        shift_id: shift.id,
        date: date.toISOString(),
        status: 'Draft'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create assignment: ${error.message}`);
    }

    return data;
  }

  /**
   * Validate a schedule entry
   */
  private async validateSchedule(schedule: Partial<Schedule>): Promise<ScheduleValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // This will trigger database-level validations
      const { error } = await this.supabase
        .from('schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) {
        errors.push(error.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        errors.push(err.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 