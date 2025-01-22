export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          employee_role: 'Dispatcher' | 'Shift Supervisor' | 'Management'
          user_role: 'Employee' | 'Manager' | 'Admin'
          weekly_hours_scheduled: number
        }
        Insert: {
          id: string
          employee_role: 'Dispatcher' | 'Shift Supervisor' | 'Management'
          user_role: 'Employee' | 'Manager' | 'Admin'
          weekly_hours_scheduled?: number
        }
        Update: {
          id?: string
          employee_role?: 'Dispatcher' | 'Shift Supervisor' | 'Management'
          user_role?: 'Employee' | 'Manager' | 'Admin'
          weekly_hours_scheduled?: number
        }
      }
      shifts: {
        Row: {
          id: string
          shift_name: string
          start_time: string
          end_time: string
          duration_hours: number
        }
        Insert: {
          id?: string
          shift_name: string
          start_time: string
          end_time: string
          duration_hours: number
        }
        Update: {
          id?: string
          shift_name?: string
          start_time?: string
          end_time?: string
          duration_hours?: number
        }
      }
      schedules: {
        Row: {
          id: string
          week_start_date: string
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
          shift_id: string
          employee_id: string
          schedule_status: 'Draft' | 'Published'
        }
        Insert: {
          id?: string
          week_start_date: string
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
          shift_id: string
          employee_id: string
          schedule_status?: 'Draft' | 'Published'
        }
        Update: {
          id?: string
          week_start_date?: string
          day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
          shift_id?: string
          employee_id?: string
          schedule_status?: 'Draft' | 'Published'
        }
      }
      time_off_requests: {
        Row: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          reason: string | null
          status: 'Pending' | 'Approved' | 'Denied'
          request_date: string
          manager_notes: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          start_date: string
          end_date: string
          reason?: string | null
          status?: 'Pending' | 'Approved' | 'Denied'
          request_date?: string
          manager_notes?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          status?: 'Pending' | 'Approved' | 'Denied'
          request_date?: string
          manager_notes?: string | null
        }
      }
      staffing_requirements: {
        Row: {
          id: string
          period_name: string
          start_time: string
          end_time: string
          minimum_employees: number
        }
        Insert: {
          id?: string
          period_name: string
          start_time: string
          end_time: string
          minimum_employees: number
        }
        Update: {
          id?: string
          period_name?: string
          start_time?: string
          end_time?: string
          minimum_employees?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

