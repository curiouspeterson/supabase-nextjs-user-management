import { Suspense } from 'react'
import DispatchSchedule from '@/components/schedule/DispatchSchedule'
import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { transformDatabaseShift } from '@/components/schedule/types'
import type { DispatchScheduleData, ShiftAssignment } from '@/components/schedule/types'

export const metadata: Metadata = {
  title: 'Dispatch Schedule | 911 Dispatch Management',
  description: 'Manage and view 24/7 dispatch schedules, shifts, and staffing levels',
}

async function getScheduleData(date: string): Promise<DispatchScheduleData> {
  const supabase = createClient()
  
  // Fetch shifts with assignments
  const { data: schedules, error: schedulesError } = await supabase
    .from('schedules')
    .select(`
      *,
      shifts (*),
      employees (
        id,
        profiles (
          full_name
        )
      )
    `)
    .eq('date', date)

  if (schedulesError) throw schedulesError

  // Group assignments by shift
  const shiftAssignments = new Map<string, ShiftAssignment[]>()
  
  schedules?.forEach(schedule => {
    const shift = schedule.shifts
    const employee = schedule.employees?.profiles
    
    if (!shift || !employee) return
    
    // Skip if no full name is available
    if (!employee.full_name) return
    
    if (!shiftAssignments.has(shift.id)) {
      shiftAssignments.set(shift.id, [])
    }
    
    const assignments = shiftAssignments.get(shift.id)
    if (assignments) {
      assignments.push({
        name: employee.full_name,
        status: 'Regular',
        startTime: shift.start_time,
        endTime: shift.end_time
      })
    }
  })

  // Transform shifts
  const displayShifts = schedules?.map(schedule => {
    const shift = schedule.shifts
    if (!shift) return null
    
    return transformDatabaseShift(
      shift,
      shiftAssignments.get(shift.id) || []
    )
  }).filter((shift): shift is NonNullable<typeof shift> => shift !== null) || []

  // Get requirements
  const requirements = [
    {
      period: 'Early Morning',
      required: 6,
      assigned: displayShifts.reduce((count, shift) => 
        count + (shift?.assignments.filter(a => 
          a.startTime >= '05:00' && a.startTime < '09:00'
        ).length || 0), 0),
      status: 'Not Met' as const,
      startHour: 5,
      endHour: 9,
      color: '#ef4444'
    },
    {
      period: 'Day',
      required: 8,
      assigned: 4,
      status: 'Not Met' as const,
      startHour: 9,
      endHour: 17,
      color: '#3b82f6'
    },
    {
      period: 'Night',
      required: 7,
      assigned: 8,
      status: 'Met' as const,
      startHour: 17,
      endHour: 23,
      color: '#22c55e'
    },
    {
      period: 'Overnight',
      required: 6,
      assigned: 2,
      status: 'Not Met' as const,
      startHour: 23,
      endHour: 28,
      color: '#f59e0b'
    },
  ]

  return {
    date,
    shifts: displayShifts,
    requirements
  }
}

export default async function SchedulePage() {
  const date = new Date().toISOString().split('T')[0]
  const scheduleData = await getScheduleData(date)
  
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Suspense fallback={<div>Loading schedule...</div>}>
        <DispatchSchedule {...scheduleData} />
      </Suspense>
    </div>
  )
} 