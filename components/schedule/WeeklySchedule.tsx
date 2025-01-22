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
  shifts: Database['public']['Tables']['shifts']['Row'] & {
    shift_types: Database['public']['Tables']['shift_types']['Row']
  }
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
            shifts!inner(
              *,
              shift_types(*)
            ),
            employees:profiles!inner(*)
          `)
          .eq('week_start_date', formatDate(currentWeek))

        if (!isManager && employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data, error: err } = await query

        if (err) {
          throw err
        }

        setSchedules(data || [])
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setError('Failed to load schedules')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [currentWeek, employeeId, isManager])

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            const newDate = new Date(currentWeek)
            newDate.setDate(newDate.getDate() - 7)
            setCurrentWeek(getWeekStart(newDate))
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Previous Week
        </button>
        <div className="text-lg font-semibold">
          Week of {formatDate(currentWeek)}
        </div>
        <button
          onClick={() => {
            const newDate = new Date(currentWeek)
            newDate.setDate(newDate.getDate() + 7)
            setCurrentWeek(getWeekStart(newDate))
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Next Week
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shift Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              {isManager && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedules = schedules.filter(
                (schedule) => schedule.day_of_week === day
              )

              return daySchedules.length > 0 ? (
                daySchedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.shifts.shift_types.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(schedule.shifts.start_time)} -{' '}
                      {formatTime(schedule.shifts.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.shifts.duration_category}
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.employees.full_name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            schedule.schedule_status === 'Draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                      >
                        {schedule.schedule_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={day}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day}
                  </td>
                  <td
                    colSpan={isManager ? 5 : 4}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    No shift scheduled
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 