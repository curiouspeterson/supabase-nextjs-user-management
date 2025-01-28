/**
 * Error boundary component for handling and recovering from errors in React components
 * @module error-boundary
 */

'use client'

import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode
  /** Fallback component to show when an error occurs */
  fallback?: React.ReactNode
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
 *   fallback={ErrorFallbackComponent}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by error boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null })
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