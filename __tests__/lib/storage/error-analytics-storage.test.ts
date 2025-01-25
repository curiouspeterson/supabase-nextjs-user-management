import { LocalStorageAdapter, ErrorAnalyticsData } from '@/lib/storage/error-analytics-storage'
import { ErrorSeverity, ErrorCategory } from '@/lib/error-analytics'

describe('LocalStorageAdapter', () => {
  let storage: LocalStorageAdapter
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    storage = new LocalStorageAdapter()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('initializes with empty data when no data exists', async () => {
      await storage.initialize()
      const data = await storage.getData()
      
      expect(data.version).toBe(1)
      expect(data.metrics).toEqual({})
      expect(data.trends).toEqual([])
    })

    it('loads existing data during initialization', async () => {
      const testData: ErrorAnalyticsData = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        metrics: {
          'TestError:TEST': {
            count: 1,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            contexts: new Set(['test']),
            userAgents: new Set(['test-agent']),
            urls: new Set(['http://test.com']),
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.UNKNOWN,
            impactedUsers: new Set(['user1']),
            recoveryRate: 0,
            avgResolutionTime: 0,
            relatedErrors: new Set()
          }
        },
        trends: [{
          period: new Date().toISOString(),
          count: 1,
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.UNKNOWN,
          impactedUsers: 1
        }]
      }

      await storage.saveData(testData)
      await storage.initialize()
      const loadedData = await storage.getData()

      expect(loadedData.version).toBe(testData.version)
      expect(loadedData.metrics['TestError:TEST'].count).toBe(1)
      expect(loadedData.trends).toHaveLength(1)
    })
  })

  describe('data operations', () => {
    it('saves and retrieves data correctly', async () => {
      const testData: ErrorAnalyticsData = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        metrics: {},
        trends: []
      }

      await storage.saveData(testData)
      const retrievedData = await storage.getData()

      expect(retrievedData).toEqual(testData)
    })

    it('handles large data by chunking', async () => {
      // Create large data object
      const metrics: Record<string, any> = {}
      for (let i = 0; i < 1000; i++) {
        metrics[`Error:${i}`] = {
          count: i,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          contexts: new Set(['test']),
          userAgents: new Set(['test-agent']),
          urls: new Set(['http://test.com']),
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.UNKNOWN,
          impactedUsers: new Set(['user1']),
          recoveryRate: 0,
          avgResolutionTime: 0,
          relatedErrors: new Set()
        }
      }

      const largeData: ErrorAnalyticsData = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        metrics,
        trends: []
      }

      await storage.saveData(largeData)
      const retrievedData = await storage.getData()

      expect(retrievedData.version).toBe(largeData.version)
      expect(Object.keys(retrievedData.metrics)).toHaveLength(1000)
    })

    it('clears data correctly', async () => {
      const testData: ErrorAnalyticsData = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        metrics: {
          'TestError:TEST': {
            count: 1,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            contexts: new Set(['test']),
            userAgents: new Set(['test-agent']),
            urls: new Set(['http://test.com']),
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.UNKNOWN,
            impactedUsers: new Set(['user1']),
            recoveryRate: 0,
            avgResolutionTime: 0,
            relatedErrors: new Set()
          }
        },
        trends: []
      }

      await storage.saveData(testData)
      await storage.clear()

      await expect(storage.getData()).rejects.toThrow('No data found')
    })
  })

  describe('error handling', () => {
    it('handles quota exceeded errors by rotating storage', async () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      const mockSetItem = jest.fn()
        .mockImplementationOnce(() => { throw new Error('QuotaExceededError') })
        .mockImplementationOnce(() => {})

      localStorage.setItem = mockSetItem

      const testData: ErrorAnalyticsData = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        metrics: {},
        trends: []
      }

      await storage.saveData(testData)

      expect(mockSetItem).toHaveBeenCalledTimes(2)

      // Restore original implementation
      localStorage.setItem = originalSetItem
    })

    it('handles storage errors gracefully', async () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn(() => { throw new Error('Storage error') })

      await expect(storage.getData()).rejects.toThrow('Failed to get error analytics data')

      // Restore original implementation
      localStorage.getItem = originalGetItem
    })
  })
}) 