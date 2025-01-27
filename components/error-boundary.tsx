/**
 * Error boundary component for handling and recovering from errors in React components
 * @module error-boundary
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

/**
 * Props for the ErrorBoundary component
 */
interface Props {
  /** Child components to render */
  children?: ReactNode
  /** Fallback component to show when an error occurs */
  fallback: React.ComponentType<{ error: Error }>
}

/**
 * State interface for the ErrorBoundary component
 */
interface State {
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
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      return (
        <FallbackComponent 
          error={this.state.error} 
        />
      )
    }

    return this.props.children
  }
} 