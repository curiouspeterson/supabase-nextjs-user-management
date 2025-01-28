import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from './use-error-boundary'
import type { HealthStatus, HealthMetrics } from '@/types'

interface UseHealthMonitorOptions {
  interval?: number
  onStatusChange?: (status: HealthStatus) => void
  onMetricsUpdate?: (metrics: HealthMetrics) => void
}

export function useHealthMonitor(options: UseHealthMonitorOptions = {}) {
  const { interval = 30000, onStatusChange, onMetricsUpdate } = options
  const [status, setStatus] = useState<HealthStatus>('HEALTHY')
  const [metrics, setMetrics] = useState<HealthMetrics>({
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    cpuUsage: 0,
    memoryUsage: 0
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

      if (newStatus !== status) {
        setStatus(newStatus)
        onStatusChange?.(newStatus)

        if (newStatus !== 'HEALTHY') {
          toast({
            title: 'System Status Change',
            description: `System status is now ${newStatus.toLowerCase()}`,
            variant: newStatus === 'CRITICAL' ? 'destructive' : 'default'
          })
        }
      }

      setMetrics(newMetrics)
      onMetricsUpdate?.(newMetrics)
    } catch (error) {
      handleError(error)
      setStatus('CRITICAL')
      onStatusChange?.('CRITICAL')

      toast({
        title: 'Health Check Failed',
        description: error instanceof Error ? error.message : 'Failed to check system health',
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