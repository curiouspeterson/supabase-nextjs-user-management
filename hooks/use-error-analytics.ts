import { useCallback, useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { ErrorAnalyticsService } from '@/services/error-analytics'
import { z } from 'zod'

// Re-export types from the service
export type { ErrorSeverity } from '@/services/error-analytics'

// Hook return type
interface UseErrorAnalytics {
  isLoading: boolean
  error: Error | null
  logError: (data: z.infer<typeof ErrorAnalyticsData>) => Promise<void>
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

export function useErrorAnalytics(): UseErrorAnalytics {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { supabase, user } = useSupabase()
  const service = new ErrorAnalyticsService()

  const logError = useCallback(async (data: z.infer<typeof ErrorAnalyticsData>) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await service.logError({
        ...data,
        user_id: user?.id,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
      })

      if (!result.success) {
        throw new Error('Failed to log error')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const resolveError = useCallback(async (errorId: string, notes?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user?.id) {
        throw new Error('User must be authenticated to resolve errors')
      }

      const result = await service.resolveError(errorId, user.id, notes)

      if (!result.success) {
        throw new Error('Failed to resolve error')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const getErrorSummary = useCallback(async (options?: {
    environment?: string
    startDate?: Date
    endDate?: Date
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: orgData } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', user?.id)
        .single()

      if (!orgData?.org_id) {
        throw new Error('User must belong to an organization')
      }

      const result = await service.getErrorSummary(orgData.org_id, {
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
        ...options
      })

      if (!result.success) {
        throw new Error('Failed to get error summary')
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const getErrorTrends = useCallback(async (options?: {
    environment?: string
    component?: string
    errorType?: string
    startDate?: Date
    endDate?: Date
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: orgData } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', user?.id)
        .single()

      if (!orgData?.org_id) {
        throw new Error('User must belong to an organization')
      }

      const result = await service.getErrorTrends(orgData.org_id, {
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
        ...options
      })

      if (!result.success) {
        throw new Error('Failed to get error trends')
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  return {
    isLoading,
    error,
    logError,
    resolveError,
    getErrorSummary,
    getErrorTrends
  }
} 