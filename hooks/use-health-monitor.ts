'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useErrorBoundary } from 'react-error-boundary'
import type { SystemStatus, HealthMetrics, HealthResponse } from '@/services/health/types'

export interface UseHealthMonitorOptions {
  interval?: number
  onStatusChange?: (status: SystemStatus) => void
  onMetricsUpdate?: (metrics: HealthMetrics) => void
  onError?: (error: Error) => void
}

export type ErrorContext = {
  module: string
  action: string
  details?: Record<string, unknown>
}

export function useHealthMonitor(options: UseHealthMonitorOptions = {}) {
  const { interval = 30000, onStatusChange, onMetricsUpdate, onError } = options
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const { toast } = useToast()

  const trackError = useCallback(async (module: string, action: string, details?: Record<string, unknown>) => {
    const errorContext: ErrorContext = {
      module,
      action,
      details
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorContext)
    }

    try {
      // Send error to backend
      const response = await fetch('/api/scheduler/health/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorContext)
      })

      if (!response.ok) {
        throw new Error('Failed to track error')
      }

      // Update metrics to reflect the error
      setMetrics(prev => prev ? {
        ...prev,
        error_rate: prev.error_rate + 1,
        request_latency: prev.request_latency + 100 // Increase latency when error occurs
      } : null)

      // Notify error handler if provided
      onError?.(new Error(`${module}/${action} failed`))

    } catch (error) {
      console.error('Failed to track error:', error)
      showBoundary(error)
    }
  }, [onError, showBoundary])

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/scheduler/health')
      if (!response.ok) {
        throw new Error('Health check failed')
      }
      
      const data = (await response.json()) as HealthResponse
      
      setStatus(data.status)
      setMetrics(data.metrics)
      
      onStatusChange?.(data.status)
      onMetricsUpdate?.(data.metrics)

      if (data.status.status === 'unhealthy') {
        toast({
          title: 'System Health Alert',
          description: data.status.message || 'System is experiencing issues',
          variant: 'destructive'
        })
        await trackError('HEALTH', 'SYSTEM_UNHEALTHY', { status: data.status })
      } else if (data.status.status === 'degraded') {
        toast({
          title: 'System Performance Warning',
          description: data.status.message || 'System performance is degraded',
          variant: 'default'
        })
        await trackError('HEALTH', 'SYSTEM_DEGRADED', { status: data.status })
      }
    } catch (error) {
      console.error('Health check failed:', error)
      await trackError('HEALTH', 'CHECK_FAILED', { error: error instanceof Error ? error.message : 'Unknown error' })
      showBoundary(error)
    }
  }, [onStatusChange, onMetricsUpdate, toast, showBoundary, trackError])

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
    checkHealth,
    trackError
  }
} 