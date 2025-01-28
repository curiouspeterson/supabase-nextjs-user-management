import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from '@/components/ui/form'
import * as z from 'zod'

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
import type { Employee } from '@/types'

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'])
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function EmployeeForm() {
  const { toast } = useToast()
  const { handleError } = useErrorBoundary()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    }
  })

  const onSubmit = React.useCallback(async (data: EmployeeFormValues) => {
    try {
      setIsSubmitting(true)

      await createEmployee({
        ...data,
        fullName: `${data.firstName} ${data.lastName}`
      })

      toast({
        title: 'Employee created successfully',
        description: 'The employee has been added to the system.'
      })

      form.reset()
    } catch (error) {
      handleError(error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create employee',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [form, handleError, toast])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
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
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
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