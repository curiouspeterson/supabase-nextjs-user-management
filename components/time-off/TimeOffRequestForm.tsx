'use client'

import { useState } from 'react'
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

interface TimeOffRequest {
  start_date: string
  end_date: string
  type: string
  notes?: string
  user_id: string
  status: 'Pending' | 'Approved' | 'Denied'
}

export function TimeOffRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()
  const { handleError } = useErrorHandler()
  const supabase = createClient()
  const { toast } = useToast()

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
      throw new ValidationError('Time off requests cannot exceed 30 days')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const request: Partial<TimeOffRequest> = {
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        type: formData.get('type') as string,
        notes: formData.get('notes') as string,
        user_id: user.id,
        status: 'Pending'
      }

      // Validate request
      validateRequest(request)

      // Check for overlapping requests
      await checkOverlappingRequests(request.start_date, request.end_date)

      // Submit request
      const { error: submitError } = await supabase
        .from('time_off_requests')
        .insert(request)

      if (submitError) {
        throw new DatabaseError('Failed to submit time off request')
      }

      // Reset form
      e.currentTarget.reset()

      // Show success message
      toast({
        title: 'Success',
        description: 'Time off request submitted successfully'
      })
    } catch (err) {
      handleError(err, 'TimeOffRequestForm.handleSubmit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" required>
          <SelectTrigger>
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
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Add any additional notes..."
          className="h-24"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="reset"
          variant="outline"
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </div>
    </form>
  )
} 