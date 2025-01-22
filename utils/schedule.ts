import { Database } from '@/app/database.types'
import { createClient as createSupabaseClient } from '@/utils/supabase/client'
import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

export type Shift = Database['public']['Tables']['shifts']['Row']
export type Schedule = Database['public']['Tables']['schedules']['Row']
export type Employee = Database['public']['Tables']['employees']['Row']
export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']
export type StaffingRequirement = Database['public']['Tables']['staffing_requirements']['Row']
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[]

// Helper function to get the start of the week (Monday) for a given date
export function getWeekStart(date: Date): Date {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  return new Date(date.setDate(diff))
}

// Helper function to format a date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper function to parse time string (HH:mm:ss) to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function to check if two time ranges overlap
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  // Handle cases where end time is on the next day (e.g., "23:00" to "05:00")
  const range1CrossesMidnight = end1Min <= start1Min
  const range2CrossesMidnight = end2Min <= start2Min

  if (!range1CrossesMidnight && !range2CrossesMidnight) {
    // Neither range crosses midnight
    return start1Min < end2Min && start2Min < end1Min
  } else if (range1CrossesMidnight && range2CrossesMidnight) {
    // Both ranges cross midnight
    return true
  } else if (range1CrossesMidnight) {
    // Only range1 crosses midnight
    return start2Min < end1Min || start2Min >= start1Min
  } else {
    // Only range2 crosses midnight
    return start1Min < end2Min || start1Min >= start2Min
  }
}

// Helper function to calculate total hours between two times
export function calculateHours(start: string, end: string): number {
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  
  if (endMin <= startMin) {
    // Shift crosses midnight
    return (24 * 60 - startMin + endMin) / 60
  } else {
    return (endMin - startMin) / 60
  }
}

// Helper function to check if an employee is available for a shift
export async function isEmployeeAvailable(
  employeeId: string,
  date: Date,
  shiftStart: string,
  shiftEnd: string
): Promise<boolean> {
  const supabase = createSupabaseClient() as SupabaseClient<Database>
  
  // Check for approved time off requests
  const { data: timeOffRequests } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('status', 'Approved')
    .lte('start_date', formatDate(date))
    .gte('end_date', formatDate(date))

  if (timeOffRequests && timeOffRequests.length > 0) {
    return false
  }

  // Check for other shifts on the same day
  const { data: existingShifts } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('employee_id', employeeId)
    .eq('week_start_date', formatDate(getWeekStart(date)))
    .eq('day_of_week', DAYS_OF_WEEK[date.getDay()])

  if (existingShifts) {
    for (const schedule of existingShifts) {
      if (!schedule.shifts) continue
      const shift = schedule.shifts as unknown as Shift
      if (timeRangesOverlap(shift.start_time, shift.end_time, shiftStart, shiftEnd)) {
        return false
      }
    }
  }

  // Check weekly hours limit
  const weekStart = getWeekStart(date)
  const { data: weeklySchedules } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('employee_id', employeeId)
    .eq('week_start_date', formatDate(weekStart))

  let totalHours = 0
  if (weeklySchedules) {
    for (const schedule of weeklySchedules) {
      if (!schedule.shifts) continue
      const shift = schedule.shifts as unknown as Shift
      totalHours += calculateHours(shift.start_time, shift.end_time)
    }
  }

  // Add hours of the new shift
  totalHours += calculateHours(shiftStart, shiftEnd)

  // Check if total hours would exceed 40
  return totalHours <= 40
}

// Helper function to get minimum staffing requirement for a given time
export async function getStaffingRequirement(time: string): Promise<number> {
  const supabase = createSupabaseClient() as SupabaseClient<Database>
  
  const { data: requirements } = await supabase
    .from('staffing_requirements')
    .select('*')

  if (!requirements) return 0

  for (const req of requirements) {
    if (timeRangesOverlap(req.start_time, req.end_time, time, time)) {
      return req.minimum_employees
    }
  }

  return 0
}

// Helper function to check if staffing requirements are met for a given time
export async function checkStaffingRequirements(
  date: Date,
  time: string
): Promise<boolean> {
  const supabase = createSupabaseClient() as SupabaseClient<Database>
  
  const minRequired = await getStaffingRequirement(time)
  
  // Get all schedules for this day
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('week_start_date', formatDate(getWeekStart(date)))
    .eq('day_of_week', DAYS_OF_WEEK[date.getDay()])

  if (!schedules) return false

  let staffedCount = 0
  for (const schedule of schedules) {
    if (!schedule.shifts) continue
    const shift = schedule.shifts as unknown as Shift
    if (timeRangesOverlap(shift.start_time, shift.end_time, time, time)) {
      staffedCount++
    }
  }

  return staffedCount >= minRequired
}

// Helper function to get all employees available for a shift
export async function getAvailableEmployees(
  date: Date,
  shiftStart: string,
  shiftEnd: string
): Promise<Employee[]> {
  const supabase = createSupabaseClient() as SupabaseClient<Database>
  
  const { data: employees } = await supabase
    .from('employees')
    .select('*')

  if (!employees) return []

  const availableEmployees: Employee[] = []
  for (const employee of employees) {
    if (await isEmployeeAvailable(employee.id, date, shiftStart, shiftEnd)) {
      availableEmployees.push(employee)
    }
  }

  return availableEmployees
}

// Helper function to generate a draft schedule for a week
export async function generateDraftSchedule(weekStart: Date): Promise<void> {
  const supabase = createSupabaseClient() as SupabaseClient<Database>
  
  // Get all shifts
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')

  if (!shifts) return

  // For each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart)
    currentDate.setDate(currentDate.getDate() + i)
    const dayOfWeek = DAYS_OF_WEEK[currentDate.getDay()]

    // For each shift
    for (const shift of shifts) {
      // Get available employees for this shift
      const availableEmployees = await getAvailableEmployees(
        currentDate,
        shift.start_time,
        shift.end_time
      )

      // Check staffing requirements
      const minRequired = await getStaffingRequirement(shift.start_time)
      const currentlyStaffed = (await supabase
        .from('schedules')
        .select('*')
        .eq('week_start_date', formatDate(weekStart))
        .eq('day_of_week', dayOfWeek)
        .eq('shift_id', shift.id)).data?.length || 0

      // Assign employees to meet minimum staffing
      for (const employee of availableEmployees) {
        if (currentlyStaffed >= minRequired) break

        // Create schedule entry
        await supabase
          .from('schedules')
          .insert({
            week_start_date: formatDate(weekStart),
            day_of_week: dayOfWeek,
            shift_id: shift.id,
            employee_id: employee.id,
            schedule_status: 'Draft'
          } as Database['public']['Tables']['schedules']['Insert'])
      }
    }
  }
} 