import { SupabaseClient } from '@supabase/supabase-js'
import type { Schedule } from '@/types/schedule'
import type { Pattern, PatternShift } from '@/types/pattern'
import type { Employee } from '@/types/employee'
import type { Shift } from '@/types/schedule'
import { Database } from '@/types/supabase'

export class ScheduleGenerator {
  private supabase: SupabaseClient
  private startDate?: string
  private endDate?: string
  private departmentId?: string
  private batchSize: number = 100

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async initialize(params: {
    startDate: string
    endDate: string
    departmentId?: string
    batchSize?: number
  }) {
    this.startDate = params.startDate
    this.endDate = params.endDate
    this.departmentId = params.departmentId
    this.batchSize = params.batchSize ?? 100
  }

  async generate(): Promise<{ schedules: Schedule[]; errors: Error[] }> {
    try {
      if (!this.startDate || !this.endDate) {
        throw new Error('Start date and end date are required')
      }

      // Get available employees
      const { data: employees, error: employeesError } = await this.supabase
        .from('employees')
        .select('*')
        .eq('status', 'ACTIVE')

      if (employeesError) {
        throw new Error('Failed to fetch employees')
      }

      // Get time off requests for the period
      const { data: timeOffRequests, error: timeOffError } = await this.supabase
        .from('time_off_requests')
        .select('*')
        .eq('status', 'Approved')
        .gte('start_date', this.startDate)
        .lte('end_date', this.endDate)

      if (timeOffError) {
        throw new Error('Failed to fetch time off requests')
      }

      // Get shift patterns
      const { data: patterns, error: patternsError } = await this.supabase
        .from('shift_patterns')
        .select('*')
        .eq('status', 'ACTIVE')

      if (patternsError) {
        throw new Error('Failed to fetch shift patterns')
      }

      const schedules: Schedule[] = []
      const errors: Error[] = []

      // Generate schedules for each pattern
      for (const pattern of patterns) {
        try {
          const schedule = await this.generateSchedule(
            pattern,
            employees,
            timeOffRequests
          )
          schedules.push(schedule)
        } catch (error) {
          errors.push(error as Error)
        }
      }

      return { schedules, errors }
    } catch (error) {
      console.error('Error generating schedules:', error)
      throw error
    }
  }

  private async generateSchedule(
    pattern: Pattern,
    employees: Employee[],
    timeOffRequests: any[]
  ): Promise<Schedule> {
    if (!this.startDate || !this.endDate) {
      throw new Error('Start date and end date are required')
    }

    // Generate shifts based on pattern
    const shifts = this.generateShifts(
      pattern,
      employees,
      timeOffRequests
    )

    return {
      date: this.startDate,
      employee_id: employees[0].id, // We'll need to implement proper employee assignment
      shift_id: shifts[0].id, // We'll need to implement proper shift assignment
      status: 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      id: crypto.randomUUID()
    }
  }

  private generateShifts(
    pattern: Pattern,
    employees: Employee[],
    timeOffRequests: any[]
  ): Shift[] {
    if (!this.startDate || !this.endDate) {
      throw new Error('Start date and end date are required')
    }

    const shifts: Shift[] = []
    const currentDate = new Date(this.startDate)
    const endDate = new Date(this.endDate)

    while (currentDate <= endDate) {
      // Get available employees for this day
      const availableEmployees = this.getAvailableEmployees(
        currentDate,
        employees,
        timeOffRequests
      )

      // Generate shifts for this day based on pattern
      pattern.shifts.forEach((patternShift: PatternShift) => {
        const shift: Shift = {
          start_time: patternShift.start_time,
          end_time: patternShift.end_time,
          shift_type_id: patternShift.shift_type_id,
          duration_hours: patternShift.duration_hours,
          duration_category: patternShift.duration_category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          id: crypto.randomUUID()
        }

        shifts.push(shift)
      })

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return shifts
  }

  private getAvailableEmployees(
    date: Date,
    employees: Employee[],
    timeOffRequests: any[]
  ): Employee[] {
    return employees.filter((employee) => {
      // Check if employee has approved time off for this date
      const hasTimeOff = timeOffRequests.some(
        (request) =>
          request.employee_id === employee.id &&
          new Date(request.start_date) <= date &&
          new Date(request.end_date) >= date
      )

      return !hasTimeOff
    })
  }

  private assignEmployee(
    availableEmployees: Employee[],
    role: Database['public']['Enums']['employee_role_enum'],
    existingShifts: Shift[]
  ): string {
    // Filter employees by role
    const eligibleEmployees = availableEmployees.filter(
      (employee) => employee.employee_role === role
    )

    if (eligibleEmployees.length === 0) {
      throw new Error(`No available employees for role: ${role}`)
    }

    // Sort employees by number of assigned shifts (ascending)
    eligibleEmployees.sort((a, b) => {
      const aShifts = existingShifts.filter(
        (shift) => shift.employee_id === a.id
      ).length
      const bShifts = existingShifts.filter(
        (shift) => shift.employee_id === b.id
      ).length
      return aShifts - bShifts
    })

    // Return the employee with the least number of shifts
    return eligibleEmployees[0].id
  }
} 