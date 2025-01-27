'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/utils/supabase/client'
import type { Employee } from '@/services/scheduler/types'

interface DeleteDialogProps {
  employee: Employee
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteDialog({
  employee,
  onClose,
  onSuccess,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function onDelete() {
    try {
      setLoading(true)

      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete employee')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      alert('Error deleting employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {employee.full_name}? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 