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
import { useEffect, useState } from 'react'
import type { Employee, EmployeeRole } from '@/services/scheduler/types'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppError } from '@/lib/types/error'

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

// Password generation utilities
function generateSecurePassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function EmployeeDialog({ isOpen, onClose, employee, onEmployeeUpdated }: EmployeeDialogProps) {
  const router = useRouter()
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

  const supabase = createClient()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    emailDomain: '',
  })

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        // Generate secure password
        const temporaryPassword = generateSecurePassword()

        // Get email template
        const { data: template, error: templateError } = await supabase
          .rpc('get_email_template', {
            p_type: 'EMPLOYEE_INVITATION'
          })

        if (templateError) {
          throw new AppError('Failed to get email template', 500)
        }

        // Create user in auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: `${data.email}@${data.emailDomain}`,
          password: temporaryPassword,
          email_confirm: true,
        })

        if (authError) {
          throw new AppError('Failed to create user account', 500)
        }

        // Create employee record
        const { error: employeeError } = await supabase
          .from('employees')
          .insert({
            id: authUser.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: `${data.email}@${data.emailDomain}`,
            employee_role: 'EMPLOYEE',
          })

        if (employeeError) {
          // Cleanup auth user if employee creation fails
          await supabase.auth.admin.deleteUser(authUser.id)
          throw new AppError('Failed to create employee record', 500)
        }

        // Log email
        const { data: emailLog, error: logError } = await supabase
          .rpc('log_email', {
            p_template_id: template.id,
            p_template_version: template.version,
            p_recipient_email: `${data.email}@${data.emailDomain}`,
            p_recipient_name: `${data.firstName} ${data.lastName}`,
            p_subject: template.subject,
            p_metadata: {
              employee_id: authUser.id,
              password_generated_at: new Date().toISOString(),
            },
          })

        if (logError) {
          console.error('Failed to log email:', logError)
        }

        // Send welcome email
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template: template.id,
            recipient: {
              email: `${data.email}@${data.emailDomain}`,
              name: `${data.firstName} ${data.lastName}`,
            },
            variables: {
              company_name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Our Company',
              employee_name: `${data.firstName} ${data.lastName}`,
              email: `${data.email}@${data.emailDomain}`,
              password: temporaryPassword,
            },
            logId: emailLog,
          }),
        })

        if (!response.ok) {
          console.error('Failed to send email:', await response.text())
        }

        return { success: true }
      } catch (error) {
        console.error('Error creating employee:', error)
        throw error
      }
    },
    onError: (error) => {
      toast.error('Failed to create employee', {
        description: error instanceof AppError ? error.message : 'An unexpected error occurred',
      })
    },
    onSuccess: () => {
      toast.success('Employee created successfully')
      onClose()
      router.refresh()
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        emailDomain: '',
      })
    },
  })

  const onSubmit = (values: EmployeeFormValues) => {
    createEmployeeMutation.mutate(formData)
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
              {isSubmitting ? 'Creating...' : employee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 