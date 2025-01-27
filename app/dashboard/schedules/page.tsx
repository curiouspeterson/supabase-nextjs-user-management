import { createClient } from '@/utils/supabase/server'
import { generateDraftSchedule, getWeekStart } from '@/utils/schedule'
import { revalidatePath } from 'next/cache'
import { ScheduleActions } from './components/schedule-actions'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { addDays, format } from 'date-fns'
import type { Employee } from '@/services/scheduler/types'

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

  // Fetch all employees
  const { data: employeesData } = await supabase
    .from('employees')
    .select('*, profiles(full_name, avatar_url)')
    .order('profiles(full_name)')

  // Transform employee data to match the expected type
  const employees: Employee[] = employeesData?.map(employee => ({
    id: employee.id,
    user_id: employee.id, // Using the same ID since we're using a single ID for both
    employee_role: employee.employee_role,
    user_role: employee.user_role,
    weekly_hours_scheduled: employee.weekly_hours_scheduled,
    default_shift_type_id: employee.default_shift_type_id,
    allow_overtime: employee.allow_overtime || false,
    max_weekly_hours: employee.max_weekly_hours || 40,
    full_name: employee.profiles?.full_name || '',
    avatar_url: employee.profiles?.avatar_url || null,
    created_at: employee.created_at || new Date().toISOString(),
    updated_at: employee.updated_at || new Date().toISOString()
  })) || []

  // Fetch all shifts
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')
    .order('start_time')

  // Fetch coverage requirements
  const { data: coverage } = await supabase
    .from('staffing_requirements')
    .select('*')
    .gte('date', format(weekStart, 'yyyy-MM-dd'))
    .lte('date', format(weekEnd, 'yyyy-MM-dd'))

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
          shifts={shifts || []}
          coverage={coverage || []}
        />
      </div>
    </div>
  )
} 