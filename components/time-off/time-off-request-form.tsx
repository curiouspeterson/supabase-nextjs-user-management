'use client'

import { useState, useCallback, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { ValidationError, DatabaseError } from '@/lib/errors'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { flushSync } from 'react-dom'

interface TimeOffRequestFormProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TimeOffRequestForm({ userId, onSuccess, onCancel }: TimeOffRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonText, setButtonText] = useState('Submit Request')
  const router = useRouter()
  const { handleError } = useErrorHandler()
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Cleanup effect
  useEffect(() => {
    return () => {
      setIsSubmitting(false)
      setError(null)
      setButtonText('Submit Request')
    }
  }, [])

  const validateDates = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime())) {
      throw new ValidationError('Please enter a valid start date')
    }

    if (isNaN(end.getTime())) {
      throw new ValidationError('Please enter a valid end date')
    }

    if (start > end) {
      throw new ValidationError('End date must be after start date')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      throw new ValidationError('Start date cannot be in the past')
    }

    return { start, end }
  }, [])

  const checkOverlappingRequests = useCallback(async (startDate: Date, endDate: Date) => {
    const { data: existingRequests, error } = await supabase
      .from('time_off_requests')
      .select('start_date, end_date')
      .eq('user_id', userId)
      .or(`start_date.lte.${format(endDate, 'yyyy-MM-dd')},end_date.gte.${format(startDate, 'yyyy-MM-dd')}`)

    if (error) {
      throw new DatabaseError('Failed to check for overlapping requests')
    }

    if (existingRequests && existingRequests.length > 0) {
      throw new ValidationError('You already have a time off request during this period')
    }
  }, [supabase, userId])

  const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Use flushSync to ensure immediate state updates
    flushSync(() => {
      setIsSubmitting(true)
      setButtonText('Submitting...')
      setError(null)
    })

    try {
      // Extract form data
      const formData = new FormData(e.currentTarget)
      const type = formData.get('type') as string
      const startDate = formData.get('start_date') as string
      const endDate = formData.get('end_date') as string
      const notes = formData.get('notes') as string

      // Validate required fields first
      if (!type) {
        throw new Error('Please select a type of time off')
      }

      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates')
      }

      // Validate date order
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date')
      }

      // Check for overlapping requests
      const { data: overlappingRequests, error: overlappingError } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', startDate)
        .lte('end_date', endDate)

      if (overlappingError) {
        throw new Error('Failed to check for overlapping requests')
      }

      if (overlappingRequests && overlappingRequests.length > 0) {
        throw new Error('You already have a time off request for these dates')
      }

      // Check remaining vacation days if type is vacation
      if (type === 'vacation') {
        const { data: vacationData, error: vacationError } = await supabase
          .from('vacation_days')
          .select('remaining_days')
          .eq('user_id', userId)
          .single()

        if (vacationError) {
          throw new Error('Failed to check remaining vacation days')
        }

        const requestedDays = calculateDays(startDate, endDate)
        if (vacationData.remaining_days < requestedDays) {
          throw new Error('Insufficient vacation days remaining')
        }
      }

      // Submit the request
      const { error: submitError } = await supabase.from('time_off_requests').insert([
        {
          user_id: userId,
          type,
          start_date: startDate,
          end_date: endDate,
          notes,
          status: 'pending'
        }
      ])

      if (submitError) {
        throw submitError
      }

      // Show success message
      toast({
        title: 'Success',
        description: 'Time off request submitted successfully',
        variant: 'default'
      })
      
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting time off request:', error)
      flushSync(() => {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      })
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit time off request',
        variant: 'destructive'
      })
    } finally {
      flushSync(() => {
        setIsSubmitting(false)
        setButtonText('Submit Request')
      })
    }
  }

  const handleReset = () => {
    setError(null)
    const form = document.querySelector('form')
    if (form) {
      form.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4" role="form" noValidate>
      {error && (
        <div role="alert" aria-live="polite" className="text-red-500">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          aria-label="Start date"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          aria-label="End date"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          name="type"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          aria-label="Type of time off"
          disabled={isSubmitting}
        >
          <option value="">Select type</option>
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal Leave</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Please provide notes for your time off request"
          aria-label="Notes"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="reset"
          onClick={handleReset}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
} 