'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createBrowserClient } from '@supabase/ssr'

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
  period_name: z.string().min(1, 'Period name is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  minimum_employees: z.number().min(1, 'Minimum employees must be at least 1'),
  shift_supervisor_required: z.boolean()
})

type StaffingFormValues = z.infer<typeof staffingSchema>

interface StaffingRequirement {
  id: string
  period_name: string
  start_time: string
  end_time: string
  minimum_employees: number
  shift_supervisor_required: boolean
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
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const form = useForm<StaffingFormValues>({
    resolver: zodResolver(staffingSchema),
    defaultValues: {
      period_name: requirement?.period_name || '',
      start_time: requirement?.start_time || '',
      end_time: requirement?.end_time || '',
      minimum_employees: requirement?.minimum_employees || 1,
      shift_supervisor_required: requirement?.shift_supervisor_required ?? true
    },
  })

  // Reset form when dialog opens/closes or requirement changes
  React.useEffect(() => {
    if (open && requirement) {
      form.reset({
        period_name: requirement.period_name,
        start_time: requirement.start_time,
        end_time: requirement.end_time,
        minimum_employees: requirement.minimum_employees,
        shift_supervisor_required: requirement.shift_supervisor_required
      })
    } else if (!open) {
      form.reset({
        period_name: '',
        start_time: '',
        end_time: '',
        minimum_employees: 1,
        shift_supervisor_required: true
      })
    }
  }, [open, requirement, form])

  async function onSubmit(data: StaffingFormValues) {
    try {
      setIsLoading(true)
      console.log('Submitting form with data:', data)
      console.log('Current requirement:', requirement)

      if (requirement) {
        console.log('Updating existing requirement...')
        
        // First verify we can read the record
        const { data: verifyData, error: verifyError } = await supabase
          .from('staffing_requirements')
          .select('*')
          .eq('id', requirement.id)
          .single()

        if (verifyError) {
          console.error('Verify error:', verifyError)
          throw verifyError
        }

        console.log('Current record:', verifyData)

        // Attempt the update
        const { data: updateData, error: updateError } = await supabase
          .from('staffing_requirements')
          .update({
            period_name: data.period_name,
            start_time: data.start_time,
            end_time: data.end_time,
            minimum_employees: data.minimum_employees,
            shift_supervisor_required: data.shift_supervisor_required,
            updated_at: new Date().toISOString()
          })
          .eq('id', requirement.id)
          .select()

        console.log('Update response:', { updateData, updateError })

        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }

        // Wait for the update to propagate
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verify the update worked with a fresh client
        const freshSupabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: updatedData, error: fetchError } = await freshSupabase
          .from('staffing_requirements')
          .select('*')
          .eq('id', requirement.id)
          .single()

        if (fetchError) {
          console.error('Fetch error:', fetchError)
          throw fetchError
        }

        console.log('Verification data:', updatedData)

        if (updatedData.minimum_employees !== data.minimum_employees) {
          console.error('Update verification failed:', {
            expected: data.minimum_employees,
            actual: updatedData.minimum_employees,
            updateResponse: updateData
          })
          throw new Error('Update failed - values do not match expected')
        }

        console.log('Update verified:', updatedData)
      } else {
        console.log('Creating new requirement...')
        const { data: insertData, error } = await supabase
          .from('staffing_requirements')
          .insert({
            period_name: data.period_name,
            start_time: data.start_time,
            end_time: data.end_time,
            minimum_employees: data.minimum_employees,
            shift_supervisor_required: data.shift_supervisor_required
          })
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }

        console.log('Created new requirement:', insertData)
      }

      toast({
        title: 'Success',
        description: `Staffing requirement ${requirement ? 'updated' : 'created'} successfully.`,
      })

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast({
        title: 'Error',
        description: `Failed to ${requirement ? 'update' : 'create'} staffing requirement. ${error instanceof Error ? error.message : 'Please try again.'}`,
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
              name="period_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter period name"
                    />
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
              name="minimum_employees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Employees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={field.value}
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