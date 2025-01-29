'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useErrorAnalytics } from '@/hooks/use-error-analytics'
import type { ErrorAnalyticsData, ErrorSeverity } from '@/services/error-analytics'

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

export function ErrorAnalyticsProvider({ children }: { children: ReactNode }) {
  const errorAnalytics = useErrorAnalytics()

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