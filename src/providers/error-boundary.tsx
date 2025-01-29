'use client'

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { ErrorFallback } from '@/components/error-fallback'
import { useLogError } from '@/contexts/error-analytics-context'

interface ErrorBoundaryProviderProps {
  children: React.ReactNode
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const logError = useLogError()

  const handleError = (error: Error, info: { componentStack: string }) => {
    // Log to error analytics service
    logError(error, {
      severity: 'high',
      component: info.componentStack,
      metadata: {
        componentStack: info.componentStack,
      }
    }).catch(e => {
      // Fallback to console if error analytics fails
      console.error('Failed to log error to analytics:', e)
      console.error('Original error:', error)
      console.error('Component stack:', info.componentStack)
    })
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset the state of your app here
        window.location.reload()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}