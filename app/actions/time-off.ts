'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TimeOffRequest } from '@/types'

export async function getTimeOffRequests() {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('time_off_requests')
    .select(`
      *,
      employee:employees(full_name)
    `)
    .order('start_date', { ascending: false })
    
  if (error) {
    throw new Error(`Failed to fetch time off requests: ${error.message}`)
  }
  
  return data as TimeOffRequest[]
}

export async function updateTimeOffStatus(id: string, status: 'approved' | 'rejected') {
  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase
    .from('time_off_requests')
    .update({ status })
    .eq('id', id)
    
  if (error) {
    throw new Error(`Failed to update time off request: ${error.message}`)
  }
  
  revalidatePath('/dashboard/time-off')
} 