'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/lib/database.types'
import type { Schedule, Shift, ShiftType } from '@/types/schedule'
import { addHours, format } from 'date-fns'

type DurationCategory = "4 hours" | "10 hours" | "12 hours"
const DURATION_CATEGORIES: DurationCategory[] = ["4 hours", "10 hours", "12 hours"]

type ScheduleStatus = "Draft" | "Published"

interface ShiftManagerProps {
  date: Date
  employeeId: string
  onClose: () => void
  onSave: () => void
  shift?: Schedule & { shifts: Shift }
}

export default function ShiftManager({ date, employeeId, onClose, onSave, shift }: ShiftManagerProps) {
  const [startTime, setStartTime] = useState(shift?.shifts?.start_time || '00:00')
  const [duration, setDuration] = useState<number>(shift?.shifts?.duration_hours || 4)
  const [shiftTypeId, setShiftTypeId] = useState(shift?.shifts?.shift_type_id || '')
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Load shift types
  useEffect(() => {
    async function loadShiftTypes() {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error loading shift types:', error)
        return
      }
      
      setShiftTypes(data)
      if (!shift && data.length > 0) {
        setShiftTypeId(data[0].id)
      }
    }
    
    loadShiftTypes()
  }, [supabase, shift])

  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, durationHours: number) => {
    const [hours, minutes] = start.split(':').map(Number)
    const startDate = new Date(2000, 0, 1, hours, minutes)
    const endDate = addHours(startDate, durationHours)
    return format(endDate, 'HH:mm')
  }

  const getDurationCategory = (hours: number): DurationCategory => {
    switch (hours) {
      case 4:
        return "4 hours"
      case 10:
        return "10 hours"
      case 12:
        return "12 hours"
      default:
        return "4 hours" // Default to shortest shift if invalid duration
    }
  }

  const handleSave = async () => {
    if (!shiftTypeId || !employeeId) {
      console.error('Missing required fields')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const endTime = calculateEndTime(startTime, duration)
      const shiftData = {
        start_time: startTime,
        end_time: endTime,
        duration_hours: duration,
        shift_type_id: shiftTypeId,
        duration_category: getDurationCategory(duration)
      }

      if (shift) {
        // Update existing shift
        const { error: shiftError } = await supabase
          .from('shifts')
          .update(shiftData)
          .eq('id', shift.shift_id)

        if (shiftError) throw shiftError
      } else {
        // Create new shift first
        const { data: newShift, error: shiftError } = await supabase
          .from('shifts')
          .insert(shiftData)
          .select()
          .single()

        if (shiftError) throw shiftError

        // Then create the schedule with required fields
        const scheduleData: {
          date: string
          employee_id: string
          shift_id: string
          status: ScheduleStatus
        } = {
          date: date.toISOString().split('T')[0],
          employee_id: employeeId,
          shift_id: newShift.id,
          status: 'Draft'
        }

        const { error: scheduleError } = await supabase
          .from('schedules')
          .insert(scheduleData)

        if (scheduleError) throw scheduleError
      }

      onSave()
    } catch (error) {
      console.error('Error saving shift:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {shift ? 'Edit Shift' : 'Add New Shift'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shift Type
            </label>
            <select
              value={shiftTypeId}
              onChange={(e) => setShiftTypeId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dispatch-500 focus:ring-dispatch-500"
            >
              {shiftTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dispatch-500 focus:ring-dispatch-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dispatch-500 focus:ring-dispatch-500"
            >
              <option value={4}>4 hours</option>
              <option value={10}>10 hours</option>
              <option value={12}>12 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time (calculated)
            </label>
            <input
              type="time"
              value={calculateEndTime(startTime, duration)}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !shiftTypeId}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dispatch-600 hover:bg-dispatch-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dispatch-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Shift'}
          </button>
        </div>
      </div>
    </div>
  )
} 