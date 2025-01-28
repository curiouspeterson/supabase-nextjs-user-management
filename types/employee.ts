/**
 * Employee-related type definitions
 */

import { Database } from './supabase'

export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type EmployeeRole = Database['public']['Enums']['employee_role_enum']
export type UserRole = Database['public']['Enums']['user_role_enum']

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: EmployeeRole
  status: EmployeeStatus
  teamId?: string | null
  teamName?: string | null
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateEmployeeInput = Omit<
  Employee,
  'id' | 'createdAt' | 'updatedAt' | 'avatarUrl'
>

export type UpdateEmployeeInput = Partial<CreateEmployeeInput> 
