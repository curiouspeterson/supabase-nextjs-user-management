import type { Database } from '@/types/supabase';

export enum TimeOffRequestType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  BEREAVEMENT = 'BEREAVEMENT',
  JURY_DUTY = 'JURY_DUTY',
  UNPAID = 'UNPAID'
}

export enum TimeOffRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface TimeOffRequestEmployee {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  type: TimeOffRequestType;
  status: TimeOffRequestStatus;
  start_date: string;
  end_date: string;
  is_paid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: TimeOffRequestEmployee;
}

export type TimeOffRequestInput = Omit<
  TimeOffRequest,
  'id' | 'status' | 'created_at' | 'updated_at' | 'employee'
>;

export type TimeOffRequestUpdateInput = Partial<TimeOffRequestInput> & {
  status?: TimeOffRequestStatus;
};

export type TimeOffRequestWithEmployee = TimeOffRequest & {
  employee: TimeOffRequestEmployee;
};

// Database types
export type DbTimeOffRequest = Database['public']['Tables']['time_off_requests']['Row'];
export type DbTimeOffRequestInsert = Database['public']['Tables']['time_off_requests']['Insert'];
export type DbTimeOffRequestUpdate = Database['public']['Tables']['time_off_requests']['Update']; 