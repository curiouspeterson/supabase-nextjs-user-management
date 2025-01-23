export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type ScheduleStatus = 'Draft' | 'Published'

export interface Schedule {
  id: string
  week_start_date: string
  day_of_week: DayOfWeek
  shift_id: string
  employee_id: string
  schedule_status: ScheduleStatus
  created_at?: string
  updated_at?: string
}

export interface ScheduleWithRelations extends Schedule {
  shifts: {
    id: string
    name: string
    start_time: string
    end_time: string
    duration_hours: number
    duration_category: '4 hours' | '10 hours' | '12 hours'
  }
  employees: {
    id: string
    full_name: string
  }
}

export type CreateScheduleInput = Omit<Schedule, 'id' | 'created_at' | 'updated_at'>
export type UpdateScheduleInput = Partial<CreateScheduleInput>

export interface ScheduleFilters {
  week_start?: string
  employee_id?: string
  status?: ScheduleStatus
} 