import { Database } from './supabase'

// Base type from database
export type Schedule = Database['public']['Tables']['schedules']['Row']
export type Shift = Database['public']['Tables']['shifts']['Row']
export type Employee = Database['public']['Tables']['employees']['Row']
export type ShiftType = Database['public']['Tables']['shift_types']['Row']

// Extended types with relations
export interface ShiftWithType extends Shift {
  shift_types: ShiftType
}

export interface EmployeeWithProfile extends Employee {
  profiles: {
    full_name: string | null
  }
}

export interface ScheduleWithRelations extends Schedule {
  shifts: ShiftWithType
  employees: EmployeeWithProfile
}

// Input types for API
export interface CreateScheduleInput {
  employee_id: string
  shift_id: string
  date: string
  schedule_status: 'Draft' | 'Published'
  week_start_date: string
  day_of_week: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
}

export interface UpdateScheduleInput {
  shift_id?: string
  date?: string
  schedule_status?: 'Draft' | 'Published'
  week_start_date?: string
  day_of_week?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
}

export interface BulkUpdateScheduleInput {
  ids: string[]
  data: UpdateScheduleInput
}

// Schedule generation types
export interface GenerateScheduleInput {
  startDate: string
  endDate: string
  includeEmployeeIds?: string[]
  excludeEmployeeIds?: string[]
  minimumRestHours?: number
  maximumConsecutiveDays?: number
}

export interface GenerateScheduleResponse {
  success: boolean
  assignments?: ScheduleWithRelations[]
  warnings?: string[]
  errors?: string[]
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type ScheduleStatus = 'Draft' | 'Published'

export interface ScheduleFilters {
  week_start?: string
  employee_id?: string
  status?: ScheduleStatus
} 