import { errorAnalytics, ErrorSeverity, ErrorCategory } from '@/lib/error-analytics'
import { AppError, NetworkError, AuthError, ValidationError } from '@/lib/errors'

describe('ErrorAnalyticsService', () => {
  beforeEach(() => {
    errorAnalytics.clearAnalytics()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
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
}) 