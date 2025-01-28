import * as z from 'zod'

export const userProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  website: z.string().url('Invalid URL').optional().nullable(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
})

export const userSettingsSchema = z.object({
  email_notifications: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
  timezone: z.string(),
  language: z.string(),
})

export type UserProfileInput = z.infer<typeof userProfileSchema>
export type UserSettingsInput = z.infer<typeof userSettingsSchema> 