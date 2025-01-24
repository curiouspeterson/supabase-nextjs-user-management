'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/app/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Props = {
  employeeId: string
  onRequestSubmitted?: () => void
}

export default function TimeOffRequestForm({ employeeId, onRequestSubmitted }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      const supabase = createClient() as SupabaseClient<Database>

      const { error: err } = await supabase
        .from('time_off_requests')
        .insert({
          employee_id: employeeId,
          start_date: startDate,
          end_date: endDate,
          reason,
          status: 'Pending'
        })

      if (err) throw err

      setSuccess(true)
      setStartDate('')
      setEndDate('')
      setReason('')
      
      if (onRequestSubmitted) {
        onRequestSubmitted()
      }
    } catch (err) {
      console.error('Error submitting time off request:', err)
      setError('Failed to submit time off request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          min={startDate}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">Time off request submitted successfully!</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
} 