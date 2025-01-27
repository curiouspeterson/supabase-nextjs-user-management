'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import type { Employee, EmployeeRole } from '@/services/scheduler/types'

const employeeSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  employee_role: z.enum(['Employee', 'Shift Supervisor', 'Management'] as const),
  weekly_hours_scheduled: z.number().min(0).max(168),
  default_shift_type_id: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
  employee?: Employee
  onEmployeeUpdated: () => void
}

const mapRoleToDatabase = (role: EmployeeRole): 'Dispatcher' | 'Shift Supervisor' | 'Management' => {
  switch (role) {
    case 'Employee':
      return 'Dispatcher'
    case 'Management':
      return 'Management'
    case 'Shift Supervisor':
      return 'Shift Supervisor'
  }
}

const mapUserRole = (role: EmployeeRole): 'Employee' | 'Admin' => {
  switch (role) {
    case 'Management':
      return 'Admin'
    default:
      return 'Employee'
  }
}

const mapLegacyRole = (role: string): EmployeeRole => {
  switch (role) {
    case 'Dispatcher':
      return 'Employee' as const
    case 'Manager':
      return 'Management' as const
    case 'Shift Supervisor':
      return 'Shift Supervisor' as const
    default:
      return 'Employee' as const
  }
}

export function EmployeeDialog({ isOpen, onClose, employee, onEmployeeUpdated }: EmployeeDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: '',
      username: '',
      employee_role: 'Employee',
      weekly_hours_scheduled: 40,
      default_shift_type_id: undefined,
    },
  })

  useEffect(() => {
    if (employee) {
      setValue('full_name', employee.full_name || '')
      setValue('username', employee.username || '')
      setValue('employee_role', mapLegacyRole(employee.employee_role))
      setValue('weekly_hours_scheduled', employee.weekly_hours_scheduled)
      setValue('default_shift_type_id', employee.default_shift_type_id || undefined)
    } else {
      reset()
    }
  }, [employee, setValue, reset])

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      const client = createClient()

      if (employee) {
        // Update existing employee
        const { error } = await client.from('employees').update({
          employee_role: mapRoleToDatabase(values.employee_role),
          weekly_hours_scheduled: values.weekly_hours_scheduled,
          default_shift_type_id: values.default_shift_type_id,
          user_role: mapUserRole(values.employee_role),
        }).eq('id', employee.id)

        if (error) {
          throw error
        }

        // Update profile
        const { error: profileError } = await client.from('profiles').update({
          full_name: values.full_name,
          username: values.username,
        }).eq('id', employee.id)

        if (profileError) {
          throw profileError
        }
      } else {
        // Create new employee
        const { data: userData, error: userError } = await client.auth.signUp({
          email: `${values.username}@example.com`,
          password: 'tempPassword123!',
        })

        if (userError || !userData.user) {
          throw userError || new Error('Failed to create user')
        }

        // Create profile
        const { error: profileError } = await client.from('profiles').insert({
          id: userData.user.id,
          full_name: values.full_name,
          username: values.username,
        })

        if (profileError) {
          throw profileError
        }

        // Create employee
        const { error: employeeError } = await client.from('employees').insert({
          id: userData.user.id,
          employee_role: mapRoleToDatabase(values.employee_role),
          weekly_hours_scheduled: values.weekly_hours_scheduled,
          default_shift_type_id: values.default_shift_type_id,
          user_role: mapUserRole(values.employee_role),
        })

        if (employeeError) {
          throw employeeError
        }
      }

      onEmployeeUpdated()
      onClose()
    } catch (error) {
      console.error('Error saving employee:', error)
      // Handle error (show toast, etc.)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register('username')}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="employee_role">Role</Label>
            <Select
              onValueChange={(value) => setValue('employee_role', value as EmployeeRole)}
              defaultValue={employee ? mapLegacyRole(employee.employee_role) : 'Employee'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Shift Supervisor">Shift Supervisor</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
              </SelectContent>
            </Select>
            {errors.employee_role && (
              <p className="text-sm text-red-500">{errors.employee_role.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="weekly_hours_scheduled">Weekly Hours</Label>
            <Input
              id="weekly_hours_scheduled"
              type="number"
              {...register('weekly_hours_scheduled', { valueAsNumber: true })}
              className={errors.weekly_hours_scheduled ? 'border-red-500' : ''}
            />
            {errors.weekly_hours_scheduled && (
              <p className="text-sm text-red-500">{errors.weekly_hours_scheduled.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 