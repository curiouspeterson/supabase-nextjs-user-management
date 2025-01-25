import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'
import { NetworkError, RateLimitError } from '@/lib/errors'
import { errorHandler } from '@/lib/errors'

// Mock error handler
jest.mock('@/lib/errors', () => ({
  ...jest.requireActual('@/lib/errors'),
  errorHandler: {
    handleError: jest.fn(),
    formatErrorMessage: jest.fn()
  }
}))

// Component that throws an error
const ErrorComponent = ({ error }: { error: Error }) => {
  throw error
}

describe('ErrorBoundary', () => {
  const mockOnError = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders fallback UI when there is an error', () => {
    const testError = new Error('Test error')
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent error={testError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(mockOnError).toHaveBeenCalledWith(testError, expect.any(Object))
    expect(errorHandler.handleError).toHaveBeenCalled()
  })

  it('handles network errors with specific message', () => {
    const networkError = new NetworkError('Failed to fetch')
    
    render(
      <ErrorBoundary>
        <ErrorComponent error={networkError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Connection Error')).toBeInTheDocument()
    expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument()
  })

  it('handles rate limit errors with specific message', () => {
    const rateLimitError = new RateLimitError('Too many requests')
    
    render(
      <ErrorBoundary>
        <ErrorComponent error={rateLimitError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument()
    expect(screen.getByText(/wait a few minutes/i)).toBeInTheDocument()
  })

  it('allows retrying up to max attempts', async () => {
    const testError = new Error('Test error')
    const maxRetries = 2
    
    render(
      <ErrorBoundary maxRetries={maxRetries}>
        <ErrorComponent error={testError} />
      </ErrorBoundary>
    )

    // First error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // First retry
    fireEvent.click(screen.getByText('Try again'))
    await waitFor(() => {
      expect(screen.getByLabelText('Try again (Attempt 1 of 2)')).toBeInTheDocument()
    })
    
    // Second retry
    fireEvent.click(screen.getByText('Try again'))
    await waitFor(() => {
      expect(screen.getByText('Refresh page')).toBeInTheDocument()
    })
  })

  it('uses custom fallback when provided', () => {
    const testError = new Error('Test error')
    const fallback = <div>Custom Error UI</div>
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ErrorComponent error={testError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
  })

  it('resets error state when error is resolved', async () => {
    const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
      if (shouldError) throw new Error('Test error')
      return <div>Test Content</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldError={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    rerender(
      <ErrorBoundary>
        <TestComponent shouldError={false} />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  it('handles errors in error boundary itself gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    jest.spyOn(errorHandler, 'formatErrorMessage').mockImplementation(() => {
      throw new Error('Formatting error')
    })

    render(
      <ErrorBoundary>
        <ErrorComponent error={new Error('Test error')} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalled()
  })
}) 