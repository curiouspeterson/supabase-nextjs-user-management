'use client'

import * as React from 'react'
import { memo, useCallback, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { TimeOffType, TimeOffRequest } from '@/lib/types/time-off'
import { createTimeOffRequest } from '@/lib/api/time-off'
import { useUser } from '@/lib/hooks'
import { useTimeOffStore } from '@/lib/stores/time-off-store'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { timeOffSchema } from '@/lib/validations/time-off'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TIME_OFF_TYPES = [
  { value: TimeOffType.VACATION, label: 'Vacation' },
  { value: TimeOffType.SICK, label: 'Sick Leave' },
  { value: TimeOffType.PERSONAL, label: 'Personal' },
  { value: TimeOffType.TRAINING, label: 'Training' }
] as const

interface TimeOffRequestDialogProps {
  request?: TimeOffRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestSubmitted?: () => void
}

export const TimeOffRequestDialog = memo(function TimeOffRequestDialog({ 
  request, 
  open, 
  onOpenChange,
  onRequestSubmitted 
}: TimeOffRequestDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addRequest, updateRequest } = useTimeOffStore()
  const { handleError } = useErrorBoundary()
  const { user } = useUser()

  const form = useForm({
    resolver: zodResolver(timeOffSchema),
    defaultValues: useMemo(() => ({
      type: request?.type || TimeOffType.VACATION,
      start_date: request?.start_date ? new Date(request.start_date) : new Date(),
      end_date: request?.end_date ? new Date(request.end_date) : new Date(),
      notes: request?.notes || '',
      status: request?.status || 'Pending'
    }), [request])
  })

  const onSubmit = useCallback(async (data: any) => {
    try {
      setIsSubmitting(true)

      // Validate dates
      if (data.end_date < data.start_date) {
        throw new Error('End date must be after start date')
      }

      if (request) {
        await updateRequest({
          ...request,
          ...data
        })
        toast({ title: 'Time off request updated successfully' })
      } else {
        await addRequest(data)
        toast({ title: 'Time off request submitted successfully' })
      }

      onOpenChange(false)
      onRequestSubmitted?.()
    } catch (error) {
      handleError(error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [request, updateRequest, addRequest, handleError, toast, onOpenChange, onRequestSubmitted])

  const timeOffTypes = useMemo(() => TIME_OFF_TYPES, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => {
          // Prevent default focus behavior
          e.preventDefault()
          // Focus the close button using a more reliable selector
          const closeButton = document.querySelector('button[type="button"] > .sr-only') as HTMLElement
          if (closeButton?.parentElement) {
            closeButton.parentElement.focus()
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {request ? 'Edit Time Off Request' : 'New Time Off Request'}
          </DialogTitle>
          <DialogDescription>
            Submit a request for time off. Your manager will review and approve or
            deny the request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time off type" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOffTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.type?.message && (
                      <FormMessage>{form.formState.errors.type.message}</FormMessage>
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value.toISOString()}
                        onChange={(date) => field.onChange(date)}
                        disabled={isSubmitting}
                        error={form.formState.errors.start_date?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value.toISOString()}
                        onChange={(date) => field.onChange(date)}
                        disabled={isSubmitting}
                        error={form.formState.errors.end_date?.message}
                        min={form.watch('start_date').toISOString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? 'Saving...' : request ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
})

TimeOffRequestDialog.displayName = 'TimeOffRequestDialog' 