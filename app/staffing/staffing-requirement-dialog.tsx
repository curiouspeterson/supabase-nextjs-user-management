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
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const staffingSchema = z.object({
  day_of_week: z.string().min(1, 'Day of week is required'),
  period_name: z.string().min(1, 'Period name is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  min_employees: z.number().min(1, 'Minimum employees must be at least 1'),
  max_employees: z.number().min(1, 'Maximum employees must be at least 1'),
  requires_supervisor: z.boolean(),
})

type StaffingFormValues = z.infer<typeof staffingSchema>

interface StaffingRequirement {
  id: string
  day_of_week: string
  period_name: string
  start_time: string
  end_time: string
  min_employees: number
  max_employees: number
  requires_supervisor: boolean
  created_at: string
  updated_at: string
}

interface StaffingRequirementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requirement?: StaffingRequirement | null
  onSuccess?: () => void
}

export function StaffingRequirementDialog({
  open,
  onOpenChange,
  requirement,
  onSuccess,
}: StaffingRequirementDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<StaffingFormValues>({
    resolver: zodResolver(staffingSchema),
    defaultValues: {
      day_of_week: requirement?.day_of_week || '',
      period_name: requirement?.period_name || '',
      start_time: requirement?.start_time || '',
      end_time: requirement?.end_time || '',
      min_employees: requirement?.min_employees || 1,
      max_employees: requirement?.max_employees || 1,
      requires_supervisor: requirement?.requires_supervisor || false,
    },
  })

  async function onSubmit(data: StaffingFormValues) {
    try {
      setIsLoading(true)

      // Create or update the requirement
      const { error } = await (requirement
        ? supabase
            .from('staffing_requirements')
            .update(data)
            .eq('id', requirement.id)
        : supabase.from('staffing_requirements').insert([data]))

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: `Staffing requirement ${requirement ? 'updated' : 'created'} successfully.`,
      })

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: `Failed to ${requirement ? 'update' : 'create'} staffing requirement. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {requirement ? 'Edit' : 'Add'} Staffing Requirement
          </DialogTitle>
          <DialogDescription>
            {requirement
              ? 'Update the staffing requirement details below.'
              : 'Add a new staffing requirement by filling out the form below.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Name</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a period</option>
                      <option value="Early Morning">Early Morning (5 AM - 9 AM)</option>
                      <option value="Day">Day (9 AM - 9 PM)</option>
                      <option value="Evening">Evening (9 PM - 1 AM)</option>
                      <option value="Late Night">Late Night (1 AM - 5 AM)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_employees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Employees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_employees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Employees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requires_supervisor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel>Requires Supervisor</FormLabel>
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
                {requirement ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 