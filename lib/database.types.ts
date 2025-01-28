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
      error_analytics_config: {
        Row: {
          id: string
          component: string
          max_contexts: number
          max_user_agents: number
          max_urls: number
          max_trends: number
          trend_period_ms: number
          retention_days: number
          batch_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          component: string
          max_contexts: number
          max_user_agents: number
          max_urls: number
          max_trends: number
          trend_period_ms: number
          retention_days: number
          batch_size: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          component?: string
          max_contexts?: number
          max_user_agents?: number
          max_urls?: number
          max_trends?: number
          trend_period_ms?: number
          retention_days?: number
          batch_size?: number
          created_at?: string
          updated_at?: string
        }
      }
      error_analytics_data: {
        Row: {
          id: string
          component: string
          error_type: string
          error_message: string
          context: Json
          user_agent: string | null
          url: string | null
          batch_id: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          component: string
          error_type: string
          error_message: string
          context: Json
          user_agent?: string | null
          url?: string | null
          batch_id: string
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          component?: string
          error_type?: string
          error_message?: string
          context?: Json
          user_agent?: string | null
          url?: string | null
          batch_id?: string
          timestamp?: string
          created_at?: string
        }
      }
      error_analytics_trends: {
        Row: {
          id: string
          component: string
          error_type: string
          count: number
          first_seen: string
          last_seen: string
          contexts: Json[]
          user_agents: string[]
          urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          component: string
          error_type: string
          count: number
          first_seen: string
          last_seen: string
          contexts: Json[]
          user_agents: string[]
          urls: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          component?: string
          error_type?: string
          count?: number
          first_seen?: string
          last_seen?: string
          contexts?: Json[]
          user_agents?: string[]
          urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
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
      error_analytics_storage: {
        Row: {
          id: string
          component: string
          storage_key: string
          data: string
          size_bytes: number
          last_accessed: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          component: string
          storage_key: string
          data: string
          size_bytes: number
          last_accessed?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          component?: string
          storage_key?: string
          data?: string
          size_bytes?: number
          last_accessed?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_error_analytics_batch: {
        Args: {
          p_batch_id: string
        }
        Returns: void
      }
      check_storage_quota_status: {
        Args: { p_component: string }
        Returns: { total_size_bytes: number; quota_bytes: number; usage_percent: number; is_quota_exceeded: boolean; last_checked: string }
      }
      cleanup_error_analytics_storage: {
        Args: { p_component: string; p_older_than_days: number }
        Returns: number
      }
      log_request: {
        Args: {
          p_level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
          p_message: string
          p_request_data: {
            method: string
            url: string
            headers?: Record<string, string>
            ip?: string
            userAgent?: string
          }
          p_user_data: {
            id: string
            email: string
            role: string
          } | null
          p_metadata?: Record<string, unknown>
        }
        Returns: void
      }
      get_error_analytics_data: {
        Args: {
          p_component: string
          p_storage_key: string
        }
        Returns: Array<{
          data: string
        }>
      }
      save_error_analytics_data: {
        Args: {
          p_component: string
          p_storage_key: string
          p_data: string
          p_size_bytes: number
        }
        Returns: void
      }
      get_error_http_code: {
        Args: {
          p_error_code: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
