'use client'

import { useState, useEffect } from 'react'
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
  email: z.string().email('Invalid email').optional(),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']),
  user_role: z.enum(['Employee', 'Manager', 'Admin']),
  weekly_hours_scheduled: z.coerce
    .number()
    .min(0, 'Hours must be 0 or greater')
    .max(168, 'Hours cannot exceed 168 per week'),
  default_shift_type_id: z.string().min(1, 'Default shift type is required'),
})

type Employee = Database['public']['Tables']['employees']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url' | 'updated_at'>
  shift_types?: Pick<Database['public']['Tables']['shift_types']['Row'], 'name' | 'description'>
}

interface EmployeeDialogProps {
  mode: 'add' | 'edit'
  employee?: Employee
  onClose: () => void
  onSuccess?: () => void
}

export function EmployeeDialog({
  mode,
  employee,
  onClose,
  onSuccess,
}: EmployeeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [shiftTypes, setShiftTypes] = useState<Database['public']['Tables']['shift_types']['Row'][]>([])
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      employee_role: 'Dispatcher',
      user_role: 'Employee',
      weekly_hours_scheduled: 0,
      default_shift_type_id: '',
    },
  })

  // Load available shift types
  useEffect(() => {
    async function loadShiftTypes() {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error loading shift types:', error)
        return
      }
      
      setShiftTypes(data)
    }
    
    loadShiftTypes()
  }, [supabase])

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      form.reset({
        full_name: employee.profiles?.full_name || '',
        email: employee.profiles?.email || '',
        employee_role: employee.employee_role || 'Dispatcher',
        user_role: employee.user_role || 'Employee',
        weekly_hours_scheduled: employee.weekly_hours_scheduled || 0,
        default_shift_type_id: employee.default_shift_type_id || '',
      })
    } else {
      form.reset({
        full_name: '',
        email: '',
        employee_role: 'Dispatcher',
        user_role: 'Employee',
        weekly_hours_scheduled: 0,
        default_shift_type_id: '',
      })
    }
  }, [employee, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      console.log('Submitting form with values:', values)

      if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.debug('Form submission started:', {
          timestamp: new Date().toISOString(),
          values
        })
      }

      if (employee) {
        // Update existing employee
        console.log('Starting update for employee:', employee.id)
        
        // Update profile
        console.log('Updating profile with:', { 
          full_name: values.full_name,
          email: values.email,
          updated_at: new Date().toISOString()
        })
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: values.full_name,
            email: values.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', employee.id)
          .select()

        if (profileError) {
          console.error('Error updating profile:', profileError)
          throw new Error(`Failed to update profile: ${profileError.message}`)
        }
        console.log('Profile updated successfully:', profileData)

        // Update employee
        console.log('Updating employee with:', {
          employee_role: values.employee_role,
          user_role: values.user_role,
          weekly_hours_scheduled: values.weekly_hours_scheduled,
          default_shift_type_id: values.default_shift_type_id,
        })

        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .update({
            employee_role: values.employee_role,
            user_role: values.user_role,
            weekly_hours_scheduled: values.weekly_hours_scheduled,
            default_shift_type_id: values.default_shift_type_id,
          })
          .eq('id', employee.id)
          .select()

        if (employeeError) {
          console.error('Error updating employee:', employeeError)
          throw new Error(`Failed to update employee: ${employeeError.message}`)
        }
        console.log('Employee updated successfully:', employeeData)
      } else {
        // Create new employee
        console.log('Creating new employee')
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          const data = await response.json()
          console.error('Error creating employee:', data)
          throw new Error(data.error || 'Failed to create employee')
        }
      }

      if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.debug('Form submission completed successfully:', {
          timestamp: new Date().toISOString()
        })
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error submitting form:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      })
      alert('Error submitting form. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
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
            <FormField
              control={form.control}
              name="default_shift_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Shift Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a default shift type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shiftTypes.map((shiftType) => (
                        <SelectItem key={shiftType.id} value={shiftType.id}>
                          {shiftType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 