/**
 * Health-related type definitions
 */

export type HealthStatus = {
  status: 'healthy' | 'unhealthy' | 'degraded'
  message: string
  timestamp: string
}

export type HealthMetrics = {
  cpu_usage: number
  memory_usage: number
  active_connections: number
  request_latency: number
  error_rate: number
}

export type HealthCheckConfig = {
  id: string
  organization_id: string
  check_name: string
  check_type: 'http' | 'tcp' | 'custom'
  endpoint_url?: string
  interval_seconds: number
  timeout_seconds: number
  expected_status_code?: number
  headers?: Record<string, string>
  custom_script?: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_check_at?: string
  last_check_status?: 'success' | 'failure'
  last_check_message?: string
  notification_channels?: string[]
  retry_count?: number
  retry_delay_seconds?: number
} 