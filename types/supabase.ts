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
        }
        Insert: {
          actual_coverage?: number
          coverage_status?: Database["public"]["Enums"]["coverage_status_enum"]
          created_at?: string
          date: string
          id?: string
          period_id: string
          updated_at?: string
        }
        Update: {
          actual_coverage?: number
          coverage_status?: Database["public"]["Enums"]["coverage_status_enum"]
          created_at?: string
          date?: string
          id?: string
          period_id?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_period_coverage: {
        Args: {
          p_date: string
          p_period_id: string
        }
        Returns: number
      }
      get_time_off_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          type: Database["public"]["Enums"]["time_off_type_enum"]
          status: Database["public"]["Enums"]["time_off_status_enum"]
          notes: string
          reviewed_by: string
          reviewed_at: string
          submitted_at: string
          created_at: string
          updated_at: string
          employee_email: string
          employee_full_name: string
          employee_role: Database["public"]["Enums"]["employee_role_enum"]
        }[]
      }
      validate_schedule_against_pattern: {
        Args: {
          p_employee_id: string
          p_date: string
        }
        Returns: boolean
      }
    }
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
    }
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

