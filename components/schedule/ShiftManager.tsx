'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/lib/database.types'
import type { Schedule, Shift, ShiftType } from '@/types/schedule'
import { addHours, format, parseISO, isValid } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TimeField } from '@mui/x-date-pickers/TimeField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { logger } from '@/lib/logger'

type DurationCategory = "4 hours" | "10 hours" | "12 hours"
const DURATION_CATEGORIES: DurationCategory[] = ["4 hours", "10 hours", "12 hours"]

type ScheduleStatus = "Draft" | "Published"

interface ShiftManagerProps {
  date: Date
  employeeId: string
  onClose: () => void
  onSave: () => void
  shift?: Schedule & { shifts: Shift }
}

// Form validation schema
const shiftFormSchema = z.object({
  shiftTypeId: z.string().uuid(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(4).max(12),
})

type ShiftFormData = z.infer<typeof shiftFormSchema>

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export default function ShiftManager({ date, employeeId, onClose, onSave, shift }: ShiftManagerProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      startTime: shift?.shifts?.start_time || '00:00',
      duration: shift?.shifts?.duration_hours || 4,
      shiftTypeId: shift?.shifts?.shift_type_id || '',
    },
  })

  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const supabase = createClient()

  const startTime = watch('startTime')
  const duration = watch('duration')

  // Load shift types
  useEffect(() => {
    async function loadShiftTypes() {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .order('name')
      
      if (error) {
        logger.error('Error loading shift types:', { error })
        return
      }
      
      setShiftTypes(data)
      if (!shift && data.length > 0) {
        setValue('shiftTypeId', data[0].id)
      }
    }
    
    loadShiftTypes()
  }, [supabase, shift, setValue])

  // Validate shift assignment when inputs change
  useEffect(() => {
    const validateShift = async () => {
      if (!startTime || !duration) return

      setValidating(true)
      try {
        const endTime = calculateEndTime(startTime, duration)
        
        // Get or create shift record for validation
        const { data: shiftData, error: shiftError } = await supabase
          .from('shifts')
          .select('id')
          .eq('start_time', startTime)
          .eq('end_time', endTime)
          .eq('duration_hours', duration)
          .single()

        if (shiftError && shiftError.code !== 'PGRST116') {
          throw shiftError
        }

        const shiftId = shiftData?.id || shift?.shift_id

        if (!shiftId) {
          setValidationResult({
            valid: false,
            errors: ['Invalid shift configuration'],
            warnings: [],
          })
          return
        }

        const { data: validation, error: validationError } = await supabase
          .rpc('validate_shift_assignment', {
            p_employee_id: employeeId,
            p_shift_id: shiftId,
            p_date: date.toISOString().split('T')[0],
          })

        if (validationError) throw validationError

        setValidationResult(validation)
      } catch (error) {
        logger.error('Error validating shift:', { error })
        setValidationResult({
          valid: false,
          errors: ['Failed to validate shift'],
          warnings: [],
        })
      } finally {
        setValidating(false)
      }
    }

    const debounceValidate = setTimeout(validateShift, 500)
    return () => clearTimeout(debounceValidate)
  }, [startTime, duration, employeeId, date, supabase, shift?.shift_id])

  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, durationHours: number) => {
    try {
      const [hours, minutes] = start.split(':').map(Number)
      const startDate = new Date(2000, 0, 1, hours, minutes)
      if (!isValid(startDate)) throw new Error('Invalid start time')
      
      const endDate = addHours(startDate, durationHours)
      return format(endDate, 'HH:mm')
    } catch (error) {
      logger.error('Error calculating end time:', { error, start, durationHours })
      return '00:00'
    }
  }

  const getDurationCategory = (hours: number): DurationCategory => {
    switch (hours) {
      case 4:
        return "4 hours"
      case 10:
        return "10 hours"
      case 12:
        return "12 hours"
      default:
        return "4 hours" // Default to shortest shift if invalid duration
    }
  }

  const onSubmit = async (data: ShiftFormData) => {
    if (!validationResult?.valid) {
      return
    }

    try {
      const endTime = calculateEndTime(data.startTime, data.duration)
      const shiftData = {
        start_time: data.startTime,
        end_time: endTime,
        duration_hours: data.duration,
        shift_type_id: data.shiftTypeId,
        duration_category: getDurationCategory(data.duration)
      }

      if (shift) {
        const { error: shiftError } = await supabase
          .from('shifts')
          .update(shiftData)
          .eq('id', shift.shift_id)

        if (shiftError) throw shiftError
      } else {
        const { data: newShift, error: shiftError } = await supabase
          .from('shifts')
          .insert(shiftData)
          .select()
          .single()

        if (shiftError) throw shiftError

        const scheduleData = {
          date: date.toISOString().split('T')[0],
          employee_id: employeeId,
          shift_id: newShift.id,
          status: 'Draft' as ScheduleStatus
        }

        const { error: scheduleError } = await supabase
          .from('schedules')
          .insert(scheduleData)

        if (scheduleError) throw scheduleError
      }

      onSave()
    } catch (error) {
      logger.error('Error saving shift:', { error })
      setValidationResult({
        valid: false,
        errors: ['Failed to save shift'],
        warnings: [],
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {shift ? 'Edit Shift' : 'Add New Shift'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shift Type
            </label>
            <Controller
              name="shiftTypeId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dispatch-500 focus:ring-dispatch-500"
                >
                  {shiftTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.shiftTypeId && (
              <p className="mt-1 text-sm text-red-600">{errors.shiftTypeId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TimeField
                    {...field}
                    format="HH:mm"
                    className="mt-1 block w-full"
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        error: !!errors.startTime,
                        helperText: errors.startTime?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dispatch-500 focus:ring-dispatch-500"
                >
                  <option value={4}>4 hours</option>
                  <option value={10}>10 hours</option>
                  <option value={12}>12 hours</option>
                </select>
              )}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time (calculated)
            </label>
            <input
              type="time"
              value={calculateEndTime(startTime, duration)}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
            />
          </div>

          {validating && (
            <div className="flex items-center justify-center py-2">
              <Spinner className="h-5 w-5 text-dispatch-600" />
              <span className="ml-2 text-sm text-gray-500">Validating shift...</span>
            </div>
          )}

          {validationResult && (
            <>
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <ul className="list-disc pl-4">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              {validationResult.warnings.length > 0 && (
                <Alert variant="warning">
                  <ul className="list-disc pl-4">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || validating || !validationResult?.valid}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dispatch-600 hover:bg-dispatch-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dispatch-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 