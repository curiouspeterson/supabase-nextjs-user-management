'use client'

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { ErrorFallback } from '@/components/error-fallback'
import { useErrorAnalyticsContext } from '@/contexts/error-analytics-context'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function AppErrorBoundary({ children }: ErrorBoundaryProps) {
  const { logError } = useErrorAnalyticsContext()

  const handleError = async (error: Error, info: { componentStack: string }) => {
    try {
      await logError({
        error_type: error.name,
        message: error.message,
        severity: 'high',
        component: info.componentStack,
        stack_trace: error.stack,
        metadata: {
          componentStack: info.componentStack,
        },
      })
    } catch (e) {
      // Fallback to console if error analytics fails
      console.error('Failed to log error to analytics:', e)
      console.error('Original error:', error)
      console.error('Component stack:', info.componentStack)
    }
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