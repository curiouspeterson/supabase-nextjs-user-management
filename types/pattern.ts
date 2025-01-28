/**
 * Pattern-related type definitions
 */

import { Database } from './supabase'
import { ShiftDurationCategory } from '@/services/scheduler/types'

export enum PatternStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

export type PatternShift = {
  start_time: string
  end_time: string
  shift_type_id: string
  duration_hours: number
  duration_category: ShiftDurationCategory | null
}

export interface Pattern {
  id: string
  name: string
  description?: string
  shifts: PatternShift[]
  status: Database['public']['Enums']['schedule_status_enum']
  created_at: string
  updated_at: string
} 