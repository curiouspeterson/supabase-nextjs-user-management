'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  period_name: z.string().min(1, 'Period name is required'),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  minimum_employees: z.number().min(1, 'Minimum employees must be at least 1'),
  shift_supervisor_required: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface StaffingRequirementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requirement?: {
    id: string
    period_name: string
    start_time: string
    end_time: string
    minimum_employees: number
    shift_supervisor_required: boolean
  } | null
  onSuccess: () => void
}

function stripSeconds(time: string): string {
  return time.substring(0, 5) // Take only HH:MM part
}

function addSeconds(time: string): string {
  return `${time}:00` // Add :00 seconds
}

export function StaffingRequirementDialog({
  open,
  onOpenChange,
  requirement,
  onSuccess,
}: StaffingRequirementDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period_name: '',
      start_time: '',
      end_time: '',
      minimum_employees: 1,
      shift_supervisor_required: false,
    },
  })

  // Reset form when requirement changes
  useEffect(() => {
    if (requirement) {
      form.reset({
        period_name: requirement.period_name,
        start_time: stripSeconds(requirement.start_time),
        end_time: stripSeconds(requirement.end_time),
        minimum_employees: requirement.minimum_employees,
        shift_supervisor_required: requirement.shift_supervisor_required,
      })
    } else {
      form.reset({
        period_name: '',
        start_time: '',
        end_time: '',
        minimum_employees: 1,
        shift_supervisor_required: false,
      })
    }
  }, [requirement, form])

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)
      const { error } = requirement
        ? await supabase
            .from('staffing_requirements')
            .update({
              period_name: values.period_name,
              start_time: addSeconds(values.start_time),
              end_time: addSeconds(values.end_time),
              minimum_employees: values.minimum_employees,
              shift_supervisor_required: values.shift_supervisor_required,
            })
            .eq('id', requirement.id)
        : await supabase.from('staffing_requirements').insert([{
            ...values,
            start_time: addSeconds(values.start_time),
            end_time: addSeconds(values.end_time),
          }])

      if (error) throw error

      toast({
        title: 'Success',
        description: `Staffing requirement ${requirement ? 'updated' : 'created'} successfully`,
      })
      onSuccess()
    } catch (error) {
      console.error('Error saving staffing requirement:', error)
      toast({
        title: 'Error',
        description: 'Failed to save staffing requirement',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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
            {requirement ? 'Update the staffing requirement details below.' : 'Enter the staffing requirement details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="period_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Start Time (HH:MM)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="09:00" />
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
                  <FormLabel>End Time (HH:MM)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="17:00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimum_employees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Employees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="shift_supervisor_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Shift Supervisor Required</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 