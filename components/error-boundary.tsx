/**
 * Error boundary component for handling and recovering from errors in React components
 * @module error-boundary
 */

'use client'

import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorHandler } from '@/lib/errors'
import { ErrorAnalyticsService } from '@/lib/error-analytics'

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

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
    this.analyticsService = ErrorAnalyticsService.getInstance(props.component || 'error-boundary')
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Initialize analytics service if needed
    await this.analyticsService.initialize()

    // Handle and track the error
    errorHandler.handleError(error, this.props.component)
    
    // Track error analytics
    await this.analyticsService.trackError(error, {
      ...this.props.errorContext,
      componentStack: errorInfo.componentStack,
      component: this.props.component
    }).catch(console.error) // Handle tracking errors silently
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.FallbackComponent) {
        return (
          <this.props.FallbackComponent
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        )
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      const errorMessage = errorHandler.formatErrorMessage(this.state.error)

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mb-4">{errorMessage}</p>
            <Button
              variant="outline"
              onClick={() => {
                this.resetErrorBoundary()
                window.location.reload()
              }}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
} 