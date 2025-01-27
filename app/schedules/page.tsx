'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { scheduleService } from '@/services/scheduleService'
import { ScheduleWithRelations, GenerateScheduleInput } from '@/types/schedule'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { useRoleAccess, RoleGuard } from '@/hooks/useRoleAccess'

export default function SchedulesPage() {
  const router = useRouter()
  const { hasAccess: canGenerateSchedule } = useRoleAccess(['Admin', 'Manager'])
  const { hasAccess: canCreateSchedule } = useRoleAccess(['Admin', 'Manager'])
  const [schedules, setSchedules] = useState<ScheduleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [generating, setGenerating] = useState(false)

  // Fetch schedules for current week
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const weekStart = format(startOfWeek(currentWeek), 'yyyy-MM-dd')
        const weekEnd = format(endOfWeek(currentWeek), 'yyyy-MM-dd')
        
        const data = await scheduleService.getSchedules({
          startDate: weekStart,
          endDate: weekEnd
        })
        
        setSchedules(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch schedules')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [currentWeek])

  // Navigation handlers
  const previousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1))
  const nextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1))
  const today = () => setCurrentWeek(new Date())

  // Generate schedule handler
  const handleGenerateSchedule = async () => {
    try {
      setGenerating(true)
      const options: GenerateScheduleInput = {
        startDate: format(startOfWeek(currentWeek), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(currentWeek), 'yyyy-MM-dd')
      }

      const result = await scheduleService.generateSchedule(options)
      
      if (result.success) {
        // Refresh schedules
        const data = await scheduleService.getSchedules({
          startDate: options.startDate,
          endDate: options.endDate
        })
        setSchedules(data)
        setError(null)
      } else {
        setError('Failed to generate schedule: ' + result.errors?.join(', '))
      }
    } catch (err) {
      setError('Failed to generate schedule')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-4">
          <RoleGuard requiredRoles={['Admin', 'Manager']}>
            <button
              onClick={handleGenerateSchedule}
              disabled={generating || !canGenerateSchedule}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Schedule'}
            </button>
            <button
              onClick={() => router.push('/schedules/new')}
              disabled={!canCreateSchedule}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Create Manual Schedule
            </button>
          </RoleGuard>
          <RoleGuard requiredRoles={['Admin', 'Manager']}>
            <button
              onClick={() => router.push('/schedules/stats')}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              View Statistics
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={previousWeek}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Previous Week
          </button>
          <button
            onClick={today}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Next Week
          </button>
        </div>
        <div className="text-lg font-semibold">
          Week of {format(startOfWeek(currentWeek), 'MMM d, yyyy')}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Time Column Header */}
          <div className="bg-gray-50 p-2 font-semibold">Time</div>
          
          {/* Day Column Headers */}
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="bg-gray-50 p-2 font-semibold">
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200">
            {/* Time Column */}
            <div className="bg-white p-2">
              {format(new Date().setHours(hour, 0), 'h:mm a')}
            </div>

            {/* Schedule Slots */}
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const daySchedules = schedules.filter(schedule => {
                const scheduleDate = new Date(schedule.date)
                return scheduleDate.getDay() === dayIndex
              })

              return (
                <div key={dayIndex} className="bg-white p-2 min-h-[60px]">
                  {daySchedules.map(schedule => (
                    <div
                      key={schedule.id}
                      className="text-sm bg-blue-100 p-1 rounded mb-1"
                    >
                      {schedule.employees.profiles?.full_name || 'Unnamed'} - {schedule.shifts.shift_types.name}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
} 