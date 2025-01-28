import { createClient } from '@/lib/supabase/client';
import type {
  TimeOffRequest,
  TimeOffRequestType,
  TimeOffRequestStatus,
  DbTimeOffRequest
} from './types';

const supabase = createClient();

/**
 * Transform a database time off request to the application type
 */
function transformTimeOffRequest(dbRequest: DbTimeOffRequest & {
  employees?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}): TimeOffRequest {
  return {
    id: dbRequest.id,
    employee_id: dbRequest.employee_id,
    type: dbRequest.type as TimeOffRequestType,
    status: dbRequest.status as TimeOffRequestStatus,
    start_date: dbRequest.start_date,
    end_date: dbRequest.end_date,
    is_paid: dbRequest.is_paid,
    notes: dbRequest.notes,
    created_at: dbRequest.created_at,
    updated_at: dbRequest.updated_at,
    employee: dbRequest.employees ? {
      id: dbRequest.employees.id,
      full_name: dbRequest.employees.full_name,
      email: dbRequest.employees.email,
      avatar_url: dbRequest.employees.avatar_url
    } : undefined
  };
}

/**
 * Fetch all time off requests with employee details
 */
export async function fetchTimeOffRequests(): Promise<TimeOffRequest[]> {
  const { data: requests, error } = await supabase
    .from('time_off_requests')
    .select(`
      *,
      employees (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch time off requests: ${error.message}`);
  }

  return (requests || []).map(transformTimeOffRequest);
}

/**
 * Create a new time off request
 */
export async function createTimeOffRequest(request: Omit<TimeOffRequest, 'id' | 'created_at' | 'updated_at' | 'employee'>): Promise<TimeOffRequest> {
  const { data, error } = await supabase
    .from('time_off_requests')
    .insert({
      employee_id: request.employee_id,
      type: request.type,
      status: TimeOffRequestStatus.PENDING,
      start_date: request.start_date,
      end_date: request.end_date,
      is_paid: request.is_paid,
      notes: request.notes
    })
    .select(`
      *,
      employees (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create time off request: ${error.message}`);
  }

  return transformTimeOffRequest(data);
}

/**
 * Update an existing time off request
 */
export async function updateTimeOffRequest(id: string, updates: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
  const { data, error } = await supabase
    .from('time_off_requests')
    .update({
      type: updates.type,
      status: updates.status,
      start_date: updates.start_date,
      end_date: updates.end_date,
      is_paid: updates.is_paid,
      notes: updates.notes
    })
    .eq('id', id)
    .select(`
      *,
      employees (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update time off request: ${error.message}`);
  }

  return transformTimeOffRequest(data);
}

/**
 * Delete a time off request
 */
export async function deleteTimeOffRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('time_off_requests')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete time off request: ${error.message}`);
  }
} 