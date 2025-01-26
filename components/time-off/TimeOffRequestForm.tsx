'use client'

import { useState, FormEvent, useRef } from 'react'
import { flushSync } from 'react-dom'
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
import { cn } from '@/lib/utils'

interface TimeOffRequestFormProps {
  userId?: string
}

interface TimeOffRequest {
  start_date: string
  end_date: string
  type: string
  notes?: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
}

interface FormErrors {
  start_date?: string
  end_date?: string
  type?: string
  general?: string
}

export default function TimeOffRequestForm({ userId }: TimeOffRequestFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<Partial<TimeOffRequest>>({
    type: '',
    notes: ''
  })
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const { user } = useUser()
  const { handleError } = useErrorHandler()
  const supabase = createClient()
  const formRef = useRef<HTMLFormElement>(null)

  const validateRequest = (request: Partial<TimeOffRequest>): FormErrors => {
    const errors: FormErrors = {}

    if (!request.start_date) {
      errors.start_date = 'Start date is required'
    }
    if (!request.end_date) {
      errors.end_date = 'End date is required'
    }
    if (!request.type) {
      errors.type = 'Type of time off is required'
    }

    if (request.start_date && request.end_date) {
      const start = new Date(request.start_date)
      const end = new Date(request.end_date)

      if (end < start) {
        errors.end_date = 'End date cannot be before start date'
      }

      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 30) {
        errors.general = 'Time off requests cannot exceed 30 consecutive days'
      }
    }

    return errors
  }

  const checkVacationDays = async (start_date: string, end_date: string, type: string) => {
    if (type.toLowerCase() !== 'vacation') return

    const start = new Date(start_date)
    const end = new Date(end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const { data: vacationData, error } = await supabase
      .from('vacation_days')
      .select('total_days, used_days')
      .eq('user_id', userId || user?.id)
      .single()

    if (error) {
      throw new DatabaseError('Failed to check vacation days')
    }

    if (vacationData && vacationData.used_days + requestedDays > vacationData.total_days) {
      throw new ValidationError('Insufficient vacation days remaining')
    }
  }

  const checkOverlappingRequests = async (start_date: string, end_date: string) => {
    const currentUserId = userId || user?.id
    if (!currentUserId) {
      throw new ValidationError('User not found')
    }

    const { data: existingRequests, error } = await supabase
      .from('time_off_requests')
      .select('start_date, end_date')
      .eq('user_id', currentUserId)
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

    // Set submitting state immediately
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validationErrors = validateRequest(formData)
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0]
        setErrors(validationErrors)
        setIsSubmitting(false)
        toast({
          title: 'Error',
          description: firstError,
          variant: 'destructive'
        })
        return
      }

      // Check vacation days if applicable
      if (formData.start_date && formData.end_date && formData.type) {
        await checkVacationDays(formData.start_date, formData.end_date, formData.type)
      }

      // Check for overlapping requests
      if (formData.start_date && formData.end_date) {
        await checkOverlappingRequests(formData.start_date, formData.end_date)
      }

      // Submit form data
      const { error: submitError } = await supabase
        .from('time_off_requests')
        .insert([
          {
            ...formData,
            user_id: userId || user?.id,
            status: 'pending'
          }
        ])

      if (submitError) {
        throw new DatabaseError('Unable to submit request. Please try again later.')
      }

      toast({
        title: 'Success',
        description: 'Time off request submitted successfully'
      })
      handleReset()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit time off request'
      setErrors(prev => ({ ...prev, general: message }))
      setIsSubmitting(false)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
      handleError(err, 'TimeOffRequestForm.handleSubmit')
    } finally {
      // Always reset submitting state
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      type: '',
      notes: ''
    })
    setErrors({})
    setIsSelectOpen(false)
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onReset={handleReset} className="space-y-4" role="form">
      {Object.entries(errors).map(([key, message]) => (
        message && (
          <Alert key={key} variant="destructive" role="alert" aria-live="polite">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )
      ))}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            required
            aria-label="Start date"
            aria-invalid={!!errors.start_date}
            aria-describedby={errors.start_date ? "start-date-error" : undefined}
            className="mt-1"
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setFormData({ ...formData, start_date: e.target.value })
              if (errors.start_date) {
                setErrors(prev => ({ ...prev, start_date: undefined }))
              }
            }}
          />
          {errors.start_date && (
            <div id="start-date-error" role="alert" aria-live="polite" className="text-sm text-red-500">
              {errors.start_date}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            type="date"
            id="end_date"
            name="end_date"
            required
            aria-label="End date"
            aria-invalid={!!errors.end_date}
            aria-describedby={errors.end_date ? "end-date-error" : undefined}
            className="mt-1"
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setFormData({ ...formData, end_date: e.target.value })
              if (errors.end_date) {
                setErrors(prev => ({ ...prev, end_date: undefined }))
              }
            }}
          />
          {errors.end_date && (
            <div id="end-date-error" role="alert" aria-live="polite" className="text-sm text-red-500">
              {errors.end_date}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <div className="relative">
          <select
            id="type"
            name="type"
            required
            aria-label="Type of time off"
            aria-invalid={!!errors.type}
            aria-expanded={isSelectOpen}
            role="combobox"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.type}
            onChange={(e) => {
              setFormData({ ...formData, type: e.target.value })
              if (errors.type) {
                setErrors(prev => ({ ...prev, type: undefined }))
              }
            }}
            onFocus={() => setIsSelectOpen(true)}
            onBlur={() => setIsSelectOpen(false)}
          >
            <option value="">Select type</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
          </select>
        </div>
        {errors.type && (
          <div role="alert" aria-live="polite" className="text-sm text-red-500">
            {errors.type}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Please provide notes for your time off request"
          required
          aria-label="Notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="reset" disabled={isSubmitting}>
          Reset
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-disabled={isSubmitting}
          data-state={isSubmitting ? 'submitting' : 'idle'}
          className={cn(
            "inline-flex justify-center",
            isSubmitting && "pointer-events-none opacity-50"
          )}
          variant="default"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
} 