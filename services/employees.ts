import { createClient } from '@supabase/supabase-js'
import type { Employee, CreateEmployeeInput } from '@/types/employee'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      team:teams(id, name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch employees')
  }

  return data.map(employee => ({
    id: employee.id,
    firstName: employee.first_name,
    lastName: employee.last_name,
    fullName: employee.full_name,
    email: employee.email,
    role: employee.role,
    status: employee.status,
    teamId: employee.team?.id || null,
    teamName: employee.team?.name || null,
    avatarUrl: employee.avatar_url,
    createdAt: employee.created_at,
    updatedAt: employee.updated_at
  }))
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      team:teams(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('Failed to fetch employee')
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    teamId: data.team?.id || null,
    teamName: data.team?.name || null,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function createEmployee(employee: CreateEmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({
      first_name: employee.firstName,
      last_name: employee.lastName,
      full_name: employee.fullName,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      team_id: employee.teamId
    })
    .select(`
      *,
      team:teams(id, name)
    `)
    .single()

  if (error) {
    throw new Error('Failed to create employee')
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    teamId: data.team?.id || null,
    teamName: data.team?.name || null,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function updateEmployee(
  id: string,
  updates: Partial<CreateEmployeeInput>
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      full_name: updates.fullName,
      email: updates.email,
      role: updates.role,
      status: updates.status,
      team_id: updates.teamId
    })
    .eq('id', id)
    .select(`
      *,
      team:teams(id, name)
    `)
    .single()

  if (error) {
    throw new Error('Failed to update employee')
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    teamId: data.team?.id || null,
    teamName: data.team?.name || null,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
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