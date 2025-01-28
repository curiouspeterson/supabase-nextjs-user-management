'use client'

import { useState, useCallback, useEffect } from 'react'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { useNetworkError } from '@/lib/hooks/use-network-error'
import { rateLimiter } from '@/lib/rate-limiter'
import { errorAnalytics, AnalyticsError } from '@/lib/error-analytics'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory, ErrorRecoveryStrategy } from '@/lib/types/error'
import { createClient } from '@/utils/supabase/client'

interface ErrorState {
  hasError: boolean
  error: Error | null
  retryCount: number
  lastErrorTime: Date | null
}

interface MonitorConfig {
  maxRetries: number
  rateLimitKey: string
  onError?: (error: Error) => void
  onRetry?: (attempt: number) => void
  onMaxRetriesReached?: () => void
  errorSeverityOverride?: ErrorSeverity
  errorCategoryOverride?: ErrorCategory
  recoveryStrategyOverride?: ErrorRecoveryStrategy
}

const DEFAULT_CONFIG: Partial<MonitorConfig> = {
  maxRetries: 3,
  rateLimitKey: 'default',
}

interface ErrorMetrics {
  errorCount: number
  lastError: Date | null
  recoveryAttempts: number
  successfulRecoveries: number
}

export function useErrorMonitoring(
  componentName: string,
  config: Partial<MonitorConfig>
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config } as MonitorConfig
  const supabase = createClient()

  const [state, setState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0,
    lastErrorTime: null,
  })

  const [metrics, setMetrics] = useState<ErrorMetrics>({
    errorCount: 0,
    lastError: null,
    recoveryAttempts: 0,
    successfulRecoveries: 0,
  })
  
  const { handleError } = useErrorHandler()
  const { wrapWithRetry } = useNetworkError({
    maxRetries: mergedConfig.maxRetries,
    onRetryAttempt: mergedConfig.onRetry,
    onMaxRetriesReached: mergedConfig.onMaxRetriesReached,
  })

  const clearError = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      retryCount: 0,
      lastErrorTime: null,
    })
  }, [])

  const updateMetrics = useCallback(async (
    error: Error | null,
    recovered: boolean = false
  ) => {
    const newMetrics = {
      ...metrics,
      errorCount: error ? metrics.errorCount + 1 : metrics.errorCount,
      lastError: error ? new Date() : metrics.lastError,
      recoveryAttempts: error ? metrics.recoveryAttempts + 1 : metrics.recoveryAttempts,
      successfulRecoveries: recovered ? metrics.successfulRecoveries + 1 : metrics.successfulRecoveries,
    }
    
    setMetrics(newMetrics)

    try {
      // Log metrics to database
      await supabase.rpc('log_error_metrics', {
        p_component: componentName,
        p_metrics: newMetrics,
        p_error_details: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : null,
      })
    } catch (logError) {
      console.error('Failed to log error metrics:', logError)
    }
  }, [metrics, componentName, supabase])

  const isAppError = (error: any): error is AppError => {
    return error instanceof AppError
  }

  const transformError = useCallback((
    error: Error,
    context: string
  ): AnalyticsError => {
    const baseError = {
      severity: mergedConfig.errorSeverityOverride || ErrorSeverity.HIGH,
      category: mergedConfig.errorCategoryOverride || ErrorCategory.UNKNOWN,
      recoveryStrategy: mergedConfig.recoveryStrategyOverride || ErrorRecoveryStrategy.RETRY,
      metadata: {
        component: componentName,
        context,
        timestamp: new Date().toISOString(),
      },
    }

    if (isAppError(error)) {
      return {
        ...error,
        ...baseError,
        severity: error.severity || baseError.severity,
        category: error.category || baseError.category,
        recoveryStrategy: error.recoveryStrategy || baseError.recoveryStrategy,
        metadata: {
          ...baseError.metadata,
          ...error,
        },
      }
    }

    return {
      ...error,
      ...baseError,
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: 'ERROR_MONITORING_FAILED',
      statusCode: 500,
      shouldLog: true
    }
  }, [componentName, mergedConfig])

  const monitorError = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string = 'unknown'
  ): Promise<T> => {
    try {
      // Check rate limit
      await rateLimiter.checkLimit(mergedConfig.rateLimitKey)

      // Wrap operation with retry for network errors
      const result = await wrapWithRetry(operation)

      // Update metrics on success
      if (state.hasError) {
        await updateMetrics(null, true)
      }

      // Clear error state on success
      clearError()
      
      return result
    } catch (error) {
      const transformedError = transformError(error as Error, context)
      
      // Track error analytics
      errorAnalytics.trackError(transformedError)

      // Update error state
      setState(prev => ({
        hasError: true,
        error: error as Error,
        retryCount: prev.retryCount + 1,
        lastErrorTime: new Date(),
      }))

      // Update metrics
      await updateMetrics(error as Error)

      // Call error handlers
      handleError(error, `${componentName}.${context}`)
      mergedConfig.onError?.(error as Error)

      throw error
    }
  }, [
    componentName,
    mergedConfig,
    wrapWithRetry,
    handleError,
    clearError,
    transformError,
    updateMetrics,
    state.hasError,
  ])

  // Clear error state on unmount
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  return {
    hasError: state.hasError,
    error: state.error,
    retryCount: state.retryCount,
    lastErrorTime: state.lastErrorTime,
    metrics,
    clearError,
    monitorError,
  }
} 