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
import { useEffect, useState, useCallback } from 'react'
import type { Employee, EmployeeRole } from '@/services/scheduler/types'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppError } from '@/lib/types/error'
import { useToast } from '@/components/ui/use-toast'
import { useEmployeeStore } from '@/lib/stores/employee-store'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { employeeSchema } from '@/lib/validations/employee'

const employeeSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  employee_role: z.enum(['Employee', 'Shift Supervisor', 'Management'] as const),
  weekly_hours_scheduled: z.number().min(0).max(168),
  default_shift_type_id: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeDialogProps {
  employee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function EmployeeDialog({ employee, open, onOpenChange }: EmployeeDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addEmployee, updateEmployee } = useEmployeeStore()
  const { handleError } = useErrorBoundary()

  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    }
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && employee) {
      form.reset(employee)
    } else if (!open) {
      form.reset()
    }
  }, [open, employee, form])

  // Validate form data before submission
  const validateFormData = useCallback((data: any) => {
    try {
      return employeeSchema.parse(data)
    } catch (error) {
      handleError(error)
      return null
    }
  }, [handleError])

  const onSubmit = useCallback(async (data: any) => {
    try {
      setIsSubmitting(true)

      // Validate form data
      const validatedData = validateFormData(data)
      if (!validatedData) return

      if (employee) {
        await updateEmployee({
          ...employee,
          ...validatedData
        })
        toast({ title: 'Employee updated successfully' })
      } else {
        await addEmployee(validatedData)
        toast({ title: 'Employee added successfully' })
      }

      onOpenChange(false)
    } catch (error) {
      handleError(error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [employee, updateEmployee, addEmployee, validateFormData, handleError, toast, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName">First Name</label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                error={form.formState.errors.firstName?.message}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName">Last Name</label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                error={form.formState.errors.lastName?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>

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
      </DialogContent>
    </Dialog>
  )
} 