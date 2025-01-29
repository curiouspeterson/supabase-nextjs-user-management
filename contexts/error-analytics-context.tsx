'use client'

import { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react'
import type { ErrorAnalyticsData } from '@/services/error-analytics'
import { ErrorAnalyticsService } from '@/lib/error-analytics'

interface ErrorAnalyticsContextType {
  isLoading: boolean
  error: Error | null
  logError: (data: ErrorAnalyticsData) => Promise<void>
  resolveError: (errorId: string, notes?: string) => Promise<void>
}

interface ErrorAnalyticsProviderProps {
  children: ReactNode
}

const ErrorAnalyticsContext = createContext<ErrorAnalyticsContextType | null>(null)

export const ErrorAnalyticsProvider = ({ children }: ErrorAnalyticsProviderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const initialized = useRef(false)

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

  // Initialize error analytics service only once
  useEffect(() => {
    if (!initialized.current) {
      const service = ErrorAnalyticsService.getInstance()
      service.initialize()
        .catch(error => {
          console.error('Failed to initialize error analytics:', error)
          setError(error instanceof Error ? error : new Error('Failed to initialize error analytics'))
        })
        .finally(() => {
          initialized.current = true
          setIsLoading(false)
        })
    }
  }, [])

  const value = {
    isLoading,
    error,
    logError,
    resolveError
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