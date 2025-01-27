import { Database } from '@/types/supabase';

export type ShiftDurationCategory = '4 hours' | '8 hours' | '10 hours' | '12 hours' | null;
export type EmployeeRole = 'Dispatcher' | 'Shift Supervisor' | 'Manager';
export type ScheduleStatus = 'Draft' | 'Published' | 'Approved';
export type TimeOffType = 'Vacation' | 'Sick Leave' | 'Training';
export type TimeOffStatus = 'Pending' | 'Approved' | 'Declined';
export type CoverageStatus = 'Under' | 'Met' | 'Over';
export type PatternType = '4x10' | '3x12_1x4' | 'Custom';

export interface ShiftType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  shift_type_id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  duration_category: ShiftDurationCategory;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string | null;
  employee_role: EmployeeRole;
  weekly_hours_scheduled: number;
  default_shift_type_id: string | null;
  created_at: string;
  updated_at: string;
  full_name?: string;
  avatar_url?: string | null;
  username?: string | null;
}

export interface ShiftPattern {
  id: string;
  name: string;
  pattern: string;
  is_forbidden: boolean;
  length: number;
  pattern_type: PatternType;
  shift_duration: number;
  days_on: number;
  days_off: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeePattern {
  id: string;
  employee_id: string;
  pattern_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  employee_id: string;
  shift_id: string;
  date: string;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface StaffingRequirement {
  id: string;
  period_name: string;
  start_time: string;
  end_time: string;
  minimum_employees: number;
  shift_supervisor_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: TimeOffType;
  notes: string | null;
  status: TimeOffStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyCoverage {
  id: string;
  date: string;
  period_id: string;
  actual_coverage: number;
  coverage_status: CoverageStatus;
  created_at: string;
  updated_at: string;
}

export interface ShiftPreference {
  id: string;
  employee_id: string;
  shift_type_id: string;
  preference_level: 'Preferred' | 'Neutral' | 'Avoid';
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
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

export type AssignmentPhase = 'ideal' | 'fallback' | 'override';

export interface ShiftAssignment {
  employeeId: string;
  shiftId: string;
  date: Date;
  phase: AssignmentPhase;
  isOvertime: boolean;
  isSupervisor: boolean;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScheduleGenerationOptions {
  startDate: Date;
  endDate: Date;
  employees: Employee[];
  shifts: Shift[];
  patterns: ShiftPattern[];
  preferences?: ShiftPreference[];
}

export interface SchedulerMetrics {
  coverage_deficit: number;
  overtime_violations: number;
  pattern_errors: number;
  schedule_generation_time: number;
  last_run_status: 'success' | 'warning' | 'error';
  error_message?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: SchedulerMetrics;
  coverage: CoverageReport[];
  alerts: string[];
} 