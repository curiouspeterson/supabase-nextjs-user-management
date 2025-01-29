'use client'

import { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react'
import type { ErrorAnalyticsData } from '@/services/error-analytics'
import { ErrorAnalyticsService } from '@/lib/error-analytics'
import type { PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface ErrorAnalyticsContextType {
  isLoading: boolean
  error: Error | null
  logError: (data: ErrorAnalyticsData) => Promise<void>
  resolveError: (errorId: string, notes?: string) => Promise<void>
}

const ErrorAnalyticsContext = createContext<ErrorAnalyticsContextType | null>(null)

const DEFAULT_CONFIG = {
  component: 'default',
  max_contexts: 100,
  max_user_agents: 50,
  max_urls: 100,
  max_trends: 1000,
  trend_period_ms: 3600000,
  retention_days: 30,
  batch_size: 50
} as const

export function ErrorAnalyticsProvider({ children }: { children: ReactNode }) {
  // Move all hooks to the top level
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [service, setService] = useState<ErrorAnalyticsService | null>(null)
  const initialized = useRef(false)
  const mounted = useRef(false)

  // Handle mounting
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Initialize service
  useEffect(() => {
    if (!mounted.current || initialized.current) return

    async function initService() {
      try {
        const supabase = createClient()
        const newService = ErrorAnalyticsService.getInstance()
        await newService.initialize()

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (session && mounted.current) {
          try {
            await supabase
              .from('error_analytics_config')
              .upsert(DEFAULT_CONFIG, {
                onConflict: 'component',
                ignoreDuplicates: true
              })
          } catch (configError) {
            console.warn('Error analytics config issue:', configError)
          }
        }

        if (mounted.current) {
          setService(newService)
          initialized.current = true
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to initialize error analytics:', error)
        if (mounted.current) {
          setError(error instanceof Error ? error : new Error('Failed to initialize error analytics'))
          setIsLoading(false)
        }
      }
    }

    initService()
  }, []) // Empty dependency array since we use refs for mounted state

  const logError = async (data: ErrorAnalyticsData) => {
    if (!service) {
      console.warn('Error analytics service not initialized')
      return
    }

    try {
      await service.trackError(data)
    } catch (e) {
      console.error('Failed to log error:', e)
      setError(e instanceof Error ? e : new Error('Failed to log error'))
    }
  }

  const resolveError = async (errorId: string, notes?: string) => {
    if (!service) {
      console.warn('Error analytics service not initialized')
      return
    }

    try {
      await service.resolveError(errorId, notes)
    } catch (e) {
      console.error('Failed to resolve error:', e)
      setError(e instanceof Error ? e : new Error('Failed to resolve error'))
    }
  }

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