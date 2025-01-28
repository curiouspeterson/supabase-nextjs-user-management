'use client'

import * as React from 'react'
import { memo, useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { TimeOffType, TimeOffRequest } from '@/lib/types/time-off'
import { useUser } from '@/lib/hooks'
import { useTimeOffStore } from '@/lib/stores/time-off-store'
import { timeOffSchema } from '@/lib/validations/time-off'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { BaseTimeOffDialog, useTimeOffRequest } from './base-dialog'

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
  const { isLoading, setIsLoading, handleError, showSuccessMessage } = useTimeOffRequest()
  const { addRequest, updateRequest } = useTimeOffStore()
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
      setIsLoading(true)

      // Validate dates
      if (data.end_date < data.start_date) {
        throw new Error('End date must be after start date')
      }

      if (request) {
        await updateRequest({
          ...request,
          ...data
        })
        showSuccessMessage('Time off request updated successfully')
      } else {
        await addRequest(data)
        showSuccessMessage('Time off request submitted successfully')
      }

      onOpenChange(false)
      onRequestSubmitted?.()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [request, updateRequest, addRequest, handleError, showSuccessMessage, onOpenChange, onRequestSubmitted, setIsLoading])

  const timeOffTypes = useMemo(() => TIME_OFF_TYPES, [])

  return (
    <BaseTimeOffDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={request ? 'Edit Time Off Request' : 'New Time Off Request'}
      description="Submit a request for time off. Your manager will review and approve or deny the request."
      preventOutsideClose={true}
    >
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isDirty}
            >
              {isLoading ? 'Saving...' : request ? 'Update' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </BaseTimeOffDialog>
  )
})

TimeOffRequestDialog.displayName = 'TimeOffRequestDialog' 