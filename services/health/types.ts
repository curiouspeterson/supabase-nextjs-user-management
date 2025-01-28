import type { Database } from '@/types/supabase'

export type SystemStatus = {
  status: 'healthy' | 'degraded' | 'unhealthy'
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

export type HealthResponse = {
  status: SystemStatus
  metrics: HealthMetrics
}

export type SchedulerMetrics = Database['public']['Tables']['scheduler_metrics']['Row'] 