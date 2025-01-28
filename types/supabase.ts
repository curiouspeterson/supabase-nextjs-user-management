export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_coverage: {
        Row: {
          actual_coverage: number
          coverage_status: Database["public"]["Enums"]["coverage_status_enum"]
          created_at: string
          date: string
          id: string
          period_id: string
          updated_at: string
          required_coverage: number
          supervisor_count: number
          overtime_hours: number
        }
        Insert: {
          actual_coverage?: number
          coverage_status?: Database["public"]["Enums"]["coverage_status_enum"]
          created_at?: string
          date: string
          id?: string
          period_id: string
          updated_at?: string
          required_coverage?: number
          supervisor_count?: number
          overtime_hours?: number
        }
        Update: {
          actual_coverage?: number
          coverage_status?: Database["public"]["Enums"]["coverage_status_enum"]
          created_at?: string
          date?: string
          id?: string
          period_id?: string
          updated_at?: string
          required_coverage?: number
          supervisor_count?: number
          overtime_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_coverage_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "staffing_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_patterns: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          pattern_id: string
          rotation_start_date: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          pattern_id: string
          rotation_start_date: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          pattern_id?: string
          rotation_start_date?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_patterns_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_patterns_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "shift_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          default_shift_type_id: string | null
          employee_role: Database["public"]["Enums"]["employee_role_enum"]
          id: string
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role_enum"]
          weekly_hours_scheduled: number | null
        }
        Insert: {
          created_at?: string
          default_shift_type_id?: string | null
          employee_role: Database["public"]["Enums"]["employee_role_enum"]
          id: string
          updated_at?: string
          user_role: Database["public"]["Enums"]["user_role_enum"]
          weekly_hours_scheduled?: number | null
        }
        Update: {
          created_at?: string
          default_shift_type_id?: string | null
          employee_role?: Database["public"]["Enums"]["employee_role_enum"]
          id?: string
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role_enum"]
          weekly_hours_scheduled?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_default_shift_type_id_fkey"
            columns: ["default_shift_type_id"]
            isOneToOne: false
            referencedRelation: "shift_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profile"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          id: string
          shift_id: string
          status: Database["public"]["Enums"]["schedule_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          employee_id: string
          id?: string
          shift_id: string
          status?: Database["public"]["Enums"]["schedule_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          shift_id?: string
          status?: Database["public"]["Enums"]["schedule_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_patterns: {
        Row: {
          created_at: string
          days_off: number
          days_on: number
          id: string
          name: string
          pattern_type: Database["public"]["Enums"]["shift_pattern_type_enum"]
          shift_duration: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_off: number
          days_on: number
          id?: string
          name: string
          pattern_type: Database["public"]["Enums"]["shift_pattern_type_enum"]
          shift_duration: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_off?: number
          days_on?: number
          id?: string
          name?: string
          pattern_type?: Database["public"]["Enums"]["shift_pattern_type_enum"]
          shift_duration?: number
          updated_at?: string
        }
        Relationships: []
      }
      shift_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          duration_category:
            | Database["public"]["Enums"]["duration_category_enum"]
            | null
          duration_hours: number
          end_time: string
          id: string
          shift_type_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_category?:
            | Database["public"]["Enums"]["duration_category_enum"]
            | null
          duration_hours: number
          end_time: string
          id?: string
          shift_type_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_category?:
            | Database["public"]["Enums"]["duration_category_enum"]
            | null
          duration_hours?: number
          end_time?: string
          id?: string
          shift_type_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_shift_type_id_fkey"
            columns: ["shift_type_id"]
            isOneToOne: false
            referencedRelation: "shift_types"
            referencedColumns: ["id"]
          },
        ]
      }
      staffing_requirements: {
        Row: {
          created_at: string
          end_time: string
          id: string
          minimum_employees: number
          period_name: string
          shift_supervisor_required: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          minimum_employees: number
          period_name: string
          shift_supervisor_required?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          minimum_employees?: number
          period_name?: string
          shift_supervisor_required?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["time_off_status_enum"]
          submitted_at: string
          type: Database["public"]["Enums"]["time_off_type_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["time_off_status_enum"]
          submitted_at?: string
          type: Database["public"]["Enums"]["time_off_type_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["time_off_status_enum"]
          submitted_at?: string
          type?: Database["public"]["Enums"]["time_off_type_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      scheduler_metrics: {
        Row: {
          id: string
          coverage_deficit: number
          overtime_violations: number
          pattern_errors: number
          schedule_generation_time: number
          last_run_status: 'success' | 'warning' | 'error'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coverage_deficit?: number
          overtime_violations?: number
          pattern_errors?: number
          schedule_generation_time?: number
          last_run_status?: 'success' | 'warning' | 'error'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coverage_deficit?: number
          overtime_violations?: number
          pattern_errors?: number
          schedule_generation_time?: number
          last_run_status?: 'success' | 'warning' | 'error'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
      begin_transaction: {
        Args: Record<string, never>
        Returns: void
      },
      commit_transaction: {
        Args: Record<string, never>
        Returns: void
      },
      rollback_transaction: {
        Args: Record<string, never>
        Returns: void
      },
      get_scheduler_config: {
        Args: {
          p_config_key: string
          p_environment?: string
        }
        Returns: {
          id: string
          config_key: string
          config_value: Json
          environment: string
          description: string | null
          created_at: string
          updated_at: string
        }
      },
      record_scheduler_metrics: {
        Args: {
          p_metrics_type: string
          p_metrics_value: Json
          p_environment?: string
          p_measured_at?: string
        }
        Returns: void
      },
      log_scheduler_error: {
        Args: {
          p_error_type: string
          p_error_message: string
          p_error_details: Json
        }
        Returns: string
      },
      process_error_analytics_batch: {
        Args: {
          p_batch_id: string
        }
        Returns: void
      },
      split_midnight_shift: {
        Args: {
          p_start_time: string
          p_end_time: string
          p_timezone?: string
        }
        Returns: Array<{
          segment_date: string
          hours: number
        }>
      },
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
      },
      cleanup_error_analytics_data: {
        Args: {
          p_component: string
        }
        Returns: void
      },
      calculate_period_coverage: {
        Args: {
          p_period_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          date: string
          required_coverage: number
          actual_coverage: number
          coverage_status: string
        }[]
      },
      get_error_http_code: {
        Args: {
          p_error_code: string
        }
        Returns: number
      },
      get_time_off_requests: {
        Args: {
          p_employee_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          type: string
          status: string
        }[]
      },
      validate_schedule_against_pattern: {
        Args: {
          p_employee_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          is_valid: boolean
          violations: string[]
        }
      },
      validate_shift_assignment: {
        Args: {
          p_employee_id: string
          p_shift_id: string
          p_date: string
        }
        Returns: {
          is_valid: boolean
          violations: string[]
          warnings: string[]
        }
      },
      log_auth_error: {
        Args: {
          p_user_id: string | null
          p_action: string
          p_error_code: string
          p_error_message: string
          p_ip_address: string
          p_user_agent: string
        }
        Returns: string
      },
      log_error_metrics: {
        Args: {
          p_component: string
          p_metrics: {
            errorCount: number
            lastError: Date | null
            recoveryAttempts: number
            successfulRecoveries: number
          }
          p_error_details: {
            name: string
            message: string
            stack?: string
          } | null
        }
        Returns: void
      },
      log_network_retry_metrics: {
        Args: {
          p_component: string
          p_endpoint: string
          p_metrics: {
            totalRetries: number
            successfulRetries: number
            failedRetries: number
            lastRetry: Date | null
            avgRetryDelay: number
            maxRetryDelay: number
          }
          p_retry_details: {
            lastAttemptSuccess: boolean
            lastRetryDelay: number
            strategy: 'LINEAR' | 'EXPONENTIAL' | 'FIBONACCI'
          }
        }
        Returns: void
      },
      get_user_profile: {
        Args: {
          p_user_id: string
        }
        Returns: Array<{
          id: string
          email: string
          role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
          full_name: string | null
          avatar_url: string | null
          metadata: Record<string, unknown>
          preferences: Record<string, unknown>
          last_active: string | null
          created_at: string
          updated_at: string
        }>
      },
      log_auth_event: {
        Args: {
          p_event_type: string
          p_user_id: string | null
          p_metadata: Record<string, unknown>
        }
        Returns: void
      },
      check_rate_limit: {
        Args: {
          p_key: string
          p_user_id: string | null
        }
        Returns: {
          is_allowed: boolean
          remaining_attempts: number
          reset_time: string
        }
      },
      get_rate_limit_metrics: {
        Args: {
          p_key: string
          p_user_id: string | null
          p_window_start: string
        }
        Returns: Array<{
          window_start: string
          request_count: number
          last_request: string | null
        }>
      },
      check_storage_quota_status: {
        Args: {
          p_component: string
        }
        Returns: {
          total_size_bytes: number
          quota_bytes: number
          usage_percent: number
          is_quota_exceeded: boolean
          last_checked: string
        }
      },
      cleanup_error_analytics_storage: {
        Args: {
          p_component: string
          p_older_than_days: number
        }
        Returns: number
      },
      get_error_analytics_data: {
        Args: {
          p_component: string
          p_storage_key: string
        }
        Returns: Array<{
          data: string
        }>
      },
      save_error_analytics_data: {
        Args: {
          p_component: string
          p_storage_key: string
          p_data: string
          p_size_bytes: number
        }
        Returns: void
      }
    },
    Enums: {
      coverage_status_enum: "Under" | "Met" | "Over"
      day_of_week_enum:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday"
      duration_category_enum: "4 hours" | "10 hours" | "12 hours"
      employee_role_enum: "Dispatcher" | "Shift Supervisor" | "Management"
      schedule_status_enum: "Draft" | "Published"
      shift_pattern_type_enum: "4x10" | "3x12_1x4" | "Custom"
      time_off_status_enum: "Pending" | "Approved" | "Declined"
      time_off_type_enum: "Vacation" | "Sick" | "Personal" | "Training"
      user_role_enum: "Employee" | "Manager" | "Admin"
    },
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

