import type { HealthMetrics } from './types'

export async function fetchMetricsHistory(days: number = 7): Promise<{
  labels: string[]
  datasets: {
    cpu: number[]
    memory: number[]
    connections: number[]
    latency: number[]
    errors: number[]
  }
}> {
  const response = await fetch('/api/scheduler/health/history?days=' + days)
  if (!response.ok) {
    throw new Error('Failed to fetch metrics history')
  }
  
  const data = await response.json()
  return {
    labels: data.timestamps,
    datasets: {
      cpu: data.metrics.map((m: HealthMetrics) => m.cpu_usage),
      memory: data.metrics.map((m: HealthMetrics) => m.memory_usage),
      connections: data.metrics.map((m: HealthMetrics) => m.active_connections),
      latency: data.metrics.map((m: HealthMetrics) => m.request_latency),
      errors: data.metrics.map((m: HealthMetrics) => m.error_rate),
    }
  }
}

export * from './types' 