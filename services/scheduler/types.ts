import { Database } from '@/types/supabase';
import { z } from 'zod';
import { isValid, parseISO, differenceInHours } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

export enum ShiftDurationCategory {
  SHORT = 'SHORT',
  REGULAR = 'REGULAR',
  EXTENDED = 'EXTENDED',
  LONG = 'LONG'
}

export enum ScheduleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED'
}

export enum EmployeeRole {
  STAFF = 'STAFF',
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export enum TimeOffType {
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  TRAINING = 'TRAINING'
}

export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export enum CoverageStatus {
  UNDER = 'UNDER',
  MET = 'MET',
  OVER = 'OVER'
}

export enum PatternType {
  FOUR_BY_TEN = '4x10',
  THREE_BY_TWELVE_ONE_BY_FOUR = '3x12_1x4',
  CUSTOM = 'Custom'
}

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
  user_role: 'Employee' | 'Admin';
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

export const ShiftSchema = z.object({
  id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  duration_hours: z.number().positive().max(24),
  duration_category: z.nativeEnum(ShiftDurationCategory),
  department_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean()
}).refine(
  data => {
    const start = parseISO(data.start_time);
    const end = parseISO(data.end_time);
    return end > start || (
      // Handle shifts crossing midnight
      end < start && differenceInHours(
        zonedTimeToUtc(end, 'UTC'),
        zonedTimeToUtc(start, 'UTC')
      ) + 24 <= 24
    );
  },
  {
    message: 'End time must be after start time or within 24 hours for overnight shifts',
    path: ['end_time']
  }
);

export const ScheduleSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  date: z.string().refine(val => isValid(parseISO(val)), {
    message: 'Invalid date format'
  }),
  status: z.nativeEnum(ScheduleStatus),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  department_id: z.string().uuid(),
  notes: z.string().optional(),
  is_active: z.boolean()
});

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  employee_role: z.nativeEnum(EmployeeRole),
  department_id: z.string().uuid(),
  weekly_hours_scheduled: z.number().min(0).max(168),
  max_consecutive_days: z.number().min(1).max(7),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean()
});

export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  timezone: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean()
});

export type Shift = z.infer<typeof ShiftSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type Department = z.infer<typeof DepartmentSchema>;

export const isShift = (value: unknown): value is Shift => {
  return ShiftSchema.safeParse(value).success;
};

export const isSchedule = (value: unknown): value is Schedule => {
  return ScheduleSchema.safeParse(value).success;
};

export const isEmployee = (value: unknown): value is Employee => {
  return EmployeeSchema.safeParse(value).success;
};

export const isDepartment = (value: unknown): value is Department => {
  return DepartmentSchema.safeParse(value).success;
};

export const validateShift = (data: unknown): Shift => {
  return ShiftSchema.parse(data);
};

export const validateSchedule = (data: unknown): Schedule => {
  return ScheduleSchema.parse(data);
};

export const validateEmployee = (data: unknown): Employee => {
  return EmployeeSchema.parse(data);
};

export const validateDepartment = (data: unknown): Department => {
  return DepartmentSchema.parse(data);
};

export const isValidStatusTransition = (
  currentStatus: ScheduleStatus,
  newStatus: ScheduleStatus
): boolean => {
  const validTransitions: Record<ScheduleStatus, ScheduleStatus[]> = {
    [ScheduleStatus.DRAFT]: [ScheduleStatus.PENDING, ScheduleStatus.CANCELLED],
    [ScheduleStatus.PENDING]: [ScheduleStatus.APPROVED, ScheduleStatus.CANCELLED],
    [ScheduleStatus.APPROVED]: [ScheduleStatus.PUBLISHED, ScheduleStatus.CANCELLED],
    [ScheduleStatus.PUBLISHED]: [ScheduleStatus.CANCELLED],
    [ScheduleStatus.CANCELLED]: []
  };

  return validTransitions[currentStatus].includes(newStatus);
};

export const calculateDurationCategory = (hours: number): ShiftDurationCategory => {
  if (hours <= 4) return ShiftDurationCategory.SHORT;
  if (hours <= 8) return ShiftDurationCategory.REGULAR;
  if (hours <= 10) return ShiftDurationCategory.EXTENDED;
  return ShiftDurationCategory.LONG;
}; 