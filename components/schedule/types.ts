import { Employee, Shift, Schedule, CoverageReport } from '@/services/scheduler/types';
import type { Shift as DatabaseShift } from '@/services/scheduler/types'

export interface ScheduleViewProps {
  startDate: Date;
  endDate: Date;
  schedules: Schedule[];
  employees: Employee[];
  shifts: Shift[];
  coverage: { [date: string]: CoverageReport };
  onAssignShift?: (employeeId: string, shiftId: string, date: Date) => Promise<void>;
  onRemoveShift?: (scheduleId: string) => Promise<void>;
  isEditable?: boolean;
}

export interface ShiftBlockProps {
  schedule: Schedule;
  shift: Shift;
  employee: Employee;
  isEditable?: boolean;
  onRemove?: () => Promise<void>;
}

export interface CoverageIndicatorProps {
  date: Date;
  period: string;
  required: number;
  actual: number;
  supervisors: number;
}

export interface TimeSlotProps {
  date: Date;
  hour: number;
  schedules: Schedule[];
  shifts: Shift[];
  employees: Employee[];
  isEditable?: boolean;
  onAssignShift?: (employeeId: string, shiftId: string, date: Date) => Promise<void>;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface ScheduleControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDateChange: (date: Date) => void;
  onRefresh: () => void;
}

export interface DragItem {
  type: 'SHIFT';
  id: string;
  shiftId: string;
  employeeId: string;
  sourceDate?: Date;
}

export type ScheduleStatus = 'success' | 'warning' | 'error';

export interface StatusIndicatorProps {
  status: ScheduleStatus;
  message?: string;
}

export type ShiftStatus = 
  | 'Regular'
  | 'Shift Closed'
  | 'On-Call'
  | 'Trade'
  | 'Flexed'
  | 'Time off rqst pending'
  | 'OT Shift'
  | 'Coverage if needed'
  | 'Reserve'
  | 'Open'

export interface ShiftAssignment {
  name: string
  status: ShiftStatus
  startTime: string
  endTime: string
}

export interface DisplayShift {
  id: string
  name: string
  time: string
  supervisor: string
  assignments: ShiftAssignment[]
}

export interface RequirementPeriod {
  period: string
  required: number
  assigned: number
  status: 'Met' | 'Not Met'
  startHour: number
  endHour: number
  color: string
}

export interface DispatchScheduleData {
  date: string
  shifts: DisplayShift[]
  requirements: RequirementPeriod[]
}

// Type guard to check if a shift is a display shift
export function isDisplayShift(shift: unknown): shift is DisplayShift {
  return (
    typeof shift === 'object' &&
    shift !== null &&
    'name' in shift &&
    'time' in shift &&
    'supervisor' in shift &&
    'assignments' in shift &&
    Array.isArray((shift as DisplayShift).assignments)
  )
}

// Transform database shift to display shift
export function transformDatabaseShift(
  dbShift: DatabaseShift,
  assignments: ShiftAssignment[] = []
): DisplayShift {
  return {
    id: dbShift.id,
    name: `${dbShift.duration_category} Shift`,
    time: `${dbShift.start_time} - ${dbShift.end_time}`,
    supervisor: 'TBD', // This should come from a join with employees table
    assignments
  }
} 