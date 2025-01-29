export interface TimeOffRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  employee: {
    full_name: string
  }
} 