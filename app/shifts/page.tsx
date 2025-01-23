'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
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

interface ShiftTemplate {
  id: string
  shift_name: string
  start_time: string
  end_time: string
  duration_hours: number
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<ShiftTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftTemplate | undefined>()
  const supabase = createClient()

  const fetchShifts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time')

      if (error) {
        throw error
      }

      setShifts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred while fetching shifts')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.from('shifts').delete().eq('id', id)

      if (error) {
        throw error
      }

      await fetchShifts()
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
      <div className="flex items-center justify-center min-h-screen">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shifts.map((shift) => (
          <Card key={shift.id}>
            <CardHeader>
              <CardTitle>{shift.shift_name}</CardTitle>
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

      <ShiftTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={selectedShift}
        onSuccess={fetchShifts}
      />
    </div>
  )
} 