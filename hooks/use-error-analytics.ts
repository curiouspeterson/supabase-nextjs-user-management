'use client'

import { useCallback, useState } from 'react'
import { useAuth } from '@/lib/auth/hooks'
import { ErrorAnalyticsService } from '@/lib/error-analytics'
import type { ErrorContext } from '@/lib/error-analytics'

// Re-export types from the service
export type { ErrorSeverity } from '@/lib/types/error'

// Hook return type
interface UseErrorAnalytics {
  isLoading: boolean
  error: Error | null
  trackError: (error: Error, context?: ErrorContext) => Promise<void>
  resolveError: (errorId: string, notes?: string) => Promise<void>
  getTrends: (options?: {
    startDate?: Date
    endDate?: Date
  }) => Promise<any>
}

export function useErrorAnalytics(): UseErrorAnalytics {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const service = ErrorAnalyticsService.getInstance()

  const trackError = useCallback(async (error: Error, context?: ErrorContext) => {
    try {
      setIsLoading(true)
      setError(null)

      await service.trackError(error, {
        ...context,
        component: context?.component || 'default',
        browserInfo: {
          ...context?.browserInfo,
          userAgent: window.navigator?.userAgent,
          url: window.location?.href,
          timestamp: new Date().toISOString()
        }
      })
    } catch (err) {
      console.error('Failed to track error:', err)
      setError(err instanceof Error ? err : new Error('Failed to track error'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const resolveError = useCallback(async (errorId: string, notes?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user?.id) {
        throw new Error('User must be authenticated to resolve errors')
      }

      await service.resolveError(errorId, notes)
    } catch (err) {
      console.error('Failed to resolve error:', err)
      setError(err instanceof Error ? err : new Error('Failed to resolve error'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, service])

  const getTrends = useCallback(async (options?: {
    startDate?: Date
    endDate?: Date
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      return await service.getTrends(options?.startDate, options?.endDate)
    } catch (err) {
      console.error('Failed to get error trends:', err)
      setError(err instanceof Error ? err : new Error('Failed to get error trends'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [service])

  return {
    isLoading,
    error,
    trackError,
    resolveError,
    getTrends
  }
} 