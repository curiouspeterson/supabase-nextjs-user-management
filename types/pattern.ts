/**
 * Pattern-related type definitions
 */

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

export interface Pattern {
  id: string
  name: string
  description: string
  duration: number
  shifts: Shift[]
  status: PatternStatus
  createdAt: Date
  updatedAt: Date
} 