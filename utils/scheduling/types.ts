// Types for the scheduling algorithm

export type ShiftDuration = 4 | 10 | 12;

export type ShiftPatternType = '4x10' | '3x12_1x4' | 'Custom';

export type EmployeeRole = 'Dispatcher' | 'Shift Supervisor' | 'Management';

export type ScheduleStatus = 'Draft' | 'Published';

export interface Employee {
  id: string;
  employeeRole: EmployeeRole;
  weeklyHoursScheduled: number;
  defaultShiftTypeId?: string;
}

export interface ShiftPattern {
  id: string;
  name: string;
  patternType: ShiftPatternType;
  daysOn: number;
  daysOff: number;
  shiftDuration: ShiftDuration;
}

export interface EmployeePattern {
  id: string;
  employeeId: string;
  patternId: string;
  startDate: Date;
  endDate?: Date;
  rotationStartDate: Date;
}

export interface Shift {
  id: string;
  shiftTypeId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  durationHours: ShiftDuration;
}

export interface StaffingRequirement {
  id: string;
  periodName: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  minimumEmployees: number;
  shiftSupervisorRequired: boolean;
}

export interface ScheduleAssignment {
  employeeId: string;
  shiftId: string;
  date: Date;
  status: ScheduleStatus;
}

export interface SchedulingOptions {
  startDate: Date;
  endDate: Date;
  includeEmployeeIds?: string[];
  excludeEmployeeIds?: string[];
  preferredShiftTypes?: { [employeeId: string]: string[] };
  minimumRestHours?: number; // Default: 10
  maximumConsecutiveDays?: number; // Default: 6
}

export interface SchedulingResult {
  success: boolean;
  assignments: ScheduleAssignment[];
  unassignedShifts: {
    date: Date;
    shiftId: string;
    reason: string;
  }[];
  coverageGaps: {
    date: Date;
    periodId: string;
    required: number;
    actual: number;
  }[];
  warnings: string[];
  errors: string[];
} 