'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/app/database.types'
import { DayOfWeek, formatDate, getWeekStart } from '@/utils/schedule'
import { SupabaseClient } from '@supabase/supabase-js'

type Props = {
  weekStart?: Date
  employeeId?: string
  isManager?: boolean
}

type ScheduleWithDetails = Database['public']['Tables']['schedules']['Row'] & {
  shifts: Database['public']['Tables']['shifts']['Row']
  employees: Database['public']['Tables']['profiles']['Row'] & Database['public']['Tables']['employees']['Row']
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[]

export default function WeeklySchedule({ weekStart = new Date(), employeeId, isManager = false }: Props) {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(weekStart))

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient() as SupabaseClient<Database>
        
        let query = supabase
          .from('schedules')
          .select(`
            *,
            shifts:shifts(*),
            employees:profiles!inner(*)
          `)
          .eq('week_start_date', formatDate(currentWeek))

        if (!isManager && employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data, error: err } = await query

        if (err) throw err

        setSchedules(data as unknown as ScheduleWithDetails[])
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setError('Failed to load schedules')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [currentWeek, employeeId, isManager])

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(getWeekStart(newDate))
  }

  const formatShiftTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading schedules...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Previous Week
        </button>
        <h2 className="text-xl font-bold">
          Week of {currentWeek.toLocaleDateString()}
        </h2>
        <button
          onClick={() => navigateWeek('next')}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Next Week
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="border p-2">Day</th>
              {isManager && <th className="border p-2">Employee</th>}
              <th className="border p-2">Shift</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {DAYS_OF_WEEK.map((day) => {
              const daySchedules = schedules.filter(
                (schedule) => schedule.day_of_week === day
              )

              if (daySchedules.length === 0) {
                return (
                  <tr key={day}>
                    <td className="border p-2">{day}</td>
                    {isManager && <td className="border p-2">-</td>}
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                  </tr>
                )
              }

              return daySchedules.map((schedule, index) => (
                <tr key={`${day}-${index}`}>
                  {index === 0 && (
                    <td className="border p-2" rowSpan={daySchedules.length}>
                      {day}
                    </td>
                  )}
                  {isManager && (
                    <td className="border p-2">
                      {schedule.employees?.full_name || 'Unknown'}
                    </td>
                  )}
                  <td className="border p-2">{schedule.shifts?.shift_name}</td>
                  <td className="border p-2">
                    {formatShiftTime(schedule.shifts?.start_time)} -{' '}
                    {formatShiftTime(schedule.shifts?.end_time)}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        schedule.schedule_status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {schedule.schedule_status}
                    </span>
                  </td>
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 