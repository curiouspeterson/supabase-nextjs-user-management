'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from 'react-error-boundary'
import { fetchHealthStatus, type HealthStatus, type HealthMetrics } from '@/services/health'

export interface UseHealthMonitorOptions {
  interval?: number
  onStatusChange?: (status: HealthStatus) => void
  onMetricsUpdate?: (metrics: HealthMetrics) => void
}

export function useHealthMonitor(options: UseHealthMonitorOptions = {}) {
  const { interval = 30000, onStatusChange, onMetricsUpdate } = options
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const { toast } = useToast()

  const checkHealth = useCallback(async () => {
    try {
      const { status: newStatus, metrics: newMetrics } = await fetchHealthStatus()
      
      setStatus(newStatus)
      setMetrics(newMetrics)
      
      onStatusChange?.(newStatus)
      onMetricsUpdate?.(newMetrics)

      if (newStatus.status === 'unhealthy') {
        toast({
          title: 'System Health Alert',
          description: newStatus.message || 'System is experiencing issues',
          variant: 'destructive'
        })
      } else if (newStatus.status === 'degraded') {
        toast({
          title: 'System Performance Warning',
          description: newStatus.message || 'System performance is degraded',
          variant: 'warning'
        })
      }
    } catch (error) {
      console.error('Health check failed:', error)
      showBoundary(error)
    }
  }, [onStatusChange, onMetricsUpdate, toast, showBoundary])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  useEffect(() => {
    if (!isMonitoring) return

    // Initial check
    checkHealth()

    const timer = setInterval(checkHealth, interval)

    return () => {
      clearInterval(timer)
    }
  }, [isMonitoring, interval, checkHealth])

  return {
    status,
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkHealth
  }
} 