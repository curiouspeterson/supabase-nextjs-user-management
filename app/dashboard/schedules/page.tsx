import { createClient } from '@/utils/supabase/server'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { generateDraftSchedule, getWeekStart } from '@/utils/schedule'
import { revalidatePath } from 'next/cache'

export default async function ScheduleManagementPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          Please sign in to manage schedules
        </div>
      </div>
    )
  }

  // Check if user is a manager
  const { data: employee } = await supabase
    .from('employees')
    .select('user_role')
    .eq('id', user.id)
    .single()

  if (!employee || !['Manager', 'Admin'].includes(employee.user_role)) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          You do not have permission to manage schedules
        </div>
      </div>
    )
  }

  async function generateSchedule() {
    'use server'
    
    const weekStart = getWeekStart(new Date())
    await generateDraftSchedule(weekStart)
    revalidatePath('/dashboard/schedules')
  }

  async function publishSchedule() {
    'use server'
    
    const supabase = await createClient()
    const weekStart = getWeekStart(new Date())
    
    await supabase
      .from('schedules')
      .update({ schedule_status: 'Published' })
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .eq('schedule_status', 'Draft')

    revalidatePath('/dashboard/schedules')
  }

  return (
    <div className="flex-1 flex flex-col gap-8 px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <div className="flex gap-4">
          <form action={generateSchedule}>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Generate Draft Schedule
            </button>
          </form>
          <form action={publishSchedule}>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Publish Schedule
            </button>
          </form>
        </div>
      </div>

      <WeeklySchedule isManager={true} />
    </div>
  )
} 