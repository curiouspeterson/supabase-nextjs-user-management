import { createClient } from '@/lib/supabase/client'
import type { Employee } from '@/types/employee'
import type { Database } from '@/types/supabase'

const supabase = createClient()

type DbEmployeeWithProfile = Database['public']['Tables']['employees']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

/**
 * Transform a database employee to the application type
 */
function transformEmployee(dbEmployee: DbEmployeeWithProfile): Employee {
  return {
    id: dbEmployee.id,
    employee_role: dbEmployee.employee_role,
    user_role: dbEmployee.user_role,
    weekly_hours_scheduled: dbEmployee.weekly_hours_scheduled,
    default_shift_type_id: dbEmployee.default_shift_type_id,
    created_at: dbEmployee.created_at,
    updated_at: dbEmployee.updated_at
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(input: Employee): Promise<Employee> {
  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .insert({
      id: input.id,
      employee_role: input.employee_role,
      user_role: input.user_role,
      weekly_hours_scheduled: input.weekly_hours_scheduled,
      default_shift_type_id: input.default_shift_type_id
    })
    .select('*, profiles(*)')
    .single()

  if (employeeError) {
    throw new Error(`Failed to create employee: ${employeeError.message}`)
  }

  return transformEmployee(employeeData as DbEmployeeWithProfile)
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select('*, profiles(*)')
    .single()

  if (employeeError) {
    throw new Error(`Failed to update employee: ${employeeError.message}`)
  }

  return transformEmployee(employeeData as DbEmployeeWithProfile)
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete employee: ${error.message}`)
  }
}

/**
 * Fetch all employees
 */
export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }

  return (data || []).map(employee => transformEmployee(employee as DbEmployeeWithProfile))
}

/**
 * Fetch a single employee by ID
 */
export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Row not found
    throw new Error(`Failed to fetch employee: ${error.message}`)
  }

  return data ? transformEmployee(data as DbEmployeeWithProfile) : null
}