import { ErrorAnalyticsService } from '@/lib/services/error-analytics-service'
import { ErrorSeverity, ErrorCategory, ErrorRecoveryStrategy } from '@/lib/types/error'
import { AppError, NetworkError, AuthError, ValidationError } from '@/lib/types/error'
import { createMockError } from '@/lib/test-utils'

// Test utilities for error analytics
const generateTestData = async (errorAnalytics: ErrorAnalyticsService, config: {
  errorType: string
  message: string
  context: string
  userCount: number
  attempts: number
  successRate: number
}) => {
  const error = createMockError(config.message, config.errorType)
  const errorKey = `${error.name}:${error.code}`
  
  for (let i = 0; i < config.attempts; i++) {
    const userId = `user${i % config.userCount}`
    await errorAnalytics.trackError(error, config.context, userId)
    const success = Math.random() < config.successRate
    await errorAnalytics.updateErrorResolution(errorKey, 1000, success)
  }
  
  return { error, errorKey }
}

const expectMetricsToMatch = (actual: ErrorMetrics, expected: Partial<ErrorMetrics>) => {
  Object.entries(expected).forEach(([key, value]) => {
    expect(actual[key]).toBe(value, `Expected ${key} to be ${value} but got ${actual[key]}`)
  })
}

const expectTrendsToMatch = (actual: ErrorTrend[], expected: Partial<ErrorTrend>[]) => {
  expect(actual).toHaveLength(expected.length, 'Trend count mismatch')
  expected.forEach((expectedTrend, index) => {
    Object.entries(expectedTrend).forEach(([key, value]) => {
      expect(actual[index][key]).toBe(value, `Trend ${index} ${key} mismatch`)
    })
  })
}

