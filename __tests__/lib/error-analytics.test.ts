import { ErrorAnalyticsService } from '@/lib/error-analytics'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

describe('ErrorAnalyticsService', () => {
  let service: ErrorAnalyticsService
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        insert: jest.fn(() => Promise.resolve({ error: null })),
        update: jest.fn(() => Promise.resolve({ error: null })),
        delete: jest.fn(() => Promise.resolve({ error: null })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }

  beforeEach(async () => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase)
    service = ErrorAnalyticsService.getInstance()
    await service.initialize()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default config when no config exists', async () => {
      expect(service.getSupabaseClient()).toBe(mockSupabase)
      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_config')
    })

    it('handles initialization errors gracefully', async () => {
      (createClient as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create client')
      })

      await expect(ErrorAnalyticsService.getInstance().initialize())
        .rejects
        .toThrow('Failed to initialize Supabase client')
    })
  })

  describe('error tracking', () => {
    it('tracks errors with context', async () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.ERROR,
        ErrorCategory.MONITORING
      )

      await service.trackError(error, {
        component: 'test',
        errorMessage: 'Test error message'
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_data')
      expect(mockSupabase.from().select().eq().maybeSingle).toHaveBeenCalled()
    })

    it('batches multiple errors', async () => {
      const error1 = new AppError(
        'Error 1',
        'ERROR_1',
        ErrorSeverity.ERROR,
        ErrorCategory.MONITORING
      )

      const error2 = new AppError(
        'Error 2',
        'ERROR_2',
        ErrorSeverity.ERROR,
        ErrorCategory.MONITORING
      )

      await Promise.all([
        service.trackError(error1),
        service.trackError(error2)
      ])

      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_data')
    })
  })

  describe('error resolution', () => {
    it('resolves errors with notes', async () => {
      await service.resolveError('test-error-id', 'Resolution notes')

      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_data')
      expect(mockSupabase.from().select().eq().maybeSingle).toHaveBeenCalled()
    })

    it('handles resolution errors gracefully', async () => {
      mockSupabase.from().select().eq().maybeSingle.mockImplementation(() => 
        Promise.resolve({ error: new Error('Failed to resolve') })
      )

      await expect(service.resolveError('test-error-id'))
        .rejects
        .toThrow('Failed to resolve error')
    })
  })

  describe('trend analysis', () => {
    it('retrieves error trends', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-02')

      await service.getTrends(startDate, endDate)

      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_trends')
      expect(mockSupabase.from().select().eq().gte).toHaveBeenCalled()
    })

    it('handles missing trend data gracefully', async () => {
      mockSupabase.from().select().eq().gte.mockImplementation(() =>
        Promise.resolve({ data: null, error: null })
      )

      const trends = await service.getTrends()
      expect(trends).toEqual([])
    })
  })

  describe('cleanup', () => {
    it('cleans up old data', async () => {
      await service.cleanup()

      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_data')
      expect(mockSupabase.from).toHaveBeenCalledWith('error_analytics_trends')
    })

    it('handles cleanup errors gracefully', async () => {
      mockSupabase.from().select().eq().maybeSingle.mockImplementation(() =>
        Promise.resolve({ error: new Error('Cleanup failed') })
      )

      await expect(service.cleanup())
        .rejects
        .toThrow('Failed to cleanup error analytics')
    })
  })
}) 