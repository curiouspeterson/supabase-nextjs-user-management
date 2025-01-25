import { AppError } from '@/lib/errors'
import { StorageAdapter, LocalStorageAdapter } from './storage/error-analytics-storage'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  UI = 'ui',
  NETWORK = 'network',
  AUTH = 'auth',
  DATA = 'data',
  VALIDATION = 'validation',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  UNKNOWN = 'unknown'
}

export interface ErrorMetrics {
  count: number
  firstSeen: string
  lastSeen: string
  contexts: Set<string>
  userAgents: Set<string>
  urls: Set<string>
  severity: ErrorSeverity
  category: ErrorCategory
  impactedUsers: Set<string>
  recoveryRate: number // percentage of successful retries
  avgResolutionTime: number // milliseconds
  relatedErrors: Set<string> // keys of related errors
}

export interface ErrorTrend {
  period: string
  count: number
  severity: ErrorSeverity
  category: ErrorCategory
  impactedUsers: number
}

interface ErrorAnalytics {
  [key: string]: ErrorMetrics
}

class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService
  private analytics: ErrorAnalytics = {}
  private trends: ErrorTrend[] = []
  private storage: StorageAdapter
  private initialized = false
  private readonly maxContexts = 100
  private readonly maxUserAgents = 50
  private readonly maxUrls = 100
  private readonly maxTrends = 1000
  private readonly trendPeriodMs = 3600000 // 1 hour

  private constructor() {
    this.storage = new LocalStorageAdapter()
  }

  static getInstance(): ErrorAnalyticsService {
    if (!ErrorAnalyticsService.instance) {
      ErrorAnalyticsService.instance = new ErrorAnalyticsService()
    }
    return ErrorAnalyticsService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      await this.storage.initialize()
      const data = await this.storage.getData()
      this.analytics = data.metrics
      this.trends = data.trends
      this.initialized = true
    } catch (error: unknown) {
      console.error('Failed to initialize error analytics:', error instanceof Error ? error.message : 'Unknown error')
      // Continue with empty state if initialization fails
      this.analytics = {}
      this.trends = []
      this.initialized = true
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  private determineSeverity(error: AppError): ErrorSeverity {
    if (error.statusCode >= 500) return ErrorSeverity.HIGH
    if (error.statusCode >= 400) return ErrorSeverity.MEDIUM
    if (error.name.includes('Network')) return ErrorSeverity.HIGH
    if (error.name.includes('Security')) return ErrorSeverity.CRITICAL
    return ErrorSeverity.LOW
  }

  private determineCategory(error: AppError): ErrorCategory {
    if (error.name.includes('Network')) return ErrorCategory.NETWORK
    if (error.name.includes('Auth')) return ErrorCategory.AUTH
    if (error.name.includes('Validation')) return ErrorCategory.VALIDATION
    if (error.name.includes('Database')) return ErrorCategory.DATA
    if (error.name.includes('Performance')) return ErrorCategory.PERFORMANCE
    if (error.name.includes('Security')) return ErrorCategory.SECURITY
    if (error.name.includes('UI')) return ErrorCategory.UI
    return ErrorCategory.UNKNOWN
  }

  async trackError(error: AppError, context?: string, userId?: string): Promise<void> {
    await this.ensureInitialized()
    
    const errorKey = this.getErrorKey(error)
    const now = new Date().toISOString()
    const severity = this.determineSeverity(error)
    const category = this.determineCategory(error)

    if (!this.analytics[errorKey]) {
      this.analytics[errorKey] = {
        count: 0,
        firstSeen: now,
        lastSeen: now,
        contexts: new Set(),
        userAgents: new Set(),
        urls: new Set(),
        severity,
        category,
        impactedUsers: new Set(),
        recoveryRate: 0,
        avgResolutionTime: 0,
        relatedErrors: new Set()
      }
    }

    const metrics = this.analytics[errorKey]
    metrics.count++
    metrics.lastSeen = now
    
    if (context) {
      this.addToSetWithLimit(metrics.contexts, context, this.maxContexts)
    }

    if (userId) {
      metrics.impactedUsers.add(userId)
    }

    if (typeof window !== 'undefined') {
      this.addToSetWithLimit(metrics.userAgents, window.navigator.userAgent, this.maxUserAgents)
      this.addToSetWithLimit(metrics.urls, window.location.href, this.maxUrls)
    }

    this.updateTrends(errorKey, severity, category, userId)
    this.findRelatedErrors(errorKey, error)
    
    await this.persistData()
  }

  private updateTrends(
    errorKey: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    userId?: string
  ) {
    const now = new Date()
    const period = new Date(
      Math.floor(now.getTime() / this.trendPeriodMs) * this.trendPeriodMs
    ).toISOString()

    const existingTrend = this.trends.find(t => 
      t.period === period && 
      t.severity === severity && 
      t.category === category
    )

    if (existingTrend) {
      existingTrend.count++
      if (userId) existingTrend.impactedUsers++
    } else {
      this.trends.push({
        period,
        count: 1,
        severity,
        category,
        impactedUsers: userId ? 1 : 0
      })
    }

    // Keep trends array size under limit
    if (this.trends.length > this.maxTrends) {
      this.trends = this.trends.slice(-this.maxTrends)
    }
  }

  private findRelatedErrors(errorKey: string, error: AppError) {
    const metrics = this.analytics[errorKey]
    
    // Find errors with similar characteristics
    Object.entries(this.analytics).forEach(([key, otherMetrics]) => {
      if (key !== errorKey) {
        const sameCategory = metrics.category === otherMetrics.category
        const sameSeverity = metrics.severity === otherMetrics.severity
        const sharedContexts = Array.from(metrics.contexts)
          .some(ctx => otherMetrics.contexts.has(ctx))
        const sharedUrls = Array.from(metrics.urls)
          .some(url => otherMetrics.urls.has(url))

        if ((sameCategory && sameSeverity) || (sharedContexts && sharedUrls)) {
          metrics.relatedErrors.add(key)
          otherMetrics.relatedErrors.add(errorKey)
        }
      }
    })
  }

  updateErrorResolution(errorKey: string, resolutionTime: number, wasSuccessful: boolean) {
    const metrics = this.analytics[errorKey]
    if (!metrics) return

    // Update recovery rate
    const totalAttempts = metrics.count
    const successfulAttempts = Math.round(metrics.recoveryRate * totalAttempts) + (wasSuccessful ? 1 : 0)
    metrics.recoveryRate = successfulAttempts / (totalAttempts + 1)

    // Update average resolution time
    metrics.avgResolutionTime = 
      (metrics.avgResolutionTime * totalAttempts + resolutionTime) / (totalAttempts + 1)
  }

  async getErrorMetrics(): Promise<Record<string, {
    count: number
    firstSeen: string
    lastSeen: string
    contexts: string[]
    userAgents: string[]
    urls: string[]
    severity: ErrorSeverity
    category: ErrorCategory
    impactedUsers: number
    recoveryRate: number
    avgResolutionTime: number
    relatedErrors: string[]
    frequency: number
  }>> {
    await this.ensureInitialized()
    const result: Record<string, any> = {}
    const now = new Date().getTime()

    for (const [key, metrics] of Object.entries(this.analytics)) {
      const firstSeen = new Date(metrics.firstSeen).getTime()
      const hours = Math.max(1, (now - firstSeen) / (1000 * 60 * 60))
      
      result[key] = {
        count: metrics.count,
        firstSeen: metrics.firstSeen,
        lastSeen: metrics.lastSeen,
        contexts: Array.from(metrics.contexts),
        userAgents: Array.from(metrics.userAgents),
        urls: Array.from(metrics.urls),
        severity: metrics.severity,
        category: metrics.category,
        impactedUsers: metrics.impactedUsers.size,
        recoveryRate: metrics.recoveryRate,
        avgResolutionTime: metrics.avgResolutionTime,
        relatedErrors: Array.from(metrics.relatedErrors),
        frequency: Number((metrics.count / hours).toFixed(2))
      }
    }

    return result
  }

  async getTrends(options?: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    hours?: number
  }): Promise<ErrorTrend[]> {
    await this.ensureInitialized()
    const cutoff = new Date(Date.now() - (options?.hours || 24) * 60 * 60 * 1000)
    
    return this.trends
      .filter(trend => {
        const matchesCategory = !options?.category || trend.category === options.category
        const matchesSeverity = !options?.severity || trend.severity === options.severity
        const isRecent = new Date(trend.period) >= cutoff
        return matchesCategory && matchesSeverity && isRecent
      })
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  getErrorsByFrequency(): [string, number][] {
    const metrics = this.getErrorMetrics()
    return Object.entries(metrics)
      .map(([key, data]): [string, number] => [key, data.frequency])
      .sort((a, b) => b[1] - a[1])
  }

  getErrorsByCount(): [string, number][] {
    return Object.entries(this.analytics)
      .map(([key, data]): [string, number] => [key, data.count])
      .sort((a, b) => b[1] - a[1])
  }

  getErrorsBySeverity(severity: ErrorSeverity): string[] {
    return Object.entries(this.analytics)
      .filter(([_, data]) => data.severity === severity)
      .map(([key]) => key)
  }

  getErrorsByCategory(category: ErrorCategory): string[] {
    return Object.entries(this.analytics)
      .filter(([_, data]) => data.category === category)
      .map(([key]) => key)
  }

  getRecentErrors(hours: number = 24): string[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    return Object.entries(this.analytics)
      .filter(([_, data]) => data.lastSeen >= cutoff)
      .map(([key]) => key)
  }

  getRelatedErrors(errorKey: string): string[] {
    return Array.from(this.analytics[errorKey]?.relatedErrors || [])
  }

  getErrorImpact(errorKey: string): {
    userCount: number
    recoveryRate: number
    avgResolutionTime: number
    relatedErrorsCount: number
  } {
    const metrics = this.analytics[errorKey]
    if (!metrics) return {
      userCount: 0,
      recoveryRate: 0,
      avgResolutionTime: 0,
      relatedErrorsCount: 0
    }

    return {
      userCount: metrics.impactedUsers.size,
      recoveryRate: metrics.recoveryRate,
      avgResolutionTime: metrics.avgResolutionTime,
      relatedErrorsCount: metrics.relatedErrors.size
    }
  }

  async clearAnalytics(): Promise<void> {
    await this.ensureInitialized()
    this.analytics = {}
    this.trends = []
    await this.storage.clear()
  }

  private getErrorKey(error: AppError): string {
    return `${error.name}:${error.code}`
  }

  private addToSetWithLimit<T>(set: Set<T>, item: T, limit: number) {
    if (set.size >= limit) {
      const firstItem = set.values().next().value
      set.delete(firstItem)
    }
    set.add(item)
  }

  private async persistData(): Promise<void> {
    try {
      await this.storage.saveData({
        version: 1,
        lastUpdated: new Date().toISOString(),
        metrics: this.analytics,
        trends: this.trends
      })
    } catch (error: unknown) {
      console.error('Failed to persist error analytics:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

// Export singleton instance
export const errorAnalytics = ErrorAnalyticsService.getInstance() 