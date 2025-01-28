'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from 'react-error-boundary'
import type { Employee, EmployeeInsert } from '@/types/employee'
import { createEmployee, updateEmployee } from '@/services/employees'

const employeeSchema = z.object({
  id: z.string().uuid(),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']),
  user_role: z.enum(['Employee', 'Manager', 'Admin']),
  weekly_hours_scheduled: z.number().nullable(),
  default_shift_type_id: z.string().uuid().nullable()
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeDialogProps {
  employee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDialog({ employee, open, onOpenChange }: EmployeeDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showBoundary } = useErrorBoundary()

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      id: employee.id,
      employee_role: employee.employee_role,
      user_role: employee.user_role,
      weekly_hours_scheduled: employee.weekly_hours_scheduled,
      default_shift_type_id: employee.default_shift_type_id
    } : {
      id: crypto.randomUUID(),
      employee_role: 'Dispatcher',
      user_role: 'Employee',
      weekly_hours_scheduled: null,
      default_shift_type_id: null
    }
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && employee) {
      form.reset({
        id: employee.id,
        employee_role: employee.employee_role,
        user_role: employee.user_role,
        weekly_hours_scheduled: employee.weekly_hours_scheduled,
        default_shift_type_id: employee.default_shift_type_id
      })
    } else if (!open) {
      form.reset()
    }
  }, [open, employee, form])

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setIsSubmitting(true)

      if (employee) {
        await updateEmployee(employee.id, data)
        toast({
          title: 'Success',
          description: 'Employee updated successfully'
        })
      } else {
        await createEmployee(data)
        toast({
          title: 'Success',
          description: 'Employee created successfully'
        })
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error submitting employee:', error)
      showBoundary(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Role</FormLabel>
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
                      {['Dispatcher', 'Shift Supervisor', 'Management'].map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
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
                      {['Employee', 'Manager', 'Admin'].map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
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
                  <FormLabel>Weekly Hours Scheduled</FormLabel>
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

            <FormField
              control={form.control}
              name="default_shift_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Shift Type ID</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value || null)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
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
                {isSubmitting ? 'Saving...' : employee ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 