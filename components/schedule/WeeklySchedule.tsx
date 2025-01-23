'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/app/database.types'
import { DayOfWeek, formatDate, getWeekStart, startOfWeek } from '@/utils/schedule'
import { SupabaseClient } from '@supabase/supabase-js'
import { useUser } from '@/lib/hooks'

type WeeklyScheduleProps = {
  isManager?: boolean
}

type ScheduleWithDetails = Database['public']['Tables']['schedules']['Row'] & {
  shifts: Array<Database['public']['Tables']['shifts']['Row'] & {
    shift_types: Database['public']['Tables']['shift_types']['Row']
  }>,
  employees: Database['public']['Tables']['employees']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[]

export default function WeeklySchedule({ isManager = false }: WeeklyScheduleProps) {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))
  const { user } = useUser()

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient() as SupabaseClient<Database>
      let query = supabase
        .from('schedules')
        .select(`
          *,
          shifts!inner(
            *,
            shift_types(*)
          ),
          employees!inner(
            *,
            profiles(*)
          )
        `)
        .eq('week_start_date', formatDate(currentWeek))

      if (!isManager && user?.id) {
        query = query.eq('employee_id', user.id)
      }

      const { data, error } = await query

      if (error) throw error

      const typedData = (data || []) as unknown as ScheduleWithDetails[]
      setSchedules(typedData)
    } catch (error: any) {
      console.error('Error fetching schedules:', error)
      setError(error?.message || 'Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }, [currentWeek, isManager, user?.id])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            const newDate = new Date(currentWeek)
            newDate.setDate(newDate.getDate() - 7)
            setCurrentWeek(startOfWeek(newDate))
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Previous Week
        </button>
        <span className="text-lg font-semibold">
          Week of {formatDate(currentWeek)}
        </span>
        <button
          onClick={() => {
            const newDate = new Date(currentWeek)
            newDate.setDate(newDate.getDate() + 7)
            setCurrentWeek(startOfWeek(newDate))
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Next Week
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              {isManager && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shift Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {schedule.day_of_week}
                </td>
                {isManager && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.employees.profiles.full_name}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {schedule.shifts[0].shift_types.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(schedule.shifts[0].start_time)} -{' '}
                  {formatTime(schedule.shifts[0].end_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {schedule.shifts[0].duration_category}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 