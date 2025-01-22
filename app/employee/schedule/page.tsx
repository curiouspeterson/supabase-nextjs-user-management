import { createClient } from '@/utils/supabase/server'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'

export default async function EmployeeSchedulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          Please sign in to view your schedule
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-8 px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Schedule</h1>
      </div>

      <WeeklySchedule employeeId={user.id} />
    </div>
  )
} 