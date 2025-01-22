'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'

const shiftSchema = z.object({
  shift_name: z.string().min(1, 'Shift name is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
})

type ShiftFormData = z.infer<typeof shiftSchema>

interface ShiftTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: {
    id: string
    shift_name: string
    start_time: string
    end_time: string
    duration_hours: number
  }
  onSuccess?: () => void
}

export function ShiftTemplateDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: ShiftTemplateDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      shift_name: '',
      start_time: '',
      end_time: '',
    },
  })

  // Reset form when shift changes
  useEffect(() => {
    if (shift) {
      form.reset({
        shift_name: shift.shift_name,
        start_time: shift.start_time,
        end_time: shift.end_time,
      })
    } else {
      form.reset({
        shift_name: '',
        start_time: '',
        end_time: '',
      })
    }
  }, [shift, form])

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(`2000-01-01T${start}`)
    const endDate = new Date(`2000-01-01T${end}`)
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1)
    }
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
  }

  const handleSubmit = async (data: ShiftFormData) => {
    try {
      setLoading(true)
      const duration = calculateDuration(data.start_time, data.end_time)

      if (shift?.id) {
        const { error } = await supabase
          .from('shifts')
          .update({
            ...data,
            duration_hours: duration,
          })
          .eq('id', shift.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('shifts').insert({
          ...data,
          duration_hours: duration,
        })

        if (error) throw error
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving shift template:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit' : 'Create'} Shift Template</DialogTitle>
          <DialogDescription>
            {shift ? 'Update the' : 'Add a new'} shift template for scheduling.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="shift_name">Shift Name</Label>
            <Input
              id="shift_name"
              placeholder="e.g., Day Shift"
              {...form.register('shift_name')}
            />
            {form.formState.errors.shift_name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.shift_name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                {...form.register('start_time')}
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.start_time.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                {...form.register('end_time')}
              />
              {form.formState.errors.end_time && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.end_time.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : shift ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 