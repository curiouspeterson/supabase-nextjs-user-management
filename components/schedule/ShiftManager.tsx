'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/app/database.types'

interface ShiftManagerProps {
  date: Date
  employeeId?: string
  onClose: () => void
  onSave: () => void
  shift?: any
}

export default function ShiftManager({ date, employeeId, onClose, onSave, shift }: ShiftManagerProps) {
  const [startTime, setStartTime] = useState(shift?.start_time || '00:00')
  const [duration, setDuration] = useState(shift?.duration_hours || 8)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      if (shift) {
        // Update existing shift
        await supabase
          .from('schedules')
          .update({
            start_time: startTime,
            duration_hours: duration,
          })
          .eq('id', shift.id)
      } else {
        // Create new shift
        await supabase
          .from('schedules')
          .insert({
            date: date.toISOString().split('T')[0],
            employee_id: employeeId,
            start_time: startTime,
            duration_hours: duration,
            status: 'scheduled'
          })
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
              Duration (hours)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dispatch-500 focus:ring-dispatch-500"
            >
              {[4, 6, 8, 10, 12].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hours
                </option>
              ))}
            </select>
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
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dispatch-600 hover:bg-dispatch-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dispatch-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Shift'}
          </button>
        </div>
      </div>
    </div>
  )
} 