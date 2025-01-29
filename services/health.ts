import { createClient } from '@/lib/supabase/client'
import type { HealthStatus, HealthMetrics, HealthCheckConfig } from '@/types/health'
import { isServer } from '@/utils/env'

export async function fetchHealthStatus(): Promise<{
  status: HealthStatus
  metrics: HealthMetrics
}> {
  // Return degraded status during SSR
  if (isServer()) {
    return {
      status: {
        status: 'unknown',
        message: 'Health check not available during SSR',
        timestamp: new Date().toISOString()
      },
      metrics: {
        cpu_usage: 0,
        memory_usage: 0,
        active_connections: 0,
        request_latency: 0,
        error_rate: 0
      }
    }
  }

  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('system_health')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return {
      status: {
        status: data.status,
        message: data.message,
        timestamp: data.created_at
      },
      metrics: {
        cpu_usage: data.cpu_usage,
        memory_usage: data.memory_usage,
        active_connections: data.active_connections,
        request_latency: data.request_latency,
        error_rate: data.error_rate
      }
    }
  } catch (error) {
    console.error('Error fetching health status:', error)
    return {
      status: {
        status: 'unhealthy',
        message: 'Failed to fetch health status',
        timestamp: new Date().toISOString()
      },
      metrics: {
        cpu_usage: 0,
        memory_usage: 0,
        active_connections: 0,
        request_latency: 0,
        error_rate: 0
      }
    }
  }
}

export async function getHealthCheckConfig(configId: string): Promise<HealthCheckConfig | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('health_check_config')
      .select('*')
      .eq('id', configId)
      .single()

    if (error) throw error
    
    return data as HealthCheckConfig
  } catch (error) {
    console.error('Error fetching health check config:', error)
    return null
  }
}

export async function getHealthCheckConfigs(organizationId: string): Promise<HealthCheckConfig[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('health_check_config')
      .select('*')
      .eq('organization_id', organizationId)
      .order('check_name', { ascending: true })

    if (error) throw error
    
    return data as HealthCheckConfig[]
  } catch (error) {
    console.error('Error fetching health check configs:', error)
    return []
  }
}

export async function updateHealthCheckConfig(
  configId: string,
  updates: Partial<HealthCheckConfig>
): Promise<HealthCheckConfig | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('health_check_config')
      .update(updates)
      .eq('id', configId)
      .select()
      .single()

    if (error) throw error
    
    return data as HealthCheckConfig
  } catch (error) {
    console.error('Error updating health check config:', error)
    return null
  }
}

export async function getHealthMetricsHistory(
  startDate: Date,
  endDate: Date
): Promise<HealthMetrics[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_metrics_history', {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_interval: '1 hour'
    })

  if (error) {
    throw new Error('Failed to fetch health metrics history')
  }

  type MetricRecord = {
    metrics: {
      cpu_usage?: number
      memory_usage?: number
      active_connections?: number
      response_time?: number
      error_rate?: number
    }
  }

  return data.map((metric: MetricRecord) => ({
    cpu_usage: metric.metrics.cpu_usage || 0,
    memory_usage: metric.metrics.memory_usage || 0,
    active_connections: metric.metrics.active_connections || 0,
    request_latency: metric.metrics.response_time || 0,
    error_rate: metric.metrics.error_rate || 0
  }))
}

export async function triggerHealthCheck(configId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .rpc('trigger_health_check', {
      p_config_id: configId
    })

  if (error) {
    throw new Error('Failed to trigger health check')
  }
} 