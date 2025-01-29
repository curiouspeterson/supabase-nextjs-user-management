'use client'

import { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react'
import type { ErrorAnalyticsData, ErrorSeverity } from '@/services/error-analytics'
import { ErrorAnalyticsService } from '@/lib/error-analytics'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface ErrorAnalyticsContextType {
  isLoading: boolean
  error: Error | null
  logError: (data: ErrorAnalyticsData) => Promise<void>
  resolveError: (errorId: string, notes?: string) => Promise<void>
  getErrorSummary: (options?: {
    environment?: string
    startDate?: Date
    endDate?: Date
  }) => Promise<any>
  getErrorTrends: (options?: {
    environment?: string
    component?: string
    errorType?: string
    startDate?: Date
    endDate?: Date
  }) => Promise<any>
}

interface ErrorAnalyticsProviderProps {
  children: ReactNode
}

const ErrorAnalyticsContext = createContext<ErrorAnalyticsContextType | null>(null)

export const ErrorAnalyticsProvider = ({ children }: ErrorAnalyticsProviderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const initialized = useRef(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const logError = async (data: ErrorAnalyticsData) => {
    try {
      const service = ErrorAnalyticsService.getInstance()
      await service.logError(data)
    } catch (e) {
      console.error('Failed to log error:', e)
      setError(e instanceof Error ? e : new Error('Failed to log error'))
    }
  }

  const resolveError = async (errorId: string, notes?: string) => {
    try {
      const service = ErrorAnalyticsService.getInstance()
      await service.resolveError(errorId, notes)
    } catch (e) {
      console.error('Failed to resolve error:', e)
      setError(e instanceof Error ? e : new Error('Failed to resolve error'))
    }
  }

  const getErrorSummary = async (options?: {
    environment?: string
    startDate?: Date
    endDate?: Date
  }) => {
    try {
      const service = ErrorAnalyticsService.getInstance()
      return await service.getErrorSummary(options)
    } catch (e) {
      console.error('Failed to get error summary:', e)
      setError(e instanceof Error ? e : new Error('Failed to get error summary'))
      return null
    }
  }

  const getErrorTrends = async (options?: {
    environment?: string
    component?: string
    errorType?: string
    startDate?: Date
    endDate?: Date
  }) => {
    try {
      const service = ErrorAnalyticsService.getInstance()
      return await service.getErrorTrends(options)
    } catch (e) {
      console.error('Failed to get error trends:', e)
      setError(e instanceof Error ? e : new Error('Failed to get error trends'))
      return null
    }
  }

  // Initialize error analytics service only once
  useEffect(() => {
    if (!initialized.current) {
      setIsInitializing(true)
      const service = ErrorAnalyticsService.getInstance()
      service.initialize()
        .catch(error => {
          console.error('Failed to initialize error analytics:', error)
          setError(error instanceof Error ? error : new Error('Failed to initialize error analytics'))
        })
        .finally(() => {
          initialized.current = true
          setIsInitializing(false)
          setIsLoading(false)
        })
    }
  }, [])

  if (isInitializing) {
    return null // Or a loading spinner
  }

  const value = {
    isLoading,
    error,
    logError,
    resolveError,
    getErrorSummary,
    getErrorTrends
  }

  return (
    <ErrorAnalyticsContext.Provider value={value}>
      {children}
    </ErrorAnalyticsContext.Provider>
  )
}

export function useErrorAnalyticsContext() {
  const context = useContext(ErrorAnalyticsContext)
  if (!context) {
    throw new Error('useErrorAnalyticsContext must be used within an ErrorAnalyticsProvider')
  }
  return context
}

// Utility function for logging errors with default severity
export function useLogError() {
  const { logError } = useErrorAnalyticsContext()

  return async (
    error: Error | string,
    options?: {
      severity?: ErrorSeverity
      component?: string
      metadata?: Record<string, unknown>
    }
  ) => {
    const errorMessage = error instanceof Error ? error.message : error
    const stackTrace = error instanceof Error ? error.stack : undefined

    await logError({
      error_type: error instanceof Error ? error.name : 'CustomError',
      message: errorMessage,
      severity: options?.severity || 'medium',
      component: options?.component,
      stack_trace: stackTrace,
      metadata: options?.metadata,
    })
  }
} 