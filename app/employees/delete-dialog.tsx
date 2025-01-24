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
import { Database } from '@/app/database.types'

type Employee = Database['public']['Tables']['employees']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url' | 'updated_at'>
  shift_types?: Pick<Database['public']['Tables']['shift_types']['Row'], 'name' | 'description'>
}

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
            Are you sure you want to delete {employee.profiles?.full_name}? This
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