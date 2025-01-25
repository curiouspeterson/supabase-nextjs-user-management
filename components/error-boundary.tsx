'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { errorHandler } from '@/lib/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error handling service
    errorHandler.handleError(error, `ErrorBoundary: ${errorInfo.componentStack}`)
    
    // Call onError prop if provided
    this.props.onError?.(error, errorInfo)

    // Reset retry count for new errors
    this.setState({ retryCount: 0 })
  }

  private isNetworkError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('timeout') ||
      error.name === 'NetworkError'
    )
  }

  private isRateLimitError(error: Error): boolean {
    return (
      error.message.toLowerCase().includes('rate limit') ||
      error.message.toLowerCase().includes('too many requests') ||
      error.name === 'RateLimitError'
    )
  }

  private getErrorMessage(error: Error): string {
    if (this.isNetworkError(error)) {
      return 'Unable to connect. Please check your internet connection and try again.'
    }
    
    if (this.isRateLimitError(error)) {
      return 'Too many attempts. Please wait a few minutes before trying again.'
    }
    
    return errorHandler.formatErrorMessage(error)
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      // If max retries reached, show a different message
      this.setState({ 
        error: new Error('Maximum retry attempts reached. Please refresh the page.'),
        retryCount: retryCount + 1
      })
      return
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  render() {
    const { hasError, error, retryCount } = this.state
    const { children, fallback, maxRetries = 3 } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      const errorMessage = this.getErrorMessage(error!)
      const canRetry = retryCount < maxRetries
      const isNetworkError = this.isNetworkError(error!)
      const isRateLimitError = this.isRateLimitError(error!)

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertTitle>
                {isNetworkError ? 'Connection Error' : 
                 isRateLimitError ? 'Rate Limit Exceeded' : 
                 'Something went wrong'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                {errorMessage}
              </AlertDescription>
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="w-full mt-4"
                  aria-label={`Try again (Attempt ${retryCount + 1} of ${maxRetries})`}
                >
                  {isRateLimitError ? 'Try again later' : 'Try again'}
                </Button>
              )}
              {!canRetry && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Refresh page
                </Button>
              )}
            </Alert>
          </div>
        </div>
      )
    }

    return children
  }
} 