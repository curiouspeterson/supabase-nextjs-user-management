'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Employee {
  id: string
  full_name: string
  email: string
  role: string
  department: string
  start_date: string
  status: 'active' | 'inactive'
}

export async function getEmployees() {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('full_name')
  
  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }
  
  return data as Employee[]
}

export async function updateEmployeeStatus(id: string, status: 'active' | 'inactive') {
  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase
    .from('employees')
    .update({ status })
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to update employee status: ${error.message}`)
  }
  
  revalidatePath('/employees')
} 