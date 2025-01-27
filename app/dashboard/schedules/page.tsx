import { createClient } from '@/utils/supabase/server'
import { generateDraftSchedule } from '@/utils/schedule/actions'
import { getWeekStart } from '@/utils/schedule/helpers'
import { revalidatePath } from 'next/cache'
import { ScheduleActions } from './components/schedule-actions'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { addDays, format } from 'date-fns'
import type { Employee, Shift, CoverageReport, ShiftDurationCategory } from '@/services/scheduler/types'
import type { Database } from '@/types/supabase'

type EmployeeWithProfile = Database['public']['Tables']['employees']['Row'] & {
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  }[]
}

export default async function ScheduleManagementPage() {
  const supabase = await createClient()
  const weekStart = getWeekStart(new Date())
  const weekEnd = addDays(weekStart, 6)

  // Fetch schedules for the current week
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .gte('date', format(weekStart, 'yyyy-MM-dd'))
    .lte('date', format(weekEnd, 'yyyy-MM-dd'))

  // Fetch all employees with their profiles
  const { data: employeesData } = await supabase
    .from('employees')
    .select('*, profiles(id, full_name, avatar_url, username)')
    .order('profiles(full_name)') as { data: EmployeeWithProfile[] | null }

  // Transform employee data to match the expected type
  const employees: Employee[] = employeesData?.map(employee => {
    const profile = employee.profiles?.find(p => p.id === employee.id)
    return {
      id: employee.id,
      user_id: employee.id,
      employee_role: employee.employee_role === 'Management' ? 'Manager' : employee.employee_role,
      weekly_hours_scheduled: employee.weekly_hours_scheduled || 40,
      default_shift_type_id: employee.default_shift_type_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
      full_name: profile?.full_name || 'Unknown',
      avatar_url: profile?.avatar_url || null,
      username: profile?.username || null,
    }
  }) || []

  // Fetch all shifts
  const { data: shiftsData } = await supabase
    .from('shifts')
    .select('*')
    .order('start_time')

  // Transform shifts data to match the expected type
  const shifts: Shift[] = shiftsData?.map(shift => {
    // Map duration_category based on duration_hours
    let duration_category: ShiftDurationCategory
    switch (shift.duration_hours) {
      case 4:
        duration_category = '4 hours'
        break
      case 8:
        duration_category = '8 hours'
        break
      case 10:
        duration_category = '10 hours'
        break
      case 12:
        duration_category = '12 hours'
        break
      default:
        duration_category = '8 hours' // Default to 8 hours if unknown
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

  // Initialize coverage reports for each day in the week
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

  // Calculate actual coverage, supervisors, and overtime
  if (schedules) {
    coverage.forEach(report => {
      Object.keys(report.periods).forEach(periodKey => {
        const [startTime, endTime] = periodKey.split('-')
        const periodSchedules = schedules.filter(schedule => {
          const shift = shifts.find(s => s.id === schedule.shift_id)
          return shift && 
                 schedule.date === report.date && 
                 shift.start_time >= startTime && 
                 shift.end_time <= endTime
        })

        report.periods[periodKey].actual = periodSchedules.length
        report.periods[periodKey].supervisors = periodSchedules.filter(schedule => {
          const employee = employees.find(e => e.id === schedule.employee_id)
          return employee?.employee_role === 'Shift Supervisor'
        }).length

        // Calculate overtime based on weekly hours
        const weeklyHours = new Map<string, number>()
        periodSchedules.forEach(schedule => {
          const shift = shifts.find(s => s.id === schedule.shift_id)
          const employee = employees.find(e => e.id === schedule.employee_id)
          if (shift && employee) {
            const hours = weeklyHours.get(employee.id) || 0
            weeklyHours.set(employee.id, hours + shift.duration_hours)
            if (weeklyHours.get(employee.id)! > (employee.weekly_hours_scheduled || 40)) {
              report.periods[periodKey].overtime++
            }
          }
        })
      })
    })
  }

  const generateSchedule = async () => {
    'use server'
    
    const weekStart = getWeekStart(new Date())
    await generateDraftSchedule(weekStart)
    revalidatePath('/dashboard/schedules')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Schedule Management</h1>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Current Week Schedule</h2>
          <div className="flex gap-4">
            <form action={generateSchedule}>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              >
                Generate Schedule
              </button>
            </form>
            <ScheduleActions weekStart={weekStart} />
          </div>
        </div>
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