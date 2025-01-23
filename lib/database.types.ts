export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      time_off_requests: {
        Row: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          type: 'Vacation' | 'Sick' | 'Personal' | 'Training'
          status: 'Pending' | 'Approved' | 'Declined'
          notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_date: string
          end_date: string
          type: 'Vacation' | 'Sick' | 'Personal' | 'Training'
          status?: 'Pending' | 'Approved' | 'Declined'
          notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          type?: 'Vacation' | 'Sick' | 'Personal' | 'Training'
          status?: 'Pending' | 'Approved' | 'Declined'
          notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
