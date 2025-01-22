'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/app/database.types'

const formSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']),
  user_role: z.enum(['Employee', 'Manager', 'Admin']),
  weekly_hours_scheduled: z.coerce
    .number()
    .min(0, 'Hours must be 0 or greater')
    .max(168, 'Hours cannot exceed 168 per week'),
})

type Employee = Database['public']['Tables']['employees']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface EmployeeDialogProps {
  employee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EmployeeDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EmployeeDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: employee?.profiles?.full_name || '',
      employee_role: employee?.employee_role || 'Dispatcher',
      user_role: employee?.user_role || 'Employee',
      weekly_hours_scheduled: employee?.weekly_hours_scheduled || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      console.log('Submitting form with values:', values)

      if (employee) {
        // Update existing employee
        console.log('Updating profile for employee:', employee.id)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: values.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', employee.id)
          .select()

        if (profileError) {
          console.error('Error updating profile:', profileError)
          throw profileError
        }
        console.log('Profile updated successfully:', profileData)

        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .update({
            employee_role: values.employee_role,
            user_role: values.user_role,
            weekly_hours_scheduled: values.weekly_hours_scheduled,
          })
          .eq('id', employee.id)
          .select()

        if (employeeError) {
          console.error('Error updating employee:', employeeError)
          throw employeeError
        }
        console.log('Employee updated successfully:', employeeData)

      } else {
        // Create new employee via API
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create employee')
        }

        console.log('Employee created successfully')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error saving employee. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <DialogDescription>
            {employee
              ? 'Update employee information and roles.'
              : 'Add a new employee to the system.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="Shift Supervisor">
                        Shift Supervisor
                      </SelectItem>
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
                        <SelectValue placeholder="Select a role" />
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
                  <FormLabel>Weekly Hours Scheduled</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={168}
                      placeholder="40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 