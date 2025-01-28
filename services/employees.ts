import { createClient } from '@supabase/supabase-js'
import type { Employee } from '@/types'

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
    fullName: employee.full_name,
    email: employee.email,
    role: employee.role,
    status: employee.status,
    teamId: employee.team?.id || null,
    teamName: employee.team?.name || null,
    createdAt: new Date(employee.created_at),
    updatedAt: new Date(employee.updated_at)
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
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    teamId: data.team?.id || null,
    teamName: data.team?.name || null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({
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
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    teamId: data.team?.id || null,
    teamName: data.team?.name || null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updateEmployee(
  id: string,
  updates: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update({
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
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    teamId: data.team?.id || null,
    teamName: data.team?.name || null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
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