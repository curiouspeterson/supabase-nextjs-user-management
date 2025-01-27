/**
 * Error boundary component for handling and recovering from errors in React components
 * @module error-boundary
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  AppError,
  NetworkError,
  ValidationError,
  ErrorAnalyticsService,
  ErrorRecoveryStrategy
} from '@/lib/error-analytics'

/**
 * Props for the ErrorBoundary component
 */
interface Props {
  /** Child components to render */
  children: React.ReactNode
  /** Optional custom fallback UI to show when an error occurs */
  fallback?: React.ReactNode
  /** Optional callback for error handling */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
}

/**
 * State interface for the ErrorBoundary component
 */
interface State {
  /** Current error if any */
  error: Error | null
  /** Number of retry attempts */
  retryCount: number
  /** Unique key for the current error */
  errorKey?: string
  /** Timestamp when the error occurred */
  startTime?: number
  /** Current recovery strategy */
  recoveryStrategy?: ErrorRecoveryStrategy
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
 *   fallback={<CustomErrorUI />}
 *   onError={(error) => console.error(error)}
 *   maxRetries={3}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<Props, State> {
  /** Error analytics service instance */
  private errorAnalytics: ErrorAnalyticsService
  /** Next.js router instance */
  private router = useRouter()

  /**
   * Creates a new ErrorBoundary instance
   * @param props - Component props
   */
  constructor(props: Props) {
    super(props)
    this.state = {
      error: null,
      retryCount: 0
    }
    this.errorAnalytics = ErrorAnalyticsService.getInstance()
  }

  /**
   * Derives error state from caught errors
   * @param error - The error that was caught
   * @returns New state object
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      retryCount: 0,
      startTime: Date.now()
    }
  }

  /**
   * Initializes error analytics service
   */
  async componentDidMount() {
    await this.errorAnalytics.initialize()
  }

  /**
   * Handles caught errors
   * @param error - The error that was caught
   * @param errorInfo - React error info object
   */
  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props
    
    if (onError) {
      onError(error, errorInfo)
    }

    // Track error with analytics
    const context = `${window.location.pathname}${window.location.search}`
    const errorKey = await this.trackError(error, context)
    
    // Get suggested recovery strategy
    const recoveryStrategy = this.errorAnalytics.suggestRecoveryStrategy(errorKey)
    
    this.setState({ errorKey, recoveryStrategy })
  }

  /**
   * Tracks an error with the analytics service
   * @param error - The error to track
   * @param context - Error context (e.g., URL)
   * @returns Error key for tracking
   */
  private async trackError(error: Error, context: string): Promise<string> {
    try {
      let appError: AppError
      
      if (error instanceof AppError) {
        appError = error
      } else {
        // Convert standard errors to AppError
        appError = new AppError(
          error.message,
          error.name,
          undefined,
          undefined,
          { stack: error.stack }
        )
      }

      await this.errorAnalytics.trackError(appError, context)
      return `${appError.name}:${appError.code}`
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError)
      return 'UNKNOWN:TRACKING_FAILED'
    }
  }

  /**
   * Handles error recovery based on the current strategy
   */
  private async handleRecovery() {
    const { maxRetries = 3 } = this.props
    const { retryCount, errorKey, startTime, recoveryStrategy } = this.state
    
    if (retryCount >= maxRetries) {
      return
    }

    const strategy = recoveryStrategy || ErrorRecoveryStrategy.RETRY
    
    try {
      switch (strategy) {
        case ErrorRecoveryStrategy.RETRY:
          this.setState(prev => ({
            error: null,
            retryCount: prev.retryCount + 1
          }))
          break

        case ErrorRecoveryStrategy.REFRESH:
          window.location.reload()
          break

        case ErrorRecoveryStrategy.RESET:
          // Clear local state and refresh
          localStorage.clear()
          sessionStorage.clear()
          window.location.reload()
          break

        case ErrorRecoveryStrategy.FALLBACK:
          // Navigate to fallback route
          this.router.push('/')
          break

        case ErrorRecoveryStrategy.NONE:
          // Do nothing, user must manually refresh
          return
      }

      // Track recovery attempt
      if (errorKey && startTime) {
        const resolutionTime = Date.now() - startTime
        const wasSuccessful = true
        
        await this.errorAnalytics.updateErrorResolution(
          errorKey,
          resolutionTime,
          wasSuccessful,
          strategy
        )
      }
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError)
      
      // Track failed recovery
      if (errorKey && startTime) {
        const resolutionTime = Date.now() - startTime
        const wasSuccessful = false
        
        await this.errorAnalytics.updateErrorResolution(
          errorKey,
          resolutionTime,
          wasSuccessful,
          strategy
        )
      }

      // Update state to show recovery failed
      this.setState(prev => ({
        retryCount: prev.retryCount + 1
      }))
    }
  }

  /**
   * Gets the appropriate error message based on error type
   * @param error - The error to get message for
   * @returns User-friendly error message
   */
  private getErrorMessage(error: Error): string {
    if (error instanceof NetworkError) {
      return 'Connection Error'
    }
    if (error instanceof ValidationError) {
      return 'Validation Error'
    }
    return 'Something went wrong'
  }

  /**
   * Gets the detailed error description based on error type
   * @param error - The error to get description for
   * @returns User-friendly error description
   */
  private getErrorDescription(error: Error): string {
    if (error instanceof NetworkError) {
      return 'Please check your internet connection and try again.'
    }
    if (error instanceof ValidationError) {
      return 'Please check your input and try again.'
    }
    return 'An unexpected error occurred. Please try again later.'
  }

  /**
   * Gets the appropriate button text based on recovery strategy
   * @returns Button text for recovery action
   */
  private getRecoveryButtonText(): string {
    const { maxRetries = 3 } = this.props
    const { retryCount, recoveryStrategy } = this.state

    if (retryCount >= maxRetries) {
      return 'Please refresh the page'
    }

    switch (recoveryStrategy) {
      case ErrorRecoveryStrategy.RETRY:
        return `Try again (attempt ${retryCount + 1} of ${maxRetries})`
      case ErrorRecoveryStrategy.REFRESH:
        return 'Refresh page'
      case ErrorRecoveryStrategy.RESET:
        return 'Reset and refresh'
      case ErrorRecoveryStrategy.FALLBACK:
        return 'Return to home'
      case ErrorRecoveryStrategy.NONE:
        return 'Please contact support'
      default:
        return `Try again (attempt ${retryCount + 1} of ${maxRetries})`
    }
  }

  /**
   * Renders the error boundary component
   */
  render() {
    const { children, fallback, maxRetries = 3 } = this.props
    const { error, retryCount, recoveryStrategy } = this.state

    if (error) {
      if (fallback) {
        return fallback
      }

      const showRecoveryButton = retryCount < maxRetries && 
        recoveryStrategy !== ErrorRecoveryStrategy.NONE

      return (
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-100">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {this.getErrorMessage(error)}
          </h2>
          <p className="text-sm text-red-600 mb-4">
            {this.getErrorDescription(error)}
          </p>
          {showRecoveryButton && (
            <button
              onClick={() => this.handleRecovery()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {this.getRecoveryButtonText()}
            </button>
          )}
        </div>
      )
    }

    return children
  }
} 