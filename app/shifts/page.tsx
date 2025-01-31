'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShiftTemplateDialog } from '@/components/shifts/shift-template-dialog'
import { signOut } from '../login/actions'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/logger'
import { AppError, DatabaseError } from '@/lib/errors'
import type { 
  Shift as DatabaseShift, 
  ShiftType as DatabaseShiftType,
  ShiftDurationCategory
} from '@/services/scheduler/types'

type DurationCategory = "4 hours" | "10 hours" | "12 hours";

// Database types with relationships
interface DatabaseShiftTypeWithRelations extends DatabaseShiftType {
  shifts: DatabaseShift[]
}

interface ShiftDisplay {
  id: string
  start_time: string
  end_time: string
  duration_hours: number
  duration_category: ShiftDurationCategory | null
  shift_type_id: string
}

interface ShiftTypeDisplay extends Omit<DatabaseShiftType, 'color'> {
  shifts: ShiftDisplay[]
}

// Transform database shift type to display type
function transformShiftType(dbType: DatabaseShiftTypeWithRelations): ShiftTypeDisplay {
  return {
    id: dbType.id,
    name: dbType.name,
    description: dbType.description,
    created_at: dbType.created_at,
    updated_at: dbType.updated_at,
    shifts: dbType.shifts.map(shift => {
      // Ensure duration_category is one of the valid ShiftDurationCategory values
      let duration_category: ShiftDurationCategory | null = null;
      if (shift.duration_category === '4 hours' || 
          shift.duration_category === '10 hours' || 
          shift.duration_category === '12 hours') {
        duration_category = shift.duration_category;
      }

      return {
        id: shift.id,
        start_time: shift.start_time,
        end_time: shift.end_time,
        duration_hours: shift.duration_hours,
        duration_category,
        shift_type_id: shift.shift_type_id
      };
    })
  }
}

export default function ShiftsPage() {
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftDisplay | undefined>()
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/login')
          return
        }
        setLoading(false)
      } catch (error) {
        console.error('Session check error:', error)
        router.replace('/login')
      }
    }

    checkSession()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign out',
          variant: 'destructive'
        })
        return
      }

      // Clear client-side state
      router.refresh()
      router.replace('/login')
      
      toast({
        title: 'Success',
        description: 'Signed out successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        variant: 'destructive'
      })
    }
  }

  const fetchShiftTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shift_types')
        .select(`
          *,
          shifts (*)
        `)
        .order('name')

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('No data returned from database')
      }

      setShiftTypes(data.map(type => transformShiftType(type as DatabaseShiftTypeWithRelations)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred while fetching shifts')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchShiftTypes()
  }, [fetchShiftTypes])

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.from('shifts').delete().eq('id', id)

      if (error) {
        throw error
      }

      await fetchShiftTypes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred while deleting the shift')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shifts</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Shift Templates</h1>
              <p className="text-sm text-muted-foreground">
                Manage your shift templates and schedules
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedShift(undefined)
                setDialogOpen(true)
              }}
              disabled={loading}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Shift Template
            </Button>
          </div>

          {shiftTypes.map((shiftType) => (
            <div key={shiftType.id} className="space-y-4">
              <h2 className="text-xl font-semibold">{shiftType.name}</h2>
              {shiftType.description && (
                <p className="text-sm text-muted-foreground">{shiftType.description}</p>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shiftType.shifts.map((shift) => (
                  <Card key={shift.id}>
                    <CardHeader>
                      <CardTitle>
                        {shift.duration_category}
                      </CardTitle>
                      <CardDescription>
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {shift.duration_hours} hours
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedShift(shift)
                          setDialogOpen(true)
                        }}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(shift.id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          <ShiftTemplateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            shift={selectedShift}
            onSuccess={fetchShiftTypes}
          />
        </div>
      </div>
    </div>
  )
} 