describe('ErrorAnalyticsService', () => {
  let errorAnalytics: ErrorAnalyticsService

  beforeEach(async () => {
    jest.useFakeTimers()
    errorAnalytics = ErrorAnalyticsService.getInstance()
    await errorAnalytics.initialize()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    localStorage.clear()
  })

  describe('Error Tracking', () => {
    it('tracks basic error metrics', () => {
      const error = new AppError('Test error')
      errorAnalytics.trackError(error, 'test.context', 'user1')

      const metrics = errorAnalytics.getErrorMetrics()
      const errorKey = `${error.name}:${error.code}`

      expect(metrics[errorKey]).toBeDefined()
      expect(metrics[errorKey].count).toBe(1)
      expect(metrics[errorKey].contexts).toContain('test.context')
      expect(metrics[errorKey].impactedUsers).toBe(1)
    })

    it('correctly categorizes different error types', () => {
      const networkError = new NetworkError('Network failed')
      const authError = new AuthError('Auth failed')
      const validationError = new ValidationError('Invalid input')

      errorAnalytics.trackError(networkError)
      errorAnalytics.trackError(authError)
      errorAnalytics.trackError(validationError)

      const metrics = errorAnalytics.getErrorMetrics()
      
      expect(metrics[`NetworkError:NETWORK_ERROR`].category).toBe(ErrorCategory.NETWORK)
      expect(metrics[`AuthError:AUTH_ERROR`].category).toBe(ErrorCategory.AUTH)
      expect(metrics[`ValidationError:VALIDATION_ERROR`].category).toBe(ErrorCategory.VALIDATION)
    })

    it('assigns correct severity levels', () => {
      const criticalError = new AppError('Security breach', 'SECURITY_ERROR', 500)
      const highError = new NetworkError('Network failed')
      const mediumError = new ValidationError('Invalid input')
      const lowError = new AppError('Minor issue', 'MINOR_ERROR', 200)

      errorAnalytics.trackError(criticalError)
      errorAnalytics.trackError(highError)
      errorAnalytics.trackError(mediumError)
      errorAnalytics.trackError(lowError)

      const metrics = errorAnalytics.getErrorMetrics()
      
      expect(metrics[`AppError:SECURITY_ERROR`].severity).toBe(ErrorSeverity.CRITICAL)
      expect(metrics[`NetworkError:NETWORK_ERROR`].severity).toBe(ErrorSeverity.HIGH)
      expect(metrics[`ValidationError:VALIDATION_ERROR`].severity).toBe(ErrorSeverity.MEDIUM)
      expect(metrics[`AppError:MINOR_ERROR`].severity).toBe(ErrorSeverity.LOW)
    })
  })

  describe('Error Analysis', () => {
    it('identifies related errors', () => {
      const error1 = new NetworkError('API timeout')
      const error2 = new NetworkError('API failed')
      const error3 = new ValidationError('Invalid input')

      errorAnalytics.trackError(error1, 'api.users')
      errorAnalytics.trackError(error2, 'api.users')
      errorAnalytics.trackError(error3, 'form.users')

      const relatedErrors = errorAnalytics.getRelatedErrors(`NetworkError:NETWORK_ERROR`)
      expect(relatedErrors).toHaveLength(1)
    })

    it('calculates error frequency correctly', () => {
      const error = new AppError('Test error')
      
      // Simulate errors over time
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))
      errorAnalytics.trackError(error)
      
      jest.setSystemTime(new Date('2024-01-01T01:00:00Z'))
      errorAnalytics.trackError(error)
      
      jest.setSystemTime(new Date('2024-01-01T02:00:00Z'))
      const metrics = errorAnalytics.getErrorMetrics()
      
      expect(metrics[`AppError:APP_ERROR`].frequency).toBe(1) // 2 errors over 2 hours
    })

    it('tracks error resolution metrics', () => {
      const error = new AppError('Test error')
      const errorKey = `${error.name}:${error.code}`

      errorAnalytics.trackError(error)
      errorAnalytics.updateErrorResolution(errorKey, 5000, true)
      errorAnalytics.updateErrorResolution(errorKey, 3000, true)
      errorAnalytics.updateErrorResolution(errorKey, 4000, false)

      const impact = errorAnalytics.getErrorImpact(errorKey)
      expect(impact.recoveryRate).toBeCloseTo(0.67, 2) // 2 successes out of 3
      expect(impact.avgResolutionTime).toBeCloseTo(4000, 0) // average of 5000, 3000, 4000
    })
  })

  describe('Trend Analysis', () => {
    it('tracks error trends over time', () => {
      const error = new NetworkError('API failed')
      
      // Simulate errors over multiple hours
      for (let hour = 0; hour < 3; hour++) {
        jest.setSystemTime(new Date(`2024-01-01T${hour.toString().padStart(2, '0')}:00:00Z`))
        errorAnalytics.trackError(error, 'api', `user${hour}`)
      }

      const trends = errorAnalytics.getTrends({
        category: ErrorCategory.NETWORK,
        hours: 4
      })

      expect(trends).toHaveLength(3)
      expect(trends[0].count).toBe(1)
      expect(trends[0].impactedUsers).toBe(1)
    })

    it('filters trends by category and severity', () => {
      const networkError = new NetworkError('Network failed')
      const authError = new AuthError('Auth failed')
      
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))
      errorAnalytics.trackError(networkError)
      errorAnalytics.trackError(authError)

      const networkTrends = errorAnalytics.getTrends({ category: ErrorCategory.NETWORK })
      const authTrends = errorAnalytics.getTrends({ category: ErrorCategory.AUTH })
      const highSeverityTrends = errorAnalytics.getTrends({ severity: ErrorSeverity.HIGH })

      expect(networkTrends).toHaveLength(1)
      expect(authTrends).toHaveLength(1)
      expect(highSeverityTrends).toHaveLength(1)
    })
  })

  describe('Error Impact', () => {
    it('tracks impacted users correctly', () => {
      const error = new AppError('Test error')
      const errorKey = `${error.name}:${error.code}`

      errorAnalytics.trackError(error, 'test', 'user1')
      errorAnalytics.trackError(error, 'test', 'user2')
      errorAnalytics.trackError(error, 'test', 'user1') // Duplicate user

      const impact = errorAnalytics.getErrorImpact(errorKey)
      expect(impact.userCount).toBe(2)
    })

    it('maintains limits on stored data', () => {
      const error = new AppError('Test error')
      const errorKey = `${error.name}:${error.code}`

      // Add more contexts than the limit
      for (let i = 0; i < 150; i++) {
        errorAnalytics.trackError(error, `context${i}`)
      }

      const metrics = errorAnalytics.getErrorMetrics()
      expect(metrics[errorKey].contexts.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Error Recovery', () => {
    it('calculates recovery rate correctly', () => {
      const errorKey = 'test-error'
      
      // Add 3 error occurrences
      errorAnalytics.trackError(errorKey, new Error('Test error'))
      errorAnalytics.trackError(errorKey, new Error('Test error'))
      errorAnalytics.trackError(errorKey, new Error('Test error'))
      
      // Mark 2 as recovered
      errorAnalytics.markErrorAsRecovered(errorKey)
      errorAnalytics.markErrorAsRecovered(errorKey)

      const impact = errorAnalytics.getErrorImpact(errorKey)
      expect(impact.recoveryRate).toBeCloseTo(0.67, 2) // 2 recoveries out of 3 occurrences
      expect(impact.avgResolutionTime).toBeCloseTo(4000, 0)
    })
  })

  describe('Trend Analysis', () => {
    it('tracks error trends over time', () => {
      const errorKey = 'test-error'
      
      // Add errors at different times
      jest.useFakeTimers()
      
      errorAnalytics.trackError(errorKey, new Error('Error 1'))
      jest.advanceTimersByTime(3600000) // 1 hour
      
      errorAnalytics.trackError(errorKey, new Error('Error 2'))
      jest.advanceTimersByTime(3600000)
      
      errorAnalytics.trackError(errorKey, new Error('Error 3'))
      
      const trends = errorAnalytics.getTrends()
      expect(Array.isArray(trends)).toBe(true)
      expect(trends).toHaveLength(3)
      expect(trends[0].count).toBe(1)
      expect(trends[0].impactedUsers).toBe(1)
      
      jest.useRealTimers()
    })

    it('filters trends by category and severity', () => {
      // Add errors with different categories and severities
      errorAnalytics.trackError('network-error', new Error('Network failed'), {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH
      })
      
      errorAnalytics.trackError('auth-error', new Error('Auth failed'), {
        category: ErrorCategory.AUTH,
        severity: ErrorSeverity.MEDIUM
      })

      const networkTrends = errorAnalytics.getTrends({ category: ErrorCategory.NETWORK })
      const authTrends = errorAnalytics.getTrends({ category: ErrorCategory.AUTH })
      const highSeverityTrends = errorAnalytics.getTrends({ severity: ErrorSeverity.HIGH })

      expect(Array.isArray(networkTrends)).toBe(true)
      expect(Array.isArray(authTrends)).toBe(true)
      expect(Array.isArray(highSeverityTrends)).toBe(true)
      
      expect(networkTrends).toHaveLength(1)
      expect(authTrends).toHaveLength(1)
      expect(highSeverityTrends).toHaveLength(1)
    })
  })

  describe('Error Impact', () => {
    it('tracks impacted users correctly', () => {
      const errorKey = 'test-error'
      
      // Track errors for different users
      errorAnalytics.trackError(errorKey, new Error('User 1 error'), { userId: 'user1' })
      errorAnalytics.trackError(errorKey, new Error('User 2 error'), { userId: 'user2' })
      errorAnalytics.trackError(errorKey, new Error('User 1 error again'), { userId: 'user1' })

      const impact = errorAnalytics.getErrorImpact(errorKey)
      expect(impact.userCount).toBe(2) // Should count unique users
    })

    it('maintains limits on stored data', () => {
      const errorKey = 'test-error'
      
      // Add more than the limit of error contexts
      for (let i = 0; i < 150; i++) {
        errorAnalytics.trackError(errorKey, new Error(`Error ${i}`))
      }

      const metrics = errorAnalytics.getErrorMetrics()
      expect(metrics[errorKey].contexts).toBeDefined()
      expect(metrics[errorKey].contexts.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Error Impact Analysis', () => {
    it('provides comprehensive error impact metrics', async () => {
      const error = new NetworkError('API timeout')
      const errorKey = `${error.name}:${error.code}`

      // Create error occurrences across different hours
      jest.setSystemTime(new Date('2024-01-01T01:00:00Z'))
      await errorAnalytics.trackError(error, 'api.users', 'user1')
      await errorAnalytics.updateErrorResolution(errorKey, 5000, true)

      jest.setSystemTime(new Date('2024-01-01T02:00:00Z'))
      await errorAnalytics.trackError(error, 'api.orders', 'user2')
      await errorAnalytics.updateErrorResolution(errorKey, 3000, false)

      jest.setSystemTime(new Date('2024-01-01T02:30:00Z'))
      await errorAnalytics.trackError(error, 'api.users', 'user3')
      await errorAnalytics.updateErrorResolution(errorKey, 4000, true)

      const impact = await errorAnalytics.getErrorImpact(errorKey)

      // Check resolution metrics
      expect(impact.resolutionMetrics.totalAttempts).toBe(3)
      expect(impact.resolutionMetrics.successRate).toBeCloseTo(0.67, 2)
      expect(impact.resolutionMetrics.maxResolutionTime).toBe(5000)
      expect(impact.resolutionMetrics.minResolutionTime).toBe(3000)
      expect(impact.resolutionMetrics.consecutiveFailures).toBe(0)
      expect(impact.resolutionMetrics.lastRecoveryTime).not.toBeNull()

      // Check trend analysis
      expect(impact.trendAnalysis.hourlyDistribution).toHaveProperty('01')
      expect(impact.trendAnalysis.hourlyDistribution).toHaveProperty('02')
      expect(impact.trendAnalysis.totalOccurrences).toBe(3)
      expect(impact.trendAnalysis.peakUserCount).toBe(2) // 2 users in hour 02
      expect(impact.trendAnalysis.recoveryTrend).toBeGreaterThan(0)

      // Check context analysis
      expect(impact.contextAnalysis.uniqueContexts).toBe(2)
      expect(impact.contextAnalysis.topContexts).toContain('api.users')
      expect(impact.contextAnalysis.topContexts).toContain('api.orders')
    })

    it('handles edge cases in error impact analysis', async () => {
      const error = new AppError('Test error')
      const errorKey = `${error.name}:${error.code}`

      // Test with no resolution attempts
      const emptyImpact = await errorAnalytics.getErrorImpact(errorKey)
      expect(emptyImpact.resolutionMetrics.totalAttempts).toBe(0)
      expect(emptyImpact.resolutionMetrics.successRate).toBe(0)
      expect(emptyImpact.resolutionMetrics.minResolutionTime).toBe(0)
      expect(emptyImpact.contextAnalysis.uniqueContexts).toBe(0)

      // Test with single failed attempt
      await errorAnalytics.trackError(error, 'test.context', 'user1')
      await errorAnalytics.updateErrorResolution(errorKey, 1000, false)
      
      const singleFailureImpact = await errorAnalytics.getErrorImpact(errorKey)
      expect(singleFailureImpact.resolutionMetrics.consecutiveFailures).toBe(1)
      expect(singleFailureImpact.resolutionMetrics.successRate).toBe(0)
      expect(singleFailureImpact.trendAnalysis.recoveryTrend).toBe(0)

      // Test with rapid consecutive failures
      for (let i = 0; i < 5; i++) {
        await errorAnalytics.trackError(error, `test.context.${i}`, `user${i}`)
        await errorAnalytics.updateErrorResolution(errorKey, 1000, false)
      }

      const multipleFailuresImpact = await errorAnalytics.getErrorImpact(errorKey)
      expect(multipleFailuresImpact.resolutionMetrics.consecutiveFailures).toBe(5)
      expect(multipleFailuresImpact.contextAnalysis.uniqueContexts).toBe(6) // including initial context
    })

    it('calculates accurate recovery trends', async () => {
      const error = new ValidationError('Invalid input')
      const errorKey = `${error.name}:${error.code}`

      // First hour: 2 successes out of 3 attempts
      jest.setSystemTime(new Date('2024-01-01T01:00:00Z'))
      await errorAnalytics.trackError(error, 'form.submit', 'user1')
      await errorAnalytics.updateErrorResolution(errorKey, 2000, true)
      await errorAnalytics.trackError(error, 'form.submit', 'user2')
      await errorAnalytics.updateErrorResolution(errorKey, 3000, false)
      await errorAnalytics.trackError(error, 'form.submit', 'user3')
      await errorAnalytics.updateErrorResolution(errorKey, 1000, true)

      // Second hour: 3 successes out of 4 attempts
      jest.setSystemTime(new Date('2024-01-01T02:00:00Z'))
      for (let i = 0; i < 4; i++) {
        await errorAnalytics.trackError(error, 'form.submit', `user${i + 4}`)
        await errorAnalytics.updateErrorResolution(errorKey, 2000, i !== 1) // One failure
      }

      const impact = await errorAnalytics.getErrorImpact(errorKey)
      
      // Check recovery trend (improvement from 66.7% to 75% success rate)
      expect(impact.trendAnalysis.recoveryTrend).toBeCloseTo(12.5, 1)
      expect(impact.resolutionMetrics.successRate).toBeCloseTo(0.71, 2) // 5 successes out of 7 total
    })

    it('maintains data limits and handles overflows', async () => {
      const error = new AppError('Test error')
      const errorKey = `${error.name}:${error.code}`

      // Add more contexts than the limit
      for (let i = 0; i < 150; i++) {
        await errorAnalytics.trackError(error, `context.${i}`, `user${i % 10}`)
      }

      const impact = await errorAnalytics.getErrorImpact(errorKey)
      
      // Check that limits are maintained
      expect(impact.contextAnalysis.uniqueContexts).toBeLessThanOrEqual(100)
      expect(impact.contextAnalysis.topContexts.length).toBeLessThanOrEqual(5)
      expect(impact.userCount).toBeLessThanOrEqual(10) // Should only have 10 unique users
    })
  })

  describe('Error Analytics Advanced Features', () => {
    it('persists and retrieves error data correctly', async () => {
      const error1 = new NetworkError('API timeout')
      const error2 = new ValidationError('Invalid input')
      const errorKey1 = `${error1.name}:${error1.code}`
      const errorKey2 = `${error2.name}:${error2.code}`

      // Create errors and track them
      await errorAnalytics.trackError(error1, 'api.users', 'user1')
      await errorAnalytics.updateErrorResolution(errorKey1, 2000, true)
      await errorAnalytics.trackError(error2, 'form.submit', 'user2')
      await errorAnalytics.updateErrorResolution(errorKey2, 3000, false)

      // Simulate service restart by creating new instance
      const newAnalytics = ErrorAnalyticsService.getInstance()
      await newAnalytics.initialize()

      // Verify data persisted
      const metrics1 = await newAnalytics.getErrorMetrics(errorKey1)
      const metrics2 = await newAnalytics.getErrorMetrics(errorKey2)

      expect(metrics1.totalAttempts).toBe(1)
      expect(metrics1.successfulAttempts).toBe(1)
      expect(metrics2.totalAttempts).toBe(1)
      expect(metrics2.successfulAttempts).toBe(0)
    })

    it('performs time-based data cleanup', async () => {
      const error = new AppError('Test error')
      const errorKey = `${error.name}:${error.code}`

      // Create old error data
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))
      await errorAnalytics.trackError(error, 'old.context', 'user1')
      await errorAnalytics.updateErrorResolution(errorKey, 1000, true)

      // Move forward 8 days
      jest.setSystemTime(new Date('2024-01-09T00:00:00Z'))
      
      // Trigger cleanup by tracking new error
      await errorAnalytics.trackError(error, 'new.context', 'user2')
      
      const trends = await errorAnalytics.getErrorTrends(errorKey)
      expect(trends.length).toBe(1)
      expect(trends[0].context).toBe('new.context')
    })

    it('analyzes errors across different types', async () => {
      const networkError = new NetworkError('Connection failed')
      const validationError = new ValidationError('Invalid data')
      const appError = new AppError('Application error')

      // Track multiple errors
      await Promise.all([
        errorAnalytics.trackError(networkError, 'api', 'user1'),
        errorAnalytics.trackError(validationError, 'form', 'user1'),
        errorAnalytics.trackError(appError, 'app', 'user2')
      ])

      // Get all error metrics
      const allMetrics = await errorAnalytics.getAllErrorMetrics()
      
      expect(Object.keys(allMetrics)).toHaveLength(3)
      expect(allMetrics[`${networkError.name}:${networkError.code}`]).toBeDefined()
      expect(allMetrics[`${validationError.name}:${validationError.code}`]).toBeDefined()
      expect(allMetrics[`${appError.name}:${appError.code}`]).toBeDefined()

      // Check cross-error impact
      const crossImpact = await errorAnalytics.getErrorsImpactingSameUsers()
      expect(crossImpact).toHaveLength(2) // networkError and validationError affect same user
    })

    it('handles high load scenarios', async () => {
      const error = new AppError('High load test')
      const errorKey = `${error.name}:${error.code}`
      const operations = []

      // Generate 1000 rapid error tracks
      for (let i = 0; i < 1000; i++) {
        operations.push(
          errorAnalytics.trackError(
            error,
            `context.${i % 10}`,
            `user${i % 100}`
          )
        )
      }

      // Track all errors concurrently
      await Promise.all(operations)

      const impact = await errorAnalytics.getErrorImpact(errorKey)
      
      // Verify data integrity under load
      expect(impact.userCount).toBeLessThanOrEqual(100) // Should have max 100 unique users
      expect(impact.contextAnalysis.uniqueContexts).toBeLessThanOrEqual(10) // Should have max 10 unique contexts
      expect(impact.trendAnalysis.totalOccurrences).toBe(1000)
    })

    it('maintains data consistency during concurrent operations', async () => {
      const error = new ValidationError('Concurrent test')
      const errorKey = `${error.name}:${error.code}`
      
      // Perform concurrent error tracking and resolution
      await Promise.all([
        errorAnalytics.trackError(error, 'context.1', 'user1'),
        errorAnalytics.trackError(error, 'context.2', 'user2'),
        errorAnalytics.updateErrorResolution(errorKey, 1000, true),
        errorAnalytics.trackError(error, 'context.3', 'user3'),
        errorAnalytics.updateErrorResolution(errorKey, 2000, false)
      ])

      const metrics = await errorAnalytics.getErrorMetrics(errorKey)
      
      // Verify data consistency
      expect(metrics.totalAttempts).toBe(2) // Should count both resolution attempts
      expect(metrics.successfulAttempts).toBe(1) // Should count one successful attempt
      expect(metrics.contexts.size).toBe(3) // Should have all three contexts
    })
  })

  describe('Error Analytics Advanced Analysis', () => {
    it('categorizes errors by severity and type', async () => {
      // Create errors with different severities
      const criticalError = new NetworkError('Database connection lost', ErrorSeverity.CRITICAL)
      const highError = new ValidationError('Security validation failed', ErrorSeverity.HIGH)
      const mediumError = new AppError('Feature unavailable', ErrorSeverity.MEDIUM)
      const lowError = new ValidationError('Form validation error', ErrorSeverity.LOW)

      // Track all errors
      await Promise.all([
        errorAnalytics.trackError(criticalError, 'database', 'user1'),
        errorAnalytics.trackError(highError, 'security', 'user2'),
        errorAnalytics.trackError(mediumError, 'feature', 'user3'),
        errorAnalytics.trackError(lowError, 'form', 'user4')
      ])

      // Get error distribution by severity
      const distribution = await errorAnalytics.getErrorDistributionBySeverity()
      
      expect(distribution.CRITICAL).toBe(1)
      expect(distribution.HIGH).toBe(1)
      expect(distribution.MEDIUM).toBe(1)
      expect(distribution.LOW).toBe(1)

      // Get errors by category
      const categories = await errorAnalytics.getErrorsByCategory()
      expect(categories.NETWORK).toHaveLength(1)
      expect(categories.VALIDATION).toHaveLength(2)
      expect(categories.APPLICATION).toHaveLength(1)
    })

    it('manages storage quota and performs cleanup', async () => {
      const error = new AppError('Storage test')
      const errorKey = `${error.name}:${error.code}`

      // Fill storage with error contexts
      for (let i = 0; i < 200; i++) {
        await errorAnalytics.trackError(
          error,
          `context.${i}`,
          `user${i % 10}`,
          { data: 'x'.repeat(1000) } // Add large context data
        )
      }

      // Check storage limits
      const metrics = await errorAnalytics.getErrorMetrics(errorKey)
      expect(metrics.contexts.size).toBeLessThanOrEqual(100)
      
      // Verify oldest contexts were removed
      const contexts = Array.from(metrics.contexts)
      expect(contexts[0]).toMatch(/context.1[0-9][0-9]/) // Should contain newer contexts

      // Check storage quota
      const quota = await errorAnalytics.getStorageQuota()
      expect(quota.used).toBeLessThan(quota.total)
    })

    it('detects correlated errors', async () => {
      // Create a chain of related errors
      const dbError = new NetworkError('Database timeout')
      const apiError = new NetworkError('API error')
      const validationError = new ValidationError('Data validation failed')

      // Track errors in sequence with timing
      jest.setSystemTime(new Date('2024-01-01T10:00:00Z'))
      await errorAnalytics.trackError(dbError, 'database', 'user1')
      
      jest.setSystemTime(new Date('2024-01-01T10:00:01Z'))
      await errorAnalytics.trackError(apiError, 'api', 'user1')
      
      jest.setSystemTime(new Date('2024-01-01T10:00:02Z'))
      await errorAnalytics.trackError(validationError, 'validation', 'user1')

      // Get error correlations
      const correlations = await errorAnalytics.getErrorCorrelations()
      
      expect(correlations).toHaveLength(1) // Should find one correlation chain
      expect(correlations[0].errors).toHaveLength(3)
      expect(correlations[0].timespan).toBeLessThanOrEqual(3000) // 3 seconds
    })

    it('aggregates metrics over time periods', async () => {
      const error = new AppError('Aggregation test')
      const errorKey = `${error.name}:${error.code}`

      // Create errors across different time periods
      const dates = [
        '2024-01-01T00:00:00Z', // Day 1
        '2024-01-01T12:00:00Z',
        '2024-01-02T00:00:00Z', // Day 2
        '2024-01-02T12:00:00Z',
        '2024-01-03T00:00:00Z', // Day 3
      ]

      for (const date of dates) {
        jest.setSystemTime(new Date(date))
        await errorAnalytics.trackError(error, 'test', `user${date}`)
        await errorAnalytics.updateErrorResolution(errorKey, 1000, true)
      }

      // Get daily aggregation
      const dailyMetrics = await errorAnalytics.getAggregatedMetrics(errorKey, 'daily')
      expect(Object.keys(dailyMetrics)).toHaveLength(3) // 3 days
      expect(dailyMetrics['2024-01-01'].occurrences).toBe(2)
      expect(dailyMetrics['2024-01-02'].occurrences).toBe(2)
      expect(dailyMetrics['2024-01-03'].occurrences).toBe(1)

      // Get hourly aggregation for day 1
      const hourlyMetrics = await errorAnalytics.getAggregatedMetrics(errorKey, 'hourly', '2024-01-01')
      expect(hourlyMetrics['00'].occurrences).toBe(1)
      expect(hourlyMetrics['12'].occurrences).toBe(1)
    })
  })

  describe('Error Analytics Integration', () => {
    it('provides accurate metrics for complex error scenarios', async () => {
      // Generate test data for multiple error types
      const { errorKey: networkErrorKey } = await generateTestData(errorAnalytics, {
        errorType: 'network',
        message: 'API timeout',
        context: 'api.users',
        userCount: 5,
        attempts: 10,
        successRate: 0.7
      })

      const { errorKey: validationErrorKey } = await generateTestData(errorAnalytics, {
        errorType: 'validation',
        message: 'Invalid input',
        context: 'form.submit',
        userCount: 3,
        attempts: 6,
        successRate: 0.5
      })

      // Verify network error metrics
      const networkMetrics = await errorAnalytics.getErrorMetrics(networkErrorKey)
      expectMetricsToMatch(networkMetrics, {
        totalAttempts: 10,
        successfulAttempts: 7,
        uniqueUsers: 5
      })

      // Verify validation error metrics
      const validationMetrics = await errorAnalytics.getErrorMetrics(validationErrorKey)
      expectMetricsToMatch(validationMetrics, {
        totalAttempts: 6,
        successfulAttempts: 3,
        uniqueUsers: 3
      })

      // Verify cross-error analysis
      const crossImpact = await errorAnalytics.getErrorsImpactingSameUsers()
      expect(crossImpact.length).toBeGreaterThan(0, 'Expected to find errors affecting same users')
    })

    it('maintains data integrity during complex operations', async () => {
      const startTime = new Date('2024-01-01T00:00:00Z')
      jest.setSystemTime(startTime)

      // Generate concurrent error data
      const operations = []
      const errorTypes = ['network', 'validation', 'app']
      
      for (const type of errorTypes) {
        operations.push(
          generateTestData(errorAnalytics, {
            errorType: type,
            message: `${type} error`,
            context: `${type}.test`,
            userCount: 3,
            attempts: 5,
            successRate: 0.6
          })
        )
      }

      await Promise.all(operations)

      // Advance time and add more data
      jest.setSystemTime(new Date(startTime.getTime() + 24 * 60 * 60 * 1000))
      
      await generateTestData(errorAnalytics, {
        errorType: 'network',
        message: 'new network error',
        context: 'api.new',
        userCount: 2,
        attempts: 3,
        successRate: 0.7
      })

      // Verify data integrity
      const distribution = await errorAnalytics.getErrorDistributionBySeverity()
      expect(distribution.MEDIUM).toBe(4, 'Expected 4 medium severity errors')

      const categories = await errorAnalytics.getErrorsByCategory()
      expect(categories.NETWORK).toHaveLength(2, 'Expected 2 network errors')
      expect(categories.VALIDATION).toHaveLength(1, 'Expected 1 validation error')
      expect(categories.APPLICATION).toHaveLength(1, 'Expected 1 application error')
    })
  })
}) 