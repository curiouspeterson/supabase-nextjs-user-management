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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'

const shiftSchema = z.object({
  shift_type_id: z.string().min(1, 'Shift type is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  duration_category: z.string().min(1, 'Duration is required'),
})

type ShiftFormData = z.infer<typeof shiftSchema>

interface ShiftType {
  id: string
  name: string
  description: string | null
}

interface ShiftTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: {
    id: string
    shift_type_id: string
    start_time: string
    end_time: string
    duration_hours: number
    duration_category: string
  }
  onSuccess?: () => void
}

const DURATION_CATEGORIES = ['4 hours', '10 hours', '12 hours'] as const

export function ShiftTemplateDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: ShiftTemplateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const supabase = createClient()

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      shift_type_id: '',
      start_time: '',
      end_time: '',
      duration_category: '',
    },
  })

  // Load shift types
  useEffect(() => {
    async function loadShiftTypes() {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error loading shift types:', error)
        return
      }
      
      setShiftTypes(data)
    }
    
    loadShiftTypes()
  }, [supabase])

  // Reset form when shift changes
  useEffect(() => {
    if (shift) {
      form.reset({
        shift_type_id: shift.shift_type_id,
        start_time: shift.start_time,
        end_time: shift.end_time,
        duration_category: shift.duration_category,
      })
    } else {
      form.reset({
        shift_type_id: '',
        start_time: '',
        end_time: '',
        duration_category: '',
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
            <Label htmlFor="shift_type_id">Shift Type</Label>
            <Select
              defaultValue={form.getValues('shift_type_id')}
              onValueChange={(value) => form.setValue('shift_type_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a shift type" />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.shift_type_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.shift_type_id.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration_category">Duration</Label>
            <Select
              defaultValue={form.getValues('duration_category')}
              onValueChange={(value) => form.setValue('duration_category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_CATEGORIES.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.duration_category && (
              <p className="text-sm text-red-500">
                {form.formState.errors.duration_category.message}
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