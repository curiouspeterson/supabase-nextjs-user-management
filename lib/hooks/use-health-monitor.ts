import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from './use-error-boundary'
import type { HealthStatus, HealthMetrics } from '@/types/health'

interface UseHealthMonitorOptions {
  interval?: number
  onStatusChange?: (status: HealthStatus) => void
  onMetricsUpdate?: (metrics: HealthMetrics) => void
}

export function useHealthMonitor(options: UseHealthMonitorOptions = {}) {
  const { interval = 30000, onStatusChange, onMetricsUpdate } = options
  const [status, setStatus] = useState<HealthStatus>({
    status: 'healthy',
    message: 'System is healthy',
    timestamp: new Date().toISOString()
  })
  const [metrics, setMetrics] = useState<HealthMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    active_connections: 0,
    request_latency: 0,
    error_rate: 0
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const { toast } = useToast()
  const { handleError } = useErrorBoundary()

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()

      const newStatus = data.status as HealthStatus
      const newMetrics = data.metrics as HealthMetrics

      if (newStatus.status !== status.status) {
        setStatus(newStatus)
        onStatusChange?.(newStatus)

        if (newStatus.status !== 'healthy') {
          toast({
            title: 'System Status Change',
            description: newStatus.message,
            variant: newStatus.status === 'unhealthy' ? 'destructive' : 'default'
          })
        }
      }

      setMetrics(newMetrics)
      onMetricsUpdate?.(newMetrics)
    } catch (error) {
      handleError(error)
      const criticalStatus: HealthStatus = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Failed to check system health',
        timestamp: new Date().toISOString()
      }
      setStatus(criticalStatus)
      onStatusChange?.(criticalStatus)

      toast({
        title: 'Health Check Failed',
        description: criticalStatus.message,
        variant: 'destructive'
      })
    }
  }, [status, onStatusChange, onMetricsUpdate, toast, handleError])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  useEffect(() => {
    if (!isMonitoring) return

    checkHealth()
    const timer = setInterval(checkHealth, interval)

    return () => {
      clearInterval(timer)
    }
  }, [isMonitoring, checkHealth, interval])

  return {
    status,
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkHealth
  }
} 