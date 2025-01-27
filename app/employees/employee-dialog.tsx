'use client'

import { useState, useEffect } from 'react'
import { useForm, ControllerRenderProps, FieldValues } from 'react-hook-form'
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
  FormMessage
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
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  username: z.string().min(1, 'Username is required'),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']),
  weekly_hours_scheduled: z.coerce
    .number()
    .min(0, 'Hours must be 0 or greater')
    .max(168, 'Hours cannot exceed 168 per week'),
  default_shift_type_id: z.string().min(1, 'Default shift type is required'),
  allow_overtime: z.boolean().default(false),
  max_weekly_hours: z.number().min(0).max(168).default(40)
})

type Employee = Database['public']['Tables']['employees']['Row'] & {
  profiles: Pick<
    Database['public']['Tables']['profiles']['Row'], 
    'full_name' | 'avatar_url' | 'updated_at' | 'username'
  >
  email?: string
  shift_types?: Pick<Database['public']['Tables']['shift_types']['Row'], 'name' | 'description'>
}

interface EmployeeDialogProps {
  mode: 'add' | 'edit'
  employee?: Employee
  onClose: () => void
  onSuccess?: () => void
}

type FormField = ControllerRenderProps<FieldValues, string>

export function EmployeeDialog({
  mode,
  employee,
  onClose,
  onSuccess,
}: EmployeeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [shiftTypes, setShiftTypes] = useState<Database['public']['Tables']['shift_types']['Row'][]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: employee?.profiles?.full_name || '',
      email: employee?.email || '',
      username: employee?.profiles?.username || '',
      employee_role: (employee?.employee_role || 'Dispatcher') as 'Dispatcher' | 'Shift Supervisor' | 'Management',
      weekly_hours_scheduled: employee?.weekly_hours_scheduled || 40,
      default_shift_type_id: employee?.default_shift_type_id || '',
      allow_overtime: employee?.allow_overtime || false,
      max_weekly_hours: employee?.max_weekly_hours || 40
    },
  })

  // Load available shift types
  useEffect(() => {
    async function loadShiftTypes() {
      const client = createClient()
      if (!client) {
        alert('Error initializing Supabase client')
        return
      }

      const { data, error } = await client
        .from('shift_types')
        .select('*')
        .order('name')
      
      if (error) {
        alert('Error loading shift types. Please try again.')
        return
      }
      
      setShiftTypes(data)

      // Set default shift type if none selected
      if (!form.getValues('default_shift_type_id')) {
        const dayShift = data.find(shift => shift.name === 'Day Shift')
        if (dayShift) {
          form.setValue('default_shift_type_id', dayShift.id)
        }
      }
    }
    
    loadShiftTypes()
  }, [form])

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      console.log('Setting employee data:', employee)
      form.reset({
        full_name: employee.profiles?.full_name || '',
        email: employee.email || '',
        username: employee.profiles?.username || '',
        employee_role: (employee.employee_role || 'Dispatcher') as 'Dispatcher' | 'Shift Supervisor' | 'Management',
        weekly_hours_scheduled: employee.weekly_hours_scheduled || 40,
        default_shift_type_id: employee.default_shift_type_id || '',
        allow_overtime: employee?.allow_overtime || false,
        max_weekly_hours: employee?.max_weekly_hours || 40
      })
    } else {
      // For new employees, try to set Day Shift as default
      const dayShift = shiftTypes.find(shift => shift.name === 'Day Shift')
      form.reset({
        full_name: '',
        email: '',
        username: '',
        employee_role: 'Dispatcher',
        weekly_hours_scheduled: 40,
        default_shift_type_id: dayShift?.id || '',
        allow_overtime: false,
        max_weekly_hours: 40
      })
    }
  }, [employee, form, shiftTypes])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const client = createClient()
      if (!client) {
        throw new Error('Could not initialize Supabase client')
      }

      if (employee) {
        // Update existing employee
        const { error } = await client.rpc('update_employee_and_profile', {
          p_employee_id: employee.id,
          p_full_name: values.full_name,
          p_username: values.username,
          p_employee_role: values.employee_role,
          p_weekly_hours_scheduled: values.weekly_hours_scheduled,
          p_default_shift_type_id: values.default_shift_type_id,
          p_allow_overtime: values.allow_overtime,
          p_max_weekly_hours: values.max_weekly_hours
        })

        if (error) {
          throw new Error(`Failed to update employee: ${error.message}`)
        }
      } else {
        // Create new employee
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
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      alert('Error submitting form. Please try again.')
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
              render={({ field }: { field: FormField }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: FormField }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={mode === 'edit'}
                      placeholder={mode === 'edit' ? 'Email cannot be changed' : 'Enter email'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }: { field: FormField }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={mode === 'edit'}
                      placeholder={mode === 'edit' ? 'Username cannot be changed' : 'Enter username'}
                    />
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
                        <SelectValue placeholder="Select an employee role" />
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
            <FormField
              control={form.control}
              name="allow_overtime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allow Overtime</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select allow overtime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_weekly_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Weekly Hours</FormLabel>
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
                {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 