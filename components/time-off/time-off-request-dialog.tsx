'use client'

import * as React from 'react'
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
import { TimeOffRequestInsert, TimeOffType } from '@/lib/types/time-off'
import { createTimeOffRequest } from '@/lib/api/time-off'
import { useUser } from '@/lib/hooks'

const timeOffSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  type: z.nativeEnum(TimeOffType),
  notes: z.string().optional(),
})

type TimeOffFormValues = z.infer<typeof timeOffSchema>

interface TimeOffRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestSubmitted?: () => void
}

export function TimeOffRequestDialog({
  open,
  onOpenChange,
  onRequestSubmitted
}: TimeOffRequestDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  const form = useForm<TimeOffFormValues>({
    resolver: zodResolver(timeOffSchema),
    defaultValues: {
      start_date: '',
      end_date: '',
      type: TimeOffType.VACATION,
      notes: '',
    },
  })

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        start_date: '',
        end_date: '',
        type: TimeOffType.VACATION,
        notes: '',
      })
    }
  }, [open, form])

  async function onSubmit(data: TimeOffFormValues) {
    try {
      setIsLoading(true)

      if (!user) {
        throw new Error('User not authenticated')
      }

      const request: TimeOffRequestInsert = {
        ...data,
        employee_id: user.id,
        submitted_at: new Date().toISOString(),
      }

      const { error } = await createTimeOffRequest(request)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Your time off request has been submitted.',
      })

      form.reset()
      onOpenChange(false)
      onRequestSubmitted?.()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to submit time off request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>
            Submit a request for time off. Your manager will review and approve or
            deny the request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {Object.values(TimeOffType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 