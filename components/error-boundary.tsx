/**
 * Error boundary component for handling and recovering from errors in React components
 * @module error-boundary
 */

'use client'

import React, { useEffect } from 'react'
import { ErrorAnalyticsService } from '@/services/error-analytics'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorHandler } from '@/lib/errors'

type FallbackProps = {
  error: Error
  resetErrorBoundary: () => void
}

type FallbackComponent = React.ComponentType<FallbackProps>

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode
  /** Fallback component to show when an error occurs */
  fallback?: React.ReactNode
  /** Custom fallback component */
  FallbackComponent?: FallbackComponent
  /** Component name for error tracking */
  component?: string
  /** Additional context for error tracking */
  errorContext?: Record<string, unknown>
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * State interface for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Has error occurred */
  hasError: boolean
  /** Current error if any */
  error: Error | null
  /** Is error logging paused */
  isLoggingPaused: boolean
}

/**
 * React Error Boundary component with advanced error handling and recovery strategies
 * 
 * Features:
 * - Error tracking and analytics
 * - Multiple recovery strategies
 * - Retry attempts tracking
 * - Custom error messages
 * - Fallback UI support
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   component="UserDashboard"
 *   errorContext={{ userId: 'abc123' }}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export default function ErrorBoundary({
  error,
  reset,
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button
        variant="outline"
        onClick={reset}
      >
        Try again
      </Button>
    </div>
  )
} 