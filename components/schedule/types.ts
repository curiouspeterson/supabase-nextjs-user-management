import { Employee, Shift, Schedule, CoverageReport, ShiftDurationCategory } from '@/services/scheduler/types';
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
  shift_type_id: string
  start_time: string
  end_time: string
  duration_hours: number
  duration_category: ShiftDurationCategory | null
  created_at: string
  updated_at: string
  department_id?: string
  is_active?: boolean
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
  // Ensure duration_category is one of the valid ShiftDurationCategory values
  let duration_category: ShiftDurationCategory | null = null;
  if (dbShift.duration_category === '4 hours' || 
      dbShift.duration_category === '10 hours' || 
      dbShift.duration_category === '12 hours') {
    duration_category = dbShift.duration_category;
  }

  return {
    id: dbShift.id,
    name: duration_category ? `${duration_category} Shift` : 'Shift',
    time: `${dbShift.start_time} - ${dbShift.end_time}`,
    supervisor: 'TBD', // This should come from a join with employees table
    assignments,
    shift_type_id: dbShift.shift_type_id,
    start_time: dbShift.start_time,
    end_time: dbShift.end_time,
    duration_hours: dbShift.duration_hours,
    duration_category,
    created_at: dbShift.created_at,
    updated_at: dbShift.updated_at,
    department_id: undefined,
    is_active: true
  }
} 