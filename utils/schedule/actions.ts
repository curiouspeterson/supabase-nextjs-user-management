'use server'

import { createClient as createSupabaseClient } from '@/utils/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { formatDate, timeRangesOverlap, calculateHours, DAYS_OF_WEEK } from './helpers'
import type { Employee, Shift } from './helpers'

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
    .eq('date', formatDate(date))

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
  const weekStart = new Date(date)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Start from Monday
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  
  const { data: weeklySchedules } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('employee_id', employeeId)
    .gte('date', formatDate(weekStart))
    .lte('date', formatDate(weekEnd))

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
  
  const { data: requirements, error } = await supabase
    .from('staffing_requirements')
    .select('*')

  if (error || !requirements || requirements.length === 0) return 0

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
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*, shifts(*)')
    .eq('date', formatDate(date))

  if (error || !schedules) return false

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
        .eq('date', formatDate(currentDate))
        .eq('shift_id', shift.id)).data?.length || 0

      // If we need more staff and have available employees, assign them
      if (currentlyStaffed < minRequired && availableEmployees.length > 0) {
        // For now, just assign the first available employee
        const employee = availableEmployees[0]
        await supabase
          .from('schedules')
          .insert({
            employee_id: employee.id,
            shift_id: shift.id,
            date: formatDate(currentDate),
            status: 'Draft'
          })
      }
    }
  }
} 