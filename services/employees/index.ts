import { createClient } from '@/lib/supabase/client'
import type { Employee } from '@/types/employee'
import type { Database } from '@/types/supabase'
import { DatabaseError } from '@/lib/errors'

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
    updated_at: dbEmployee.updated_at,
    // Add profile data if available
    full_name: dbEmployee.profiles?.full_name || null,
    avatar_url: dbEmployee.profiles?.avatar_url || null
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
 * Fetch all employees with their profiles
 */
export async function getEmployees(): Promise<Employee[]> {
  const supabase = createClient()

  try {
    const { data, error, status } = await supabase
      .from('employees')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })

    if (error) {
      if (status === 401) {
        throw new DatabaseError('Not authenticated', { cause: error })
      }
      throw new DatabaseError(`Failed to fetch employees: ${error.message}`, { cause: error })
    }

    // Always return an array, even if empty
    return (data || []).map(employee => transformEmployee(employee as DbEmployeeWithProfile))
  } catch (err) {
    // Log the error for debugging
    console.error('Error in getEmployees:', err)
    
    // Re-throw database errors
    if (err instanceof DatabaseError) {
      throw err
    }
    
    // Wrap unknown errors
    throw new DatabaseError('Unexpected error fetching employees', { cause: err })
  }
}

/**
 * Fetch a single employee by ID
 */
export async function getEmployee(id: string): Promise<Employee | null> {
  const supabase = createClient()

  try {
    const { data, error, status } = await supabase
      .from('employees')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Row not found
      if (status === 401) {
        throw new DatabaseError('Not authenticated', { cause: error })
      }
      throw new DatabaseError(`Failed to fetch employee: ${error.message}`, { cause: error })
    }

    return data ? transformEmployee(data as DbEmployeeWithProfile) : null
  } catch (err) {
    console.error('Error in getEmployee:', err)
    if (err instanceof DatabaseError) {
      throw err
    }
    throw new DatabaseError('Unexpected error fetching employee', { cause: err })
  }
}