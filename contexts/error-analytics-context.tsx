'use client'

import { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react'
import { useErrorAnalytics } from '@/hooks/use-error-analytics'
import type { ErrorAnalyticsData, ErrorSeverity } from '@/services/error-analytics'
import { ErrorAnalyticsService } from '@/lib/error-analytics'
import { createClient } from '@/lib/supabase/client'

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

const ErrorAnalyticsContext = createContext<ErrorAnalyticsContextType | null>(null)

export const ErrorAnalyticsProvider = ({ children }) => {
  const errorAnalytics = useErrorAnalytics()
  const initialized = useRef(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize error analytics service only once
  useEffect(() => {
    if (!initialized.current) {
      setIsInitializing(true)
      const service = ErrorAnalyticsService.getInstance()
      service.initialize()
        .catch(error => {
          console.error('Failed to initialize error analytics:', error)
        })
        .finally(() => {
          initialized.current = true
          setIsInitializing(false)
        })
    }
  }, [])

  if (isInitializing) {
    return null // Or a loading spinner
  }

  return (
    <ErrorAnalyticsContext.Provider value={errorAnalytics}>
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