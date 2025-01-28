import * as z from 'zod'

export const timeOffSchema = z.object({
  type: z.enum(['VACATION', 'SICK', 'PERSONAL', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID']),
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date'
  }),
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date'
  }),
  notes: z.string().optional(),
  isPaid: z.boolean().default(true)
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
)

export type TimeOffFormValues = z.infer<typeof timeOffSchema>

export const timeOffResponseSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  type: timeOffSchema.shape.type,
  startDate: timeOffSchema.shape.startDate,
  endDate: timeOffSchema.shape.endDate,
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  notes: timeOffSchema.shape.notes,
  isPaid: timeOffSchema.shape.isPaid,
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  reviewNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type TimeOffResponse = z.infer<typeof timeOffResponseSchema> 