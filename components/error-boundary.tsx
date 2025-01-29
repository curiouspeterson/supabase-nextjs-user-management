/**
 * Error boundary component for handling and recovering from errors in React components
 * @module error-boundary
 */

'use client'

import React from 'react'
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
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private analyticsService: ErrorAnalyticsService
  private lastErrorTime: number = 0
  private errorCount: number = 0
  private readonly COOLDOWN_PERIOD_MS: number = 5000 // 5 seconds
  private readonly MAX_ERRORS_PER_MINUTE: number = 10
  private readonly ERROR_COUNT_RESET_INTERVAL_MS: number = 60000 // 1 minute

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      isLoggingPaused: false 
    }
    this.analyticsService = new ErrorAnalyticsService()
    
    // Reset error count periodically
    setInterval(() => {
      this.errorCount = 0
    }, this.ERROR_COUNT_RESET_INTERVAL_MS)
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      isLoggingPaused: false 
    }
  }

  shouldLogError(): boolean {
    const now = Date.now()
    
    // Check if we're in cooldown period
    if (now - this.lastErrorTime < this.COOLDOWN_PERIOD_MS) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error logging skipped: In cooldown period')
      }
      return false
    }

    // Check if we've exceeded error limit
    if (this.errorCount >= this.MAX_ERRORS_PER_MINUTE) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error logging paused: Too many errors')
      }
      this.setState({ isLoggingPaused: true })
      return false
    }

    return true
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (!this.shouldLogError()) {
      return
    }

    try {
      this.lastErrorTime = Date.now()
      this.errorCount++

      // Log error to analytics service directly
      await this.analyticsService.logError({
        error_type: error.name,
        message: error.message,
        severity: 'high',
        component: this.props.component || 'unknown',
        stack_trace: error.stack,
        metadata: {
          ...this.props.errorContext,
          componentStack: errorInfo.componentStack,
          errorCount: this.errorCount,
          isLoggingPaused: this.state.isLoggingPaused
        },
      })
    } catch (loggingError) {
      // Handle logging errors silently in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logging failed:', loggingError)
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      isLoggingPaused: false 
    })
    this.errorCount = 0
  }

  render() {
    const { error, isLoggingPaused } = this.state
    const { children, FallbackComponent } = this.props

    if (error && FallbackComponent) {
      return (
        <>
          {isLoggingPaused && process.env.NODE_ENV === 'development' && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Logging Paused</AlertTitle>
              <AlertDescription>
                Too many errors occurred. Error logging has been temporarily paused.
                Reset the error boundary to resume logging.
              </AlertDescription>
            </Alert>
          )}
          <FallbackComponent
            error={error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        </>
      )
    }

    return children
  }
} 