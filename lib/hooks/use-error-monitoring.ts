'use client'

import { useState, useCallback, useEffect } from 'react'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { useNetworkError } from '@/lib/hooks/use-network-error'
import { rateLimiter } from '@/lib/rate-limiter'
import { errorAnalytics, AnalyticsError } from '@/lib/error-analytics'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory, ErrorRecoveryStrategy } from '@/lib/types/error'

interface ErrorState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

interface MonitorConfig {
  maxRetries?: number
  rateLimitKey?: string
  onError?: (error: Error) => void
  onRetry?: (attempt: number) => void
  onMaxRetriesReached?: () => void
}

export function useErrorMonitoring(componentName: string, config: MonitorConfig = {}) {
  const [state, setState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  })
  
  const { handleError } = useErrorHandler()
  const { wrapWithRetry } = useNetworkError({
    maxRetries: config.maxRetries,
    onRetryAttempt: config.onRetry,
    onMaxRetriesReached: config.onMaxRetriesReached
  })

  const clearError = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      retryCount: 0
    })
  }, [])

  const monitorError = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string = 'unknown'
  ): Promise<T> => {
    // Helper function to transform AppError to AnalyticsError
    const transformError = (error: AppError, context: string): AnalyticsError => {
      return {
        ...error,
        severity: error.severity || ErrorSeverity.HIGH,
        category: error.category || ErrorCategory.UNKNOWN,
        metadata: {
          component: componentName,
          context,
          timestamp: new Date().toISOString(),
          ...error
        },
        recoveryStrategy: error.recoveryStrategy || ErrorRecoveryStrategy.RETRY
      }
    }

    try {
      // Check rate limit if key provided
      if (config.rateLimitKey) {
        await rateLimiter.checkLimit(config.rateLimitKey)
      }

      // Wrap operation with retry for network errors
      const result = await wrapWithRetry(operation)

      // Clear error state on success
      clearError()
      
      return result
    } catch (error) {
      // Track error metrics
      if (error instanceof AppError) {
        const analyticsError = transformError(error, context)
        errorAnalytics.trackError(analyticsError)
      }

      // Update error state
      setState(prev => ({
        hasError: true,
        error: error as Error,
        retryCount: prev.retryCount + 1
      }))

      // Call error handlers
      handleError(error, `${componentName}.${context}`)
      config.onError?.(error as Error)

      throw error
    }
  }, [componentName, config, wrapWithRetry, handleError, clearError])

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
    clearError,
    monitorError
  }
} 