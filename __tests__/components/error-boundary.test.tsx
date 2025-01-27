import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'
import { NetworkError, ValidationError, AppError, ErrorSeverity, ErrorCategory } from '@/lib/error-analytics'
import { ErrorAnalyticsService } from '@/lib/error-analytics'
import { createMockError, createMockErrorMetrics } from '@/lib/test-utils'

// Mock error analytics service
jest.mock('@/lib/error-analytics', () => ({
  ...jest.requireActual('@/lib/error-analytics'),
  ErrorAnalyticsService: {
    getInstance: jest.fn(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      trackError: jest.fn().mockResolvedValue(undefined),
      updateErrorResolution: jest.fn().mockResolvedValue(undefined),
      getErrorMetrics: jest.fn().mockResolvedValue({
        'TestError:TEST_ERROR': createMockErrorMetrics()
      })
    }))
  }
}))

// Component that throws an error
const ErrorComponent = ({ error }: { error: AppError }) => {
  throw error
}

describe('ErrorBoundary', () => {
  const mockOnError = jest.fn()
  const TestError = createMockError('Test error')
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const ThrowError = () => {
    throw TestError
  }

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders fallback UI when there is an error', async () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(mockOnError).toHaveBeenCalledWith(TestError, expect.any(Object))
    
    // Verify error was tracked
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().trackError)
        .toHaveBeenCalledWith(TestError, expect.any(String))
    })
  })

  it('handles network errors with specific message', async () => {
    const networkError = new NetworkError('Failed to fetch')
    
    render(
      <ErrorBoundary>
        <ErrorComponent error={networkError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Connection Error')).toBeInTheDocument()
    expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument()
    
    // Verify error was tracked with correct severity and category
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().trackError)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.NETWORK
          }),
          expect.any(String)
        )
    })
  })

  it('handles validation errors with specific message', async () => {
    const validationError = new ValidationError('Invalid input')
    
    render(
      <ErrorBoundary>
        <ErrorComponent error={validationError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Validation Error')).toBeInTheDocument()
    expect(screen.getByText(/please check your input/i)).toBeInTheDocument()
    
    // Verify error was tracked with correct severity and category
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().trackError)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.VALIDATION
          }),
          expect.any(String)
        )
    })
  })

  it('allows retrying up to max attempts', async () => {
    const { rerender } = render(
      <ErrorBoundary maxRetries={3}>
        <ThrowError />
      </ErrorBoundary>
    )

    // First attempt
    const retryButton = screen.getByRole('button', {
      name: /try again \(attempt 1 of 3\)/i,
    })
    fireEvent.click(retryButton)

    // Second attempt
    rerender(
      <ErrorBoundary maxRetries={3}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(
      screen.getByRole('button', { name: /try again \(attempt 2 of 3\)/i })
    ).toBeInTheDocument()

    // Third attempt
    fireEvent.click(
      screen.getByRole('button', { name: /try again \(attempt 2 of 3\)/i })
    )
    rerender(
      <ErrorBoundary maxRetries={3}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(
      screen.getByRole('button', { name: /try again \(attempt 3 of 3\)/i })
    ).toBeInTheDocument()

    // Final attempt
    fireEvent.click(
      screen.getByRole('button', { name: /try again \(attempt 3 of 3\)/i })
    )
    rerender(
      <ErrorBoundary maxRetries={3}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    // Verify error resolution was tracked
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'AppError:TEST_ERROR',
          expect.any(Number),
          false
        )
    })
  })

  it('uses custom fallback when provided', async () => {
    const testError = createMockError('Test error')
    const fallback = <div>Custom Error UI</div>
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ErrorComponent error={testError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
    
    // Verify error was tracked
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().trackError)
        .toHaveBeenCalledWith(testError, expect.any(String))
    })
  })

  it('resets error state when error is resolved', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    rerender(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    // Verify error resolution was tracked as successful
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'AppError:TEST_ERROR',
          expect.any(Number),
          true
        )
    })
  })

  it('handles errors in error boundary itself gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error')
    const criticalError = createMockError(
      'Critical error',
      'CRITICAL_ERROR',
      ErrorSeverity.CRITICAL,
      ErrorCategory.UNKNOWN
    )

    render(
      <ErrorBoundary>
        <ErrorComponent error={criticalError} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalled()
    
    // Verify critical error was tracked
    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().trackError)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            severity: ErrorSeverity.CRITICAL
          }),
          expect.any(String)
        )
    })
  })
})

