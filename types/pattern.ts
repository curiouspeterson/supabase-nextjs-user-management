/**
 * Pattern-related type definitions
 */

import { Database } from './supabase'

export enum PatternStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

export interface Shift {
  startTime: string
  endTime: string
  duration: number
  type: string
}

export type PatternShift = {
  start_time: string
  end_time: string
  shift_type_id: string
  duration_hours: number
  duration_category: Database['public']['Enums']['duration_category_enum'] | null
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