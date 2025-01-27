'use client'

import { createClient } from '@/utils/supabase/server'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { getWeekStart } from '@/utils/schedule/helpers'
import { addDays, format } from 'date-fns'
import type { Employee, Shift, CoverageReport, ShiftDurationCategory } from '@/services/scheduler/types'

export async function EmployeeScheduleContent() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in to view your schedule.</div>
  }

  // Fetch employee data
  const { data: employeeData } = await supabase
    .from('employees')
    .select('*, profiles(id, full_name, avatar_url, username)')
    .eq('id', user.id)
    .single()

  if (!employeeData) {
    throw new Error('Employee data not found')
  }

  // Transform employee data
  const employee: Employee = {
    id: employeeData.id,
    user_id: employeeData.id,
    employee_role: employeeData.employee_role === 'Management' ? 'Manager' : employeeData.employee_role,
    weekly_hours_scheduled: employeeData.weekly_hours_scheduled || 40,
    default_shift_type_id: employeeData.default_shift_type_id,
    created_at: employeeData.created_at,
    updated_at: employeeData.updated_at,
    full_name: employeeData.profiles?.full_name || 'Unknown',
    avatar_url: employeeData.profiles?.avatar_url || null,
    username: employeeData.profiles?.username || null,
  }

  const weekStart = getWeekStart(new Date())
  const weekEnd = addDays(weekStart, 6)

  // Fetch schedules for the current week
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('employee_id', user.id)
    .gte('date', format(weekStart, 'yyyy-MM-dd'))
    .lte('date', format(weekEnd, 'yyyy-MM-dd'))

  // Fetch all shifts
  const { data: shiftsData } = await supabase
    .from('shifts')
    .select('*')
    .order('start_time')

  // Transform shifts data
  const shifts: Shift[] = shiftsData?.map(shift => {
    let duration_category: ShiftDurationCategory = '8 hours' // Default
    switch (shift.duration_hours) {
      case 4: duration_category = '4 hours'; break
      case 8: duration_category = '8 hours'; break
      case 10: duration_category = '10 hours'; break
      case 12: duration_category = '12 hours'; break
    }

    return {
      id: shift.id,
      shift_type_id: shift.shift_type_id,
      start_time: shift.start_time,
      end_time: shift.end_time,
      duration_hours: shift.duration_hours,
      duration_category,
      created_at: shift.created_at,
      updated_at: shift.updated_at
    }
  }) || []

  // Initialize coverage reports
  const coverage: CoverageReport[] = []
  let currentDate = weekStart

  while (currentDate <= weekEnd) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    
    // Fetch staffing requirements
    const { data: requirements } = await supabase
      .from('staffing_requirements')
      .select('*')
      .order('start_time')

    // Create coverage report for this day
    const report: CoverageReport = {
      date: dateStr,
      periods: {}
    }

    // Add each requirement period to the report
    requirements?.forEach(req => {
      const periodKey = `${req.start_time}-${req.end_time}`
      report.periods[periodKey] = {
        required: req.minimum_employees,
        actual: 0,
        supervisors: 0,
        overtime: 0
      }
    })

    coverage.push(report)
    currentDate = addDays(currentDate, 1)
  }

  return (
    <div className="space-y-4">
      <WeeklySchedule
        schedules={schedules || []}
        employees={[employee]}
        shifts={shifts}
        coverage={coverage}
      />
    </div>
  )
} 