describe('Recovery Strategies', () => {
  it('implements retry strategy correctly', async () => {
    const error = new AppError('Test error')
    const { rerender } = render(
      <ErrorBoundary maxRetries={3}>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    // First attempt
    const retryButton = screen.getByRole('button', {
      name: /try again \(attempt 1 of 3\)/i,
    })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'AppError:APP_ERROR',
          expect.any(Number),
          false
        )
    })
  })

  it('implements refresh strategy correctly', async () => {
    const error = new NetworkError('API failed')
    render(
      <ErrorBoundary>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    const refreshButton = screen.getByRole('button', {
      name: /refresh page/i,
    })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'NetworkError:NETWORK_ERROR',
          expect.any(Number),
          false
        )
    })
  })

  it('implements reset strategy correctly', async () => {
    const error = new AuthError('Session expired')
    render(
      <ErrorBoundary>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    const resetButton = screen.getByRole('button', {
      name: /reset and refresh/i,
    })
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'AuthError:AUTH_ERROR',
          expect.any(Number),
          false
        )
    })
  })

  it('implements fallback strategy correctly', async () => {
    const error = new ValidationError('Invalid state')
    render(
      <ErrorBoundary>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    const fallbackButton = screen.getByRole('button', {
      name: /return to home/i,
    })
    fireEvent.click(fallbackButton)

    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'ValidationError:VALIDATION_ERROR',
          expect.any(Number),
          false
        )
    })
  })

  it('suggests appropriate recovery strategy based on error type', async () => {
    const networkError = new NetworkError('API failed')
    const authError = new AuthError('Session expired')
    const validationError = new ValidationError('Invalid input')

    // Network error should suggest RETRY
    render(
      <ErrorBoundary>
        <ErrorComponent error={networkError} />
      </ErrorBoundary>
    )
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
    cleanup()

    // Auth error should suggest RESET
    render(
      <ErrorBoundary>
        <ErrorComponent error={authError} />
      </ErrorBoundary>
    )
    expect(screen.getByText(/reset and refresh/i)).toBeInTheDocument()
    cleanup()

    // Validation error should suggest FALLBACK
    render(
      <ErrorBoundary>
        <ErrorComponent error={validationError} />
      </ErrorBoundary>
    )
    expect(screen.getByText(/return to home/i)).toBeInTheDocument()
  })
})

describe('Error Resolution', () => {
  it('tracks resolution time correctly', async () => {
    jest.useFakeTimers()
    const error = new AppError('Test error')
    const startTime = Date.now()
    
    render(
      <ErrorBoundary>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    // Advance time by 5 seconds
    jest.advanceTimersByTime(5000)

    const retryButton = screen.getByRole('button')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledWith(
          'AppError:APP_ERROR',
          expect.any(Number),
          false
        )
      const resolutionTime = ErrorAnalyticsService.getInstance().updateErrorResolution.mock.calls[0][1]
      expect(resolutionTime).toBeGreaterThanOrEqual(5000)
    })

    jest.useRealTimers()
  })

  it('tracks consecutive failures correctly', async () => {
    const error = new AppError('Test error')
    const { rerender } = render(
      <ErrorBoundary maxRetries={3}>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    // Simulate three consecutive failures
    for (let i = 1; i <= 3; i++) {
      const retryButton = screen.getByRole('button', {
        name: new RegExp(`try again \\(attempt ${i} of 3\\)`, 'i'),
      })
      fireEvent.click(retryButton)
      rerender(
        <ErrorBoundary maxRetries={3}>
          <ErrorComponent error={error} />
        </ErrorBoundary>
      )
    }

    await waitFor(() => {
      expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
        .toHaveBeenCalledTimes(3)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  it('calculates success rate correctly', async () => {
    const error = new AppError('Test error')
    const { rerender } = render(
      <ErrorBoundary maxRetries={5}>
        <ErrorComponent error={error} />
      </ErrorBoundary>
    )

    // Simulate mixed success/failure pattern
    const attempts = [
      { success: false },
      { success: true },
      { success: false },
      { success: true },
      { success: true }
    ]

    for (const [index, attempt] of attempts.entries()) {
      const retryButton = screen.getByRole('button')
      fireEvent.click(retryButton)

      if (attempt.success) {
        // Simulate successful recovery
        rerender(
          <ErrorBoundary maxRetries={5}>
            <div>Recovered</div>
          </ErrorBoundary>
        )
      } else {
        // Simulate continued error
        rerender(
          <ErrorBoundary maxRetries={5}>
            <ErrorComponent error={error} />
          </ErrorBoundary>
        )
      }

      await waitFor(() => {
        expect(ErrorAnalyticsService.getInstance().updateErrorResolution)
          .toHaveBeenCalledWith(
            'AppError:APP_ERROR',
            expect.any(Number),
            attempt.success
          )
      })
    }

    // Verify final success rate
    const successRate = attempts.filter(a => a.success).length / attempts.length
    expect(successRate).toBe(0.6) // 3 successes out of 5 attempts
  })
}) 