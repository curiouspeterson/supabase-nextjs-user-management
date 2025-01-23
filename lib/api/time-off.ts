import { createClient } from '@/utils/supabase/client'
import { TimeOffRequestInsert, TimeOffRequestUpdate, TimeOffRequestWithReviewer } from '@/lib/types/time-off'

export async function getTimeOffRequests() {
  const supabase = createClient()

  return supabase
    .from('time_off_requests')
    .select(
      `
      *,
      employee:employee_id (
        id,
        name
      ),
      reviewer:reviewed_by (
        id,
        name
      )
      `
    )
    .order('submitted_at', { ascending: false })
}

export async function createTimeOffRequest(request: TimeOffRequestInsert) {
  const supabase = createClient()

  return supabase.from('time_off_requests').insert(request)
}

export async function updateTimeOffRequest(id: string, request: TimeOffRequestUpdate) {
  const supabase = createClient()

  return supabase.from('time_off_requests').update(request).eq('id', id)
} 