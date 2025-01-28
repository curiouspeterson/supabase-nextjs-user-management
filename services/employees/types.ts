import type { Database } from '@/types/supabase'
import type { Employee, EmployeeRole, EmployeeStatus, CreateEmployeeInput, UpdateEmployeeInput } from '@/types/employee'

export type { Employee, EmployeeRole, EmployeeStatus, CreateEmployeeInput, UpdateEmployeeInput }

// Database types
export type DbEmployee = Database['public']['Tables']['employees']['Row']
export type DbEmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type DbEmployeeUpdate = Database['public']['Tables']['employees']['Update'] 