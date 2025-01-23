'use client'

import { createClient } from '@/utils/supabase/server'
import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { useUser } from '@/lib/hooks'

export default function EmployeeSchedulePage() {
  const { user } = useUser()

  if (!user) {
    return <div>Please sign in to view your schedule.</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Schedule</h1>
      </div>

      <WeeklySchedule />
    </div>
  )
} 