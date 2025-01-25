'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/lib/hooks'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { ValidationError, DatabaseError } from '@/lib/errors'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TimeOffRequest {
  start_date: string
  end_date: string
  type: string
  notes?: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function TimeOffRequestForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TimeOffRequest>>({
    type: '',
    notes: ''
  })
  const { user } = useUser()
  const { handleError } = useErrorHandler()
  const supabase = createClient()

  const validateRequest = (request: Partial<TimeOffRequest>) => {
    if (!request.start_date) {
      throw new ValidationError('Start date is required')
    }
    if (!request.end_date) {
      throw new ValidationError('End date is required')
    }
    if (!request.type) {
      throw new ValidationError('Type of time off is required')
    }

    const start = new Date(request.start_date)
    const end = new Date(request.end_date)

    if (end < start) {
      throw new ValidationError('End date cannot be before start date')
    }

    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 30) {
      throw new ValidationError('Time off requests cannot exceed 30 consecutive days')
    }
  }

  const checkOverlappingRequests = async (start_date: string, end_date: string) => {
    if (!user?.id) {
      throw new ValidationError('User not found')
    }

    const { data: existingRequests, error } = await supabase
      .from('time_off_requests')
      .select('start_date, end_date')
      .eq('user_id', user.id)
      .or(`start_date.gte.${start_date},end_date.lte.${end_date}`)

    if (error) {
      throw new DatabaseError('Failed to check existing time off requests')
    }

    if (existingRequests && existingRequests.length > 0) {
      throw new ValidationError('You already have time off scheduled during this period')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.start_date) {
        throw new Error('Start date is required')
      }
      if (!formData.end_date) {
        throw new Error('End date is required')
      }
      if (!formData.type) {
        throw new Error('Type is required')
      }

      // Validate dates
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        throw new Error('End date cannot be before start date')
      }

      // Validate request
      validateRequest(formData)

      // Check for overlapping requests
      await checkOverlappingRequests(formData.start_date, formData.end_date)

      // Submit form data
      const { error: submitError } = await supabase
        .from('time_off_requests')
        .insert([
          {
            ...formData,
            status: 'pending'
          }
        ])

      if (submitError) {
        throw new DatabaseError('Failed to submit time off request')
      }

      toast({
        title: 'Success',
        description: 'Time off request submitted successfully'
      })
      handleReset()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit time off request'
      setError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      handleError(err, 'TimeOffRequestForm.handleSubmit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      type: '',
      notes: ''
    })
    setError(null)
    const form = document.querySelector('form') as HTMLFormElement
    if (form) {
      form.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4">
      {error && (
        <Alert variant="destructive" role="alert" aria-live="polite">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="start_date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            aria-invalid={!!error}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="end_date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            required
            aria-invalid={!!error}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Type
        </label>
        <Select
          name="type"
          required
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger aria-invalid={!!error} aria-required="true">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Vacation">Vacation</SelectItem>
            <SelectItem value="Sick">Sick</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Notes
        </label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Add any additional notes..."
          className="h-24"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
} 