/**
 * Employee-related type definitions
 */

export enum EmployeeRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE'
}

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
