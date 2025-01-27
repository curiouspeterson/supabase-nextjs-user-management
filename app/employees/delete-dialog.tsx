'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AppError } from '@/lib/types/error'
import { Employee } from '@/lib/types/employee'

interface DeleteDialogProps {
  employee: Employee
}

export function DeleteDialog({ employee }: DeleteDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  // Delete mutation with error tracking
  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        // Track operation start
        const { data: operation, error: trackError } = await supabase
          .rpc('track_employee_operation', {
            p_employee_id: employee.id,
            p_operation: 'DELETE',
            p_severity: 'HIGH',
            p_metadata: { employee_email: employee.email },
            p_client_info: {
              userAgent: window.navigator.userAgent,
              platform: window.navigator.platform,
            },
          })

        if (trackError) {
          throw new AppError('Failed to track operation', 500)
        }

        // Attempt to delete employee
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .eq('id', employee.id)

        if (deleteError) {
          // Log operation failure
          await supabase.rpc('complete_employee_operation', {
            p_operation_id: operation,
            p_status: 'failed',
            p_error_code: deleteError.code,
            p_error_details: deleteError.message,
            p_stack_trace: deleteError.stack,
          })

          throw new AppError(
            'Failed to delete employee',
            500,
            'DELETE_EMPLOYEE_ERROR',
            { cause: deleteError }
          )
        }

        // Log operation success
        await supabase.rpc('complete_employee_operation', {
          p_operation_id: operation,
          p_status: 'completed',
        })

        return { success: true }
      } catch (error) {
        // Handle unexpected errors
        console.error('Error deleting employee:', error)
        
        if (error instanceof AppError) {
          throw error
        }

        throw new AppError(
          'An unexpected error occurred while deleting the employee',
          500,
          'UNEXPECTED_ERROR',
          { cause: error }
        )
      }
    },
    onError: (error) => {
      toast.error('Failed to delete employee', {
        description: error instanceof AppError ? error.message : 'An unexpected error occurred',
        action: {
          label: 'Retry',
          onClick: () => deleteMutation.mutate(),
        },
      })
    },
    onSuccess: () => {
      toast.success('Employee deleted successfully')
      setIsOpen(false)
      router.refresh()
    },
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Employee'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this employee? This action cannot be undone.
            All associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 