'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TimeOffRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to submit a request')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const formData = new FormData(e.currentTarget)
      const startDate = new Date(formData.get('start_date') as string)
      const endDate = new Date(formData.get('end_date') as string)
      const type = formData.get('type') as 'Vacation' | 'Sick' | 'Personal' | 'Training'
      const notes = formData.get('notes') as string

      if (endDate < startDate) {
        const errorMessage = 'Failed to submit time off request'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
        return
      }

      const { error: insertError } = await supabase
        .from('time_off_requests')
        .insert({
          employee_id: user.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          type,
          notes,
          status: 'Pending',
          submitted_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      toast({
        title: 'Success',
        description: 'Time off request submitted successfully',
      })

      e.currentTarget.reset()
    } catch (err) {
      console.error('Error submitting time off request:', err)
      setError('Failed to submit time off request')
      toast({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in to submit a time off request</div>
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} data-testid="time-off-form">
      <div className="grid grid-cols-2 gap-4">
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
            <SelectValue placeholder="Select type of time off" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Vacation">Vacation</SelectItem>
            <SelectItem value="Sick">Sick Leave</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Training">Training</SelectItem>
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

      {error && (
        <div className="text-red-600 text-sm" role="alert">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  )
} 