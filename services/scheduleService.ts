import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ScheduleWithRelations,
  CreateScheduleInput,
  UpdateScheduleInput,
  BulkUpdateScheduleInput,
  GenerateScheduleInput,
  GenerateScheduleResponse
} from '@/types/schedule'

const supabase = createClientComponentClient()

interface ScheduleFilters {
  weekStart?: string
  employeeId?: string
  status?: string
  startDate?: string
  endDate?: string
  shiftId?: string
}

export const scheduleService = {
  /**
   * Fetch schedules with optional filters
   */
  async getSchedules(filters: ScheduleFilters = {}): Promise<ScheduleWithRelations[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    const response = await fetch(`/api/schedules?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch schedules')
    }
    return response.json()
  },

  /**
   * Create one or more schedules
   */
  async createSchedules(
    data: CreateScheduleInput | CreateScheduleInput[]
  ): Promise<ScheduleWithRelations | ScheduleWithRelations[]> {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create schedule(s)')
    }
    return response.json()
  },

  /**
   * Update a single schedule
   */
  async updateSchedule(
    id: string,
    data: UpdateScheduleInput
  ): Promise<ScheduleWithRelations> {
    const response = await fetch(`/api/schedules?id=${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update schedule')
    }
    return response.json()
  },

  /**
   * Update multiple schedules at once
   */
  async bulkUpdateSchedules(
    data: BulkUpdateScheduleInput
  ): Promise<ScheduleWithRelations[]> {
    const response = await fetch('/api/schedules?bulk=true', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update schedules')
    }
    return response.json()
  },

  /**
   * Delete one or more schedules
   */
  async deleteSchedules(ids: string | string[]): Promise<void> {
    const idParam = Array.isArray(ids) ? ids.join(',') : ids
    const response = await fetch(`/api/schedules?${Array.isArray(ids) ? 'ids' : 'id'}=${idParam}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete schedule(s)')
    }
  },

  /**
   * Generate a new schedule
   */
  async generateSchedule(options: GenerateScheduleInput): Promise<GenerateScheduleResponse> {
    const response = await fetch('/api/schedules/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error('Failed to generate schedule')
    }
    return response.json()
  },

  /**
   * Get schedule statistics
   */
  async getScheduleStats(startDate: string, endDate: string) {
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select(`
        *,
        employees (
          id,
          full_name,
          employee_pattern,
          weekly_hours_scheduled
        ),
        shifts (
          duration_hours
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    // Calculate statistics
    const stats = {
      totalShifts: schedules.length,
      totalHours: schedules.reduce((sum, schedule) => 
        sum + (schedule.shifts?.duration_hours || 0), 0
      ),
      employeeStats: {} as Record<string, {
        name: string
        totalShifts: number
        totalHours: number
        pattern: string
        scheduledHours: number
      }>
    }

    // Calculate per-employee statistics
    schedules.forEach(schedule => {
      const employeeId = schedule.employee_id
      if (!stats.employeeStats[employeeId]) {
        stats.employeeStats[employeeId] = {
          name: schedule.employees?.full_name || 'Unknown',
          totalShifts: 0,
          totalHours: 0,
          pattern: schedule.employees?.employee_pattern || 'Unknown',
          scheduledHours: schedule.employees?.weekly_hours_scheduled || 40
        }
      }

      stats.employeeStats[employeeId].totalShifts++
      stats.employeeStats[employeeId].totalHours += schedule.shifts?.duration_hours || 0
    })

    return stats
  }
} 