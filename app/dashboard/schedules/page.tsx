import { createClient } from '@/utils/supabase/server'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { getWeekStart } from '@/utils/schedule/helpers'
import { addDays, format } from 'date-fns'
import type { Employee, EmployeeRole, Shift, CoverageReport, ShiftDurationCategory } from '@/services/scheduler/types'
import type { Database } from '@/types/supabase'

type EmployeeWithProfile = Database['public']['Tables']['employees']['Row'] & {
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
    username: string | null
  }
  user_role: 'Employee' | 'Admin'
}

const mapLegacyRole = (role: string): EmployeeRole => {
  switch (role) {
    case 'Dispatcher':
      return 'Employee'
    case 'Manager':
      return 'Management'
    case 'Shift Supervisor':
      return 'Shift Supervisor'
    default:
      return 'Employee'
  }
}

export default async function SchedulesPage() {
  const supabase = createClient()

  // Fetch all employees with their profiles
  const { data: employeesData } = await supabase
    .from('employees')
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        username
      )
    `) as { data: EmployeeWithProfile[] | null }

  // Transform employee data to match the expected type
  const employees: Employee[] = employeesData?.map(employee => {
    return {
      id: employee.id,
      user_id: employee.id,
      employee_role: mapLegacyRole(employee.employee_role),
      weekly_hours_scheduled: employee.weekly_hours_scheduled || 40,
      default_shift_type_id: employee.default_shift_type_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
      full_name: employee.profiles?.full_name || 'Unknown',
      avatar_url: employee.profiles?.avatar_url || null,
      username: employee.profiles?.username || null,
      user_role: employee.user_role === 'Admin' ? 'Admin' : 'Employee'
    }
  }) || []

  const weekStart = getWeekStart(new Date())
  const weekEnd = addDays(weekStart, 6)

  // Fetch schedules for the current week
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
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
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
      </div>

      <div className="space-y-4">
        <WeeklySchedule
          schedules={schedules || []}
          employees={employees}
          shifts={shifts}
          coverage={coverage}
        />
      </div>
    </div>
  )
} 