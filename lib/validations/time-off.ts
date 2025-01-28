import * as z from 'zod'
import { TimeOffType, TimeOffStatus } from '@/services/scheduler/types'

const baseTimeOffSchema = z.object({
  type: z.nativeEnum(TimeOffType),
  start_date: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date'
  }),
  end_date: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date'
  }),
  notes: z.string().optional(),
  status: z.nativeEnum(TimeOffStatus).default(TimeOffStatus.PENDING)
})

export const timeOffSchema = baseTimeOffSchema.refine(
  (data) => data.end_date >= data.start_date,
  {
    message: 'End date must be after start date',
    path: ['end_date']
  }
)

export type TimeOffFormValues = z.infer<typeof timeOffSchema>

export const timeOffResponseSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  type: baseTimeOffSchema.shape.type,
  start_date: baseTimeOffSchema.shape.start_date,
  end_date: baseTimeOffSchema.shape.end_date,
  status: z.nativeEnum(TimeOffStatus),
  notes: baseTimeOffSchema.shape.notes,
  submitted_at: z.string().datetime(),
  reviewed_at: z.string().datetime().nullable(),
  reviewed_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export type TimeOffResponse = z.infer<typeof timeOffResponseSchema> 