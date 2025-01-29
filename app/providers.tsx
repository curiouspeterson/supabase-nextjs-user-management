'use client'

import { ErrorAnalyticsProvider } from '@/contexts/error-analytics-context'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import { ErrorFallback } from '@/components/error-fallback'

export function Providers({ children }: { children: React.ReactNode }) {
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
      <Suspense fallback={<div>Loading...</div>}>
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
