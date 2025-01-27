import { Database } from '@/types/supabase';

export type Employee = Database['public']['Tables']['employees']['Row'];
export type Shift = Database['public']['Tables']['shifts']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type StaffingRequirement = Database['public']['Tables']['staffing_requirements']['Row'];
export type ShiftPattern = Database['public']['Tables']['shift_patterns']['Row'];
export type EmployeePattern = Database['public']['Tables']['employee_patterns']['Row'];
export type DailyCoverage = Database['public']['Tables']['daily_coverage']['Row'];
export type ShiftPreference = Database['public']['Tables']['employee_shift_preferences']['Row'];

export interface SchedulingConstraints {
  employee: Employee;
  currentWeekHours: number;
  consecutiveDays: number;
  lastShiftType: string | null;
  preferences: ShiftPreference[];
}

export interface CoverageReport {
  date: string;
  periods: {
    [key: string]: {
      required: number;
      actual: number;
      supervisors: number;
      overtime: number;
    };
  };
}

export interface ScheduleGenerationOptions {
  startDate: Date;
  endDate: Date;
  employees: Employee[];
  shifts: Shift[];
  patterns: ShiftPattern[];
  preferences?: ShiftPreference[];
}

export interface ScheduleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type AssignmentPhase = 'ideal' | 'fallback' | 'override';

export interface ShiftAssignment {
  employeeId: string;
  shiftId: string;
  date: Date;
  phase: AssignmentPhase;
  isOvertime: boolean;
  isSupervisor: boolean;
}

export interface ShiftPreference {
  employeeId: string;
  shiftId: string;
  preferenceLevel: number; // 1-5, where 1 is most preferred
  effectiveDate: Date;
  expiryDate?: Date;
} 