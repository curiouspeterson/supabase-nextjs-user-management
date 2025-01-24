'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '../../../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { StaffingRequirementDialog } from './staffing-requirement-dialog'
import { useToast } from '../../../components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"

interface ShiftType {
  id: string
  name: string
  start_time: string
  end_time: string
}

interface StaffingRequirement {
  id: string
  day_of_week: string
  period_name: string
  start_time: string
  end_time: string
  min_employees: number
  max_employees: number
  requires_supervisor: boolean
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

  async function fetchRequirements() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('staffing_requirements')
        .select('*')
        .order('start_time')

      if (error) throw error
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
  }

  // Fetch requirements on component mount
  useEffect(() => {
    fetchRequirements()
  }, [])

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
      const { error } = await supabase
        .from('staffing_requirements')
        .delete()
        .eq('id', requirementToDelete.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Staffing requirement deleted successfully',
      })
      fetchRequirements()
    } catch (error) {
      console.error('Error deleting staffing requirement:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete staffing requirement',
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
              <TableHead>Day</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Min Staff</TableHead>
              <TableHead>Max Staff</TableHead>
              <TableHead>Supervisor</TableHead>
              {isManager && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isManager ? 7 : 6} className="text-center">
                  <div data-testid="loading-spinner" className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={isManager ? 7 : 6} className="text-center text-red-600">
                  Error loading staffing requirements
                </TableCell>
              </TableRow>
            ) : requirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManager ? 7 : 6} className="text-center">
                  No staffing requirements found
                </TableCell>
              </TableRow>
            ) : (
              requirements.map((requirement) => (
                <TableRow key={requirement.id}>
                  <TableCell aria-label="Day of week">{requirement.day_of_week}</TableCell>
                  <TableCell aria-label="Period name">{requirement.period_name}</TableCell>
                  <TableCell aria-label="Time range">
                    {formatTime(requirement.start_time)} - {formatTime(requirement.end_time)}
                  </TableCell>
                  <TableCell aria-label="Minimum staff required">{requirement.min_employees}</TableCell>
                  <TableCell aria-label="Maximum staff allowed">{requirement.max_employees}</TableCell>
                  <TableCell aria-label="Supervisor requirement">{requirement.requires_supervisor ? 'Required' : 'Optional'}</TableCell>
                  {isManager && (
                    <TableCell aria-label="Actions">
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