import { Database } from '@/lib/database.types'

export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']
export type TimeOffRequestInsert = Database['public']['Tables']['time_off_requests']['Insert']
export type TimeOffRequestUpdate = Database['public']['Tables']['time_off_requests']['Update']

export const TimeOffType = {
  VACATION: 'Vacation' as const,
  SICK: 'Sick' as const,
  PERSONAL: 'Personal' as const,
  TRAINING: 'Training' as const,
} as const;

export type TimeOffStatus = TimeOffRequest['status']

export interface TimeOffRequestWithEmployee extends Omit<TimeOffRequest, 'employee_id'> {
  employee: {
    id: string
    email: string
    full_name: string
  }
}

export interface TimeOffRequestWithReviewer extends TimeOffRequestWithEmployee {
  reviewer: {
    id: string
    email: string
    full_name: string
  } | null
} 