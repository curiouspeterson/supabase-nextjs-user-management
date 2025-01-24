'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StaffingRequirementDialog } from './staffing-requirement-dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ShiftType {
  id: string
  name: string
  start_time: string
  end_time: string
}

interface StaffingRequirement {
  id: string
  period_name: string
  start_time: string
  end_time: string
  minimum_employees: number
  shift_supervisor_required: boolean
  created_at: string
  updated_at: string
}

interface StaffingRequirementsTableProps {
  isManager: boolean
}

export function StaffingRequirementsTable({ isManager }: StaffingRequirementsTableProps) {
  const [requirements, setRequirements] = useState<StaffingRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedRequirement, setSelectedRequirement] = useState<StaffingRequirement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<StaffingRequirement | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { toast } = useToast()

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('staffing_requirements')
        .select('*')
        .order('start_time')

      if (error) throw error
      console.log('Fetched staffing requirements:', data)
      setRequirements(data || [])
    } catch (error) {
      console.error('Error fetching staffing requirements:', error)
      setError(error as Error)
      toast({
        title: 'Error',
        description: 'Failed to fetch staffing requirements',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Fetch requirements on component mount
  useEffect(() => {
    fetchRequirements()
  }, [fetchRequirements])

  function handleEdit(requirement: StaffingRequirement) {
    setSelectedRequirement(requirement)
    setDialogOpen(true)
  }

  function handleAdd() {
    setSelectedRequirement(null)
    setDialogOpen(true)
  }

  function handleDelete(requirement: StaffingRequirement) {
    setRequirementToDelete(requirement)
    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    if (!requirementToDelete) return

    try {
      // First verify we can read the record
      const { data: verifyData, error: verifyError } = await supabase
        .from('staffing_requirements')
        .select('*')
        .eq('id', requirementToDelete.id)
        .single()

      if (verifyError) {
        console.error('Verify error:', verifyError)
        throw verifyError
      }

      console.log('Current record:', verifyData)

      // Attempt the delete
      const { data: deleteData, error: deleteError } = await supabase
        .from('staffing_requirements')
        .delete()
        .eq('id', requirementToDelete.id)
        .select()

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }

      if (!deleteData || deleteData.length === 0) {
        throw new Error('No records were deleted')
      }

      console.log('Delete response:', deleteData)

      toast({
        title: 'Success',
        description: 'Staffing requirement deleted successfully',
      })
      fetchRequirements()
    } catch (error) {
      console.error('Error deleting staffing requirement:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete staffing requirement. ' + 
          (error instanceof Error ? error.message : 'Please try again.'),
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setRequirementToDelete(null)
    }
  }

  function formatTime(time: string) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div>
      {isManager && (
        <div className="mb-4">
          <Button onClick={handleAdd}>Add Requirement</Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Min Staff</TableHead>
              <TableHead>Supervisor</TableHead>
              {isManager && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isManager ? 5 : 4} className="text-center">
                  <div data-testid="loading-spinner" className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={isManager ? 5 : 4} className="text-center text-red-600">
                  Error loading staffing requirements
                </TableCell>
              </TableRow>
            ) : requirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManager ? 5 : 4} className="text-center">
                  No staffing requirements found
                </TableCell>
              </TableRow>
            ) : (
              requirements.map((requirement) => (
                <TableRow key={requirement.id}>
                  <TableCell aria-label={`Period name for ${requirement.period_name} shift`}>{requirement.period_name}</TableCell>
                  <TableCell aria-label={`Time range for ${requirement.period_name} shift`}>
                    {formatTime(requirement.start_time)} - {formatTime(requirement.end_time)}
                  </TableCell>
                  <TableCell aria-label={`Minimum staff required for ${requirement.period_name} shift`}>
                    {requirement.minimum_employees}
                  </TableCell>
                  <TableCell aria-label={`Supervisor requirement for ${requirement.period_name} shift`}>
                    {requirement.shift_supervisor_required ? 'Required' : 'Optional'}
                  </TableCell>
                  {isManager && (
                    <TableCell aria-label={`Actions for ${requirement.period_name} shift`}>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(requirement)}
                          aria-label={`Edit ${requirement.period_name} requirement`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(requirement)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          aria-label={`Delete ${requirement.period_name} requirement`}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StaffingRequirementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        requirement={selectedRequirement}
        onSuccess={() => {
          fetchRequirements()
          setDialogOpen(false)
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the staffing requirement for {requirementToDelete?.period_name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 