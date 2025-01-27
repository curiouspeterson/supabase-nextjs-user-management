import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorRecoveryStrategy } from '@/lib/types/error'
import { ErrorAnalyticsService } from '@/lib/services/error-analytics-service'

// Mock ErrorAnalyticsService
jest.mock('@/lib/services/error-analytics-service', () => {
  const mockService = {
    getInstance: jest.fn(),
    trackError: jest.fn().mockResolvedValue('error-123'),
    getErrorMetrics: jest.fn().mockReturnValue({}),
    updateErrorResolution: jest.fn(),
    suggestRecoveryStrategy: jest.fn().mockReturnValue(ErrorRecoveryStrategy.RETRY)
  }

  return {
    ErrorAnalyticsService: {
      getInstance: jest.fn(() => mockService)
    }
  }
})

// Test component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error message when there is an error', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/An error occurred/i)).toBeInTheDocument()
    expect(mockOnError).toHaveBeenCalled()
  })

  it('tracks error and suggests recovery strategy', () => {
    const mockAnalytics = ErrorAnalyticsService.getInstance()

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(mockAnalytics.trackError).toHaveBeenCalled()
    expect(mockAnalytics.suggestRecoveryStrategy).toHaveBeenCalled()
  })

  it('handles retry recovery strategy', () => {
    const mockAnalytics = ErrorAnalyticsService.getInstance()
    ;(mockAnalytics.suggestRecoveryStrategy as jest.Mock).mockReturnValue(ErrorRecoveryStrategy.RETRY)

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()

    fireEvent.click(retryButton)
    expect(mockAnalytics.updateErrorResolution).toHaveBeenCalled()
  })

  it('handles refresh recovery strategy', () => {
    const mockAnalytics = ErrorAnalyticsService.getInstance()
    ;(mockAnalytics.suggestRecoveryStrategy as jest.Mock).mockReturnValue(ErrorRecoveryStrategy.REFRESH)

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    expect(refreshButton).toBeInTheDocument()
  })

  it('handles reset recovery strategy', () => {
    const mockAnalytics = ErrorAnalyticsService.getInstance()
    ;(mockAnalytics.suggestRecoveryStrategy as jest.Mock).mockReturnValue(ErrorRecoveryStrategy.RESET)

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const resetButton = screen.getByRole('button', { name: /reset/i })
    expect(resetButton).toBeInTheDocument()
  })
})