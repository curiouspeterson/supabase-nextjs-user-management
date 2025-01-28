import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from '@/components/ui/form'
import * as z from 'zod'
import { Database } from '@/types/supabase'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from 'react-error-boundary'
import { createEmployee } from '@/services/employees'
import type { EmployeeInsert } from '@/types/employee'

const employeeSchema = z.object({
  id: z.string().uuid(),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management'] as const),
  user_role: z.enum(['Employee', 'Manager', 'Admin'] as const),
  weekly_hours_scheduled: z.number().nullable(),
  default_shift_type_id: z.string().nullable()
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function EmployeeForm() {
  const { toast } = useToast()
  const { showBoundary } = useErrorBoundary()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      employee_role: 'Dispatcher',
      user_role: 'Employee',
      weekly_hours_scheduled: null,
      default_shift_type_id: null
    }
  })

  const onSubmit = React.useCallback(async (data: EmployeeFormValues) => {
    try {
      setIsSubmitting(true)

      await createEmployee(data)

      toast({
        title: 'Employee created successfully',
        description: 'The employee has been added to the system.'
      })

      form.reset()
    } catch (error) {
      showBoundary(error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create employee',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [form, showBoundary, toast])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                  <SelectItem value="Shift Supervisor">Shift Supervisor</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekly_hours_scheduled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekly Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    field.onChange(value === '' ? null : Number(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isDirty}
        >
          {isSubmitting ? 'Creating...' : 'Create Employee'}
        </Button>
      </form>
    </Form>
  )
} 