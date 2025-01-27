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
import { ErrorRecoveryStrategy as TypeErrorRecoveryStrategy } from '@/lib/types/error'

/**
 * Props for the ErrorBoundary component
 */
interface Props {
  /** Child components to render */
  children: React.ReactNode
  /** Optional custom fallback UI to show when an error occurs */
  fallback?: React.ReactNode
  /** Optional callback for error handling */
  onError?: (error: Error) => void
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Optional recovery strategy */
  recoveryStrategy?: TypeErrorRecoveryStrategy
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
  errorKey: string | null
  /** Timestamp when the error occurred */
  startTime: number | null
  /** Current recovery strategy */
  recoveryStrategy: TypeErrorRecoveryStrategy
}

/**
 * Props for the ErrorBoundaryClass component
 */
interface ErrorBoundaryClassProps extends Props {
  router: ReturnType<typeof useRouter>
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
export class ErrorBoundaryClass extends React.Component<ErrorBoundaryClassProps, State> {
  /** Error analytics service instance */
  private analyticsService: ErrorAnalyticsService

  /**
   * Creates a new ErrorBoundary instance
   * @param props - Component props
   */
  constructor(props: ErrorBoundaryClassProps) {
    super(props)
    this.state = {
      error: null,
      retryCount: 0,
      errorKey: null,
      startTime: null,
      recoveryStrategy: props.recoveryStrategy || TypeErrorRecoveryStrategy.RETRY
    }
    this.analyticsService = ErrorAnalyticsService.getInstance()
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
      errorKey: null,
      startTime: Date.now(),
      recoveryStrategy: TypeErrorRecoveryStrategy.RETRY
    }
  }

  /**
   * Converts a standard Error to an AppError
   * @param error - The error to convert
   * @returns An AppError instance
   */
  private convertToAppError(error: Error): AppError {
    if (error instanceof AppError) {
      return error
    }
    if (error.name === 'NetworkError' || error.message.toLowerCase().includes('network')) {
      return new NetworkError(error.message)
    }
    if (error.name === 'ValidationError' || error.message.toLowerCase().includes('validation')) {
      return new ValidationError(error.message)
    }
    return new AppError(error.message)
  }

  /**
   * Handles caught errors
   * @param error - The error that was caught
   */
  async componentDidCatch(error: Error) {
    const appError = this.convertToAppError(error)
    const errorKey = await this.analyticsService.trackError(appError)
    const suggestedStrategy = this.analyticsService.suggestRecoveryStrategy(errorKey)
    
    this.setState({
      errorKey,
      recoveryStrategy: suggestedStrategy
    })

    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  /**
   * Handles error recovery based on the current strategy
   */
  handleRecovery = async () => {
    const { error, errorKey, retryCount, startTime, recoveryStrategy } = this.state
    const { maxRetries = 3, router } = this.props

    if (!error || !errorKey || retryCount >= maxRetries) {
      return
    }

    const resolutionTime = startTime ? Date.now() - startTime : 0
    this.analyticsService.updateErrorResolution(
      errorKey,
      resolutionTime,
      false,
      recoveryStrategy
    )

    switch (recoveryStrategy) {
      case TypeErrorRecoveryStrategy.RETRY:
        this.setState(prevState => ({
          error: null,
          retryCount: prevState.retryCount + 1
        }))
        break
      case TypeErrorRecoveryStrategy.REFRESH:
        window.location.reload()
        break
      case TypeErrorRecoveryStrategy.RESET:
        this.setState({
          error: null,
          retryCount: 0,
          errorKey: null,
          startTime: null
        })
        break
      case TypeErrorRecoveryStrategy.FALLBACK:
        router.push('/')
        break
      default:
        break
    }
  }

  /**
   * Gets the appropriate error message based on error type
   * @returns User-friendly error message
   */
  getErrorMessage(): string {
    const { error } = this.state
    if (!error) return 'An unexpected error occurred'

    if (error instanceof NetworkError) {
      return 'Please check your internet connection and try again'
    }
    if (error instanceof ValidationError) {
      return 'The provided data is invalid. Please check your input and try again'
    }
    if (error instanceof AppError) {
      return error.message
    }
    return 'An unexpected error occurred. Please try again later'
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
  getRecoveryButtonText(): string {
    const { retryCount, recoveryStrategy } = this.state
    const { maxRetries = 3 } = this.props

    switch (recoveryStrategy) {
      case TypeErrorRecoveryStrategy.RETRY:
        return `Try again (attempt ${retryCount + 1} of ${maxRetries})`
      case TypeErrorRecoveryStrategy.REFRESH:
        return 'Refresh page'
      case TypeErrorRecoveryStrategy.RESET:
        return 'Reset and refresh'
      case TypeErrorRecoveryStrategy.FALLBACK:
        return 'Return to home'
      default:
        return 'Try again'
    }
  }

  /**
   * Renders the error boundary component
   */
  render() {
    const { error, retryCount } = this.state
    const { children, fallback, maxRetries = 3 } = this.props

    if (error) {
      if (retryCount >= maxRetries) {
        return fallback || (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100" role="alert">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Maximum retries exceeded</h2>
            <p className="text-sm text-red-600">
              Please try again later or contact support if the problem persists.
            </p>
          </div>
        )
      }

      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100" role="alert">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {error instanceof NetworkError ? 'Connection Error' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-red-600 mb-4">{this.getErrorMessage()}</p>
          <button
            onClick={this.handleRecovery}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {this.getRecoveryButtonText()}
          </button>
        </div>
      )
    }

    return children
  }
}

/**
 * Wrapper component to provide hooks to the class component
 */
export function ErrorBoundary(props: Props) {
  const router = useRouter()
  return <ErrorBoundaryClass {...props} router={router} />
} 