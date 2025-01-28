'use client'

import { createClient } from '@/utils/supabase/client'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { getWeekStart } from '@/utils/schedule/helpers'
import { addDays, format } from 'date-fns'
import { Employee, EmployeeRole, Shift, CoverageReport, ShiftDurationCategory } from '@/services/scheduler/types'
import { useEffect, useState } from 'react'

const mapLegacyRole = (role: string): EmployeeRole => {
  switch (role) {
    case 'Dispatcher':
      return EmployeeRole.DISPATCHER
    case 'Management':
      return EmployeeRole.MANAGEMENT
    case 'Shift Supervisor':
      return EmployeeRole.SHIFT_SUPERVISOR
    default:
      return EmployeeRole.DISPATCHER
  }
}

export function EmployeeScheduleContent() {
  const [scheduleData, setScheduleData] = useState<{
    schedules: any[]
    employee: Employee | null
    shifts: Shift[]
    coverage: CoverageReport[]
    weekStart: Date
  }>({
    schedules: [],
    employee: null,
    shifts: [],
    coverage: [],
    weekStart: getWeekStart(new Date())
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Please sign in to view your schedule.')
          return
        }

        // Fetch employee data
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select(`
            id,
            employee_role,
            weekly_hours_scheduled,
            default_shift_type_id,
            created_at,
            updated_at,
            user_role,
            profiles (
              id,
              full_name,
              avatar_url,
              username
            )
          `)
          .eq('id', user.id)
          .single()

        if (employeeError) {
          throw employeeError
        }

        if (!employeeData) {
          throw new Error('Employee data not found')
        }

        // Transform employee data
        const employee: Employee = {
          id: employeeData.id,
          user_id: employeeData.id,
          employee_role: mapLegacyRole(employeeData.employee_role),
          weekly_hours_scheduled: employeeData.weekly_hours_scheduled || 40,
          default_shift_type_id: employeeData.default_shift_type_id,
          created_at: employeeData.created_at,
          updated_at: employeeData.updated_at,
          full_name: employeeData.profiles?.full_name || 'Unknown',
          avatar_url: employeeData.profiles?.avatar_url || null,
          username: employeeData.profiles?.username || null,
          user_role: employeeData.user_role === 'Admin' ? 'Admin' : 'Employee'
        }

        const weekStart = getWeekStart(new Date())
        const weekEnd = addDays(weekStart, 6)

        // Fetch schedules for the current week
        const { data: schedules, error: schedulesError } = await supabase
          .from('schedules')
          .select('*')
          .eq('employee_id', user.id)
          .gte('date', format(weekStart, 'yyyy-MM-dd'))
          .lte('date', format(weekEnd, 'yyyy-MM-dd'))

        if (schedulesError) {
          throw schedulesError
        }

        // Fetch all shifts
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .order('start_time')

        if (shiftsError) {
          throw shiftsError
        }

        // Transform shifts data
        const shifts: Shift[] = shiftsData?.map(shift => {
          let duration_category: ShiftDurationCategory = ShiftDurationCategory.TEN_HOURS // Default
          switch (shift.duration_hours) {
            case 4: duration_category = ShiftDurationCategory.FOUR_HOURS; break
            case 12: duration_category = ShiftDurationCategory.TWELVE_HOURS; break
            // 10 hours is the default
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
          const { data: requirements, error: requirementsError } = await supabase
            .from('staffing_requirements')
            .select('*')
            .order('start_time')

          if (requirementsError) {
            throw requirementsError
          }

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

        setScheduleData({
          schedules: schedules || [],
          employee,
          shifts,
          coverage,
          weekStart
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching schedule data')
      } finally {
        setLoading(false)
      }
    }

    fetchScheduleData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!scheduleData.employee) {
    return <div>No schedule data found.</div>
  }

  return (
    <div className="space-y-4">
      <WeeklySchedule
        startDate={scheduleData.weekStart}
        schedules={scheduleData.schedules}
        employees={[scheduleData.employee]}
        shifts={scheduleData.shifts}
        coverage={scheduleData.coverage}
      />
    </div>
  )
} 