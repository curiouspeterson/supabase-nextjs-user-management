'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { ValidationError, DatabaseError } from '@/lib/errors'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface TimeOffRequestFormProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TimeOffRequestForm({ userId, onSuccess, onCancel }: TimeOffRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { handleError } = useErrorHandler()
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const validateDates = (startDate: string, endDate: string) => {
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
  }

  const checkOverlappingRequests = async (startDate: Date, endDate: Date) => {
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
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)
      const formData = new FormData(event.currentTarget)
      const startDate = formData.get('start_date') as string
      const endDate = formData.get('end_date') as string
      const type = formData.get('type') as string
      const notes = formData.get('notes') as string

      if (!type) {
        throw new ValidationError('Please select a type of time off')
      }

      if (!notes?.trim()) {
        throw new ValidationError('Please provide notes for your time off request')
      }

      const { start, end } = validateDates(startDate, endDate)
      await checkOverlappingRequests(start, end)

      const { error: insertError } = await supabase
        .from('time_off_requests')
        .insert({
          user_id: userId,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
          type,
          notes: notes.trim(),
          status: 'pending'
        })

      if (insertError) {
        throw new DatabaseError('Failed to submit time off request')
      }

      toast({
        title: 'Success',
        description: 'Time off request submitted successfully',
        variant: 'default'
      })

      router.refresh()
      onSuccess?.()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        toast({
          title: 'Error',
          description: 'Failed to submit time off request',
          variant: 'destructive'
        })
      }
      handleError(error, 'TimeOffRequestForm.handleSubmit')
    } finally {
      setIsSubmitting(false)
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
    <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4" role="form">
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
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </form>
  )
} 