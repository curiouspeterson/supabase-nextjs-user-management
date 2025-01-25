'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
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

export default class ErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo)
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

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount < maxRetries - 1) {
      this.setState(prevState => ({
        error: null,
        retryCount: prevState.retryCount + 1
      }))
    } else {
      // Max retries reached, show refresh option
      window.location.reload()
    }
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
            <Alert variant="destructive" role="alert">
              <AlertTitle>
                {isNetworkError ? 'Connection Error' : 
                 isRateLimitError ? 'Rate Limit Exceeded' : 
                 'Something went wrong'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                {errorMessage}
              </AlertDescription>
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="w-full mt-4"
                aria-label={`${retryCount < maxRetries - 1 ? 'Try again' : 'Refresh page'} (Attempt ${retryCount + 1} of ${maxRetries})`}
              >
                {retryCount < maxRetries - 1 ? 'Try again' : 'Refresh page'}
              </Button>
            </Alert>
          </div>
        </div>
      )
    }

    return children
  }
} 