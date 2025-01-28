import { createClient } from '@supabase/supabase-js'
import type { Employee, EmployeeInsert, EmployeeUpdate } from '@/types/employee'
import { Database } from '@/types/supabase'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch employees')
  }

  return data
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('Failed to fetch employee')
  }

  return data
}

export async function createEmployee(employee: EmployeeInsert): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create employee')
  }

  return data
}

export async function updateEmployee(
  id: string,
  updates: EmployeeUpdate
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update employee')
  }

  return data
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete employee')
  }
} 