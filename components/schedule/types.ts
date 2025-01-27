import { Employee, Shift, Schedule, CoverageReport } from '@/services/scheduler/types';

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