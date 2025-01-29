'use client'

import { ErrorAnalyticsProvider } from '@/contexts/error-analytics-context'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense, PropsWithChildren, useEffect, useState } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { createSupabaseClient } from '@/lib/supabase/client'

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export default function Providers({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Supabase client
        createSupabaseClient()
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to initialize app:', err)
        setError(err instanceof Error ? err : new Error('Failed to initialize app'))
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Initializing Application
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        // Only log client-side errors
        if (typeof window !== 'undefined') {
          console.error('Caught in boundary:', error)
        }
      }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <ErrorAnalyticsProvider>
          {children}
        </ErrorAnalyticsProvider>
      </Suspense>
    </ErrorBoundary>
  )
}

export function ErrorBoundaryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log to your error reporting service
        console.error('Error boundary caught an error:', error, info)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
