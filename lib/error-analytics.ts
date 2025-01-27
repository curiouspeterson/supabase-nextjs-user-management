/**
 * Error analytics service for tracking and analyzing application errors
 * @module error-analytics
 */

import { StorageAdapter } from './storage/error-analytics-storage'

/**
 * Enum representing error severity levels
 */
export enum ErrorSeverity {
  /** Low impact errors that don't affect core functionality */
  LOW = 'low',
  /** Medium impact errors that affect some functionality but have workarounds */
  MEDIUM = 'medium',
  /** High impact errors that affect core functionality */
  HIGH = 'high',
  /** Critical errors that require immediate attention */
  CRITICAL = 'critical'
}

/**
 * Enum representing error categories
 */
export enum ErrorCategory {
  /** UI-related errors (rendering, state management) */
  UI = 'ui',
  /** Network-related errors (API calls, connectivity) */
  NETWORK = 'network',
  /** Authentication/Authorization errors */
  AUTH = 'auth',
  /** Data-related errors (parsing, validation) */
  DATA = 'data',
  /** Input validation errors */
  VALIDATION = 'validation',
  /** Performance-related errors (timeouts, memory) */
  PERFORMANCE = 'performance',
  /** Security-related errors */
  SECURITY = 'security',
  /** Uncategorized errors */
  UNKNOWN = 'unknown'
}

/**
 * Enum representing error recovery strategies
 */
export enum ErrorRecoveryStrategy {
  /** Retry the failed operation */
  RETRY = 'retry',
  /** Refresh the page */
  REFRESH = 'refresh',
  /** Reset application state and refresh */
  RESET = 'reset',
  /** Use fallback functionality */
  FALLBACK = 'fallback',
  /** No automatic recovery possible */
  NONE = 'none'
}

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  /**
   * Creates a new AppError instance
   * @param message - Error message
   * @param code - Error code for categorization
   * @param severity - Error severity level
   * @param category - Error category
   * @param metadata - Additional error context
   * @param recoveryStrategy - Suggested recovery strategy
   */
  constructor(
    message: string,
    public code: string = 'UNKNOWN',
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public category: ErrorCategory = ErrorCategory.UNKNOWN,
    public metadata: Record<string, any> = {},
    public recoveryStrategy: ErrorRecoveryStrategy = ErrorRecoveryStrategy.RETRY
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(
      message,
      'NETWORK_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK,
      metadata,
      ErrorRecoveryStrategy.RETRY
    )
    this.name = 'NetworkError'
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.VALIDATION,
      metadata,
      ErrorRecoveryStrategy.NONE
    )
    this.name = 'ValidationError'
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(
      message,
      'AUTH_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.AUTH,
      metadata,
      ErrorRecoveryStrategy.REFRESH
    )
    this.name = 'AuthError'
  }
}

/**
 * Data-related errors
 */
export class DataError extends AppError {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(
      message,
      'DATA_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.DATA,
      metadata,
      ErrorRecoveryStrategy.FALLBACK
    )
    this.name = 'DataError'
  }
}

/**
 * Performance-related errors
 */
export class PerformanceError extends AppError {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(
      message,
      'PERFORMANCE_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.PERFORMANCE,
      metadata,
      ErrorRecoveryStrategy.RESET
    )
    this.name = 'PerformanceError'
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends AppError {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(
      message,
      'SECURITY_ERROR',
      ErrorSeverity.CRITICAL,
      ErrorCategory.SECURITY,
      metadata,
      ErrorRecoveryStrategy.NONE
    )
    this.name = 'SecurityError'
  }
}

/**
 * Interface for error metrics data
 */
export interface ErrorMetrics {
  /** Number of times this error occurred */
  count: number
  /** Timestamp of first occurrence */
  firstSeen: string
  /** Timestamp of last occurrence */
  lastSeen: string
  /** Set of contexts where error occurred */
  contexts: Set<string>
  /** Set of user agents that encountered the error */
  userAgents: Set<string>
  /** Set of URLs where error occurred */
  urls: Set<string>
  /** Error severity level */
  severity: ErrorSeverity
  /** Error category */
  category: ErrorCategory
  /** Suggested recovery strategy */
  recoveryStrategy: ErrorRecoveryStrategy
  /** Set of users affected by the error */
  impactedUsers: Set<string>
  /** Success rate of recovery attempts */
  recoveryRate: number
  /** Average time to resolve the error */
  avgResolutionTime: number
  /** Set of related error keys */
  relatedErrors: Set<string>
  /** Number of successful recovery attempts */
  successfulAttempts: number
  /** Total number of recovery attempts */
  totalAttempts: number
  /** Time taken for last resolution attempt */
  lastResolutionTime: number
  /** Maximum resolution time recorded */
  maxResolutionTime: number
  /** Minimum resolution time recorded */
  minResolutionTime: number
  /** Number of consecutive failed attempts */
  consecutiveFailures: number
  /** Timestamp of last successful recovery */
  lastRecoveryTime: string | null
  /** Statistics for each recovery strategy */
  recoveryAttempts: {
    [key in ErrorRecoveryStrategy]: {
      attempts: number
      successes: number
    }
  }
}

export interface ErrorTrend {
  period: string
  count: number
  severity: ErrorSeverity
  category: ErrorCategory
  impactedUsers: Set<string>
}

interface ErrorAnalytics {
  [key: string]: ErrorMetrics
}

interface ErrorImpactAnalysis {
  userCount: number
  recoveryRate: number
  avgResolutionTime: number
  relatedErrorsCount: number
  resolutionMetrics: {
    lastResolutionTime: number
    maxResolutionTime: number
    minResolutionTime: number
    consecutiveFailures: number
    lastRecoveryTime: string | null
    successRate: number
    totalAttempts: number
  }
  trendAnalysis: {
    recentOccurrences: number
    growthRate: number
    peakUserCount: number
    totalOccurrences: number
    hourlyDistribution: { [hour: string]: number }
    recoveryTrend: number
  }
  contextAnalysis: {
    uniqueContexts: number
    topContexts: string[]
    uniqueUrls: number
    topUrls: string[]
  }
}

export class ErrorAnalyticsService {
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
    this.storage = new StorageAdapter()
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
      const data = await this.storage.getData()
      if (data) {
        this.analytics = data.analytics
        this.trends = data.trends
      }
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize error analytics:', error)
      throw error
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  private determineSeverity(error: AppError): ErrorSeverity {
    if (error.severity) return error.severity
    
    // Default severity logic
    if (error instanceof NetworkError) return ErrorSeverity.HIGH
    if (error instanceof ValidationError) return ErrorSeverity.MEDIUM
    return ErrorSeverity.MEDIUM
  }

  private determineCategory(error: AppError): ErrorCategory {
    if (error.category) return error.category
    
    // Default category logic
    if (error instanceof NetworkError) return ErrorCategory.NETWORK
    if (error instanceof ValidationError) return ErrorCategory.VALIDATION
    return ErrorCategory.UNKNOWN
  }

  private initializeMetrics(
    errorKey: string,
    error: AppError,
    now: string,
    severity: ErrorSeverity,
    category: ErrorCategory
  ): ErrorMetrics {
    return {
      count: 1,
      firstSeen: now,
      lastSeen: now,
      contexts: new Set(),
      userAgents: new Set(),
      urls: new Set(),
      severity,
      category,
      recoveryStrategy: error.recoveryStrategy,
      impactedUsers: new Set(),
      recoveryRate: 0,
      avgResolutionTime: 0,
      relatedErrors: new Set(),
      successfulAttempts: 0,
      totalAttempts: 0,
      lastResolutionTime: 0,
      maxResolutionTime: 0,
      minResolutionTime: Number.MAX_VALUE,
      consecutiveFailures: 0,
      lastRecoveryTime: null,
      recoveryAttempts: {
        [ErrorRecoveryStrategy.RETRY]: { attempts: 0, successes: 0 },
        [ErrorRecoveryStrategy.REFRESH]: { attempts: 0, successes: 0 },
        [ErrorRecoveryStrategy.RESET]: { attempts: 0, successes: 0 },
        [ErrorRecoveryStrategy.FALLBACK]: { attempts: 0, successes: 0 },
        [ErrorRecoveryStrategy.NONE]: { attempts: 0, successes: 0 }
      }
    }
  }

  async trackError(error: AppError, context?: string, userId?: string): Promise<void> {
    await this.ensureInitialized()

    const now = new Date().toISOString()
    const errorKey = this.getErrorKey(error)
    const severity = this.determineSeverity(error)
    const category = this.determineCategory(error)

    if (!this.analytics[errorKey]) {
      this.analytics[errorKey] = this.initializeMetrics(errorKey, error, now, severity, category)
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

    // Update trends
    this.updateTrends(errorKey, severity, category, userId)

    // Find related errors
    this.findRelatedErrors(errorKey, error)

    // Persist data
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

    let trend = this.trends.find(t => t.period === period)
    if (!trend) {
      trend = {
        period,
        count: 0,
        severity,
        category,
        impactedUsers: new Set()
      }
      this.trends.unshift(trend)

      // Maintain trend limit
      if (this.trends.length > this.maxTrends) {
        this.trends.pop()
      }
    }

    trend.count++
    if (userId) {
      trend.impactedUsers.add(userId)
    }
  }

  private findRelatedErrors(errorKey: string, error: AppError) {
    const metrics = this.analytics[errorKey]
    
    Object.entries(this.analytics).forEach(([key, otherMetrics]) => {
      if (key !== errorKey) {
        // Check for errors affecting same users
        const commonUsers = new Set(
          [...metrics.impactedUsers].filter(user => 
            otherMetrics.impactedUsers.has(user)
          )
        )
        
        if (commonUsers.size > 0) {
          metrics.relatedErrors.add(key)
          otherMetrics.relatedErrors.add(errorKey)
        }
      }
    })
  }

  updateErrorResolution(
    errorKey: string,
    resolutionTime: number,
    wasSuccessful: boolean,
    strategy: ErrorRecoveryStrategy = ErrorRecoveryStrategy.RETRY
  ) {
    const metrics = this.analytics[errorKey]
    if (!metrics) return

    metrics.totalAttempts++
    metrics.lastResolutionTime = resolutionTime

    // Update strategy-specific metrics
    metrics.recoveryAttempts[strategy].attempts++
    if (wasSuccessful) {
      metrics.recoveryAttempts[strategy].successes++
    }

    if (wasSuccessful) {
      metrics.successfulAttempts++
      metrics.consecutiveFailures = 0
      metrics.lastRecoveryTime = new Date().toISOString()

      // Update resolution time metrics
      metrics.maxResolutionTime = Math.max(metrics.maxResolutionTime, resolutionTime)
      metrics.minResolutionTime = Math.min(metrics.minResolutionTime, resolutionTime)
      metrics.avgResolutionTime = (
        (metrics.avgResolutionTime * (metrics.successfulAttempts - 1) + resolutionTime) /
        metrics.successfulAttempts
      )
    } else {
      metrics.consecutiveFailures++
    }

    metrics.recoveryRate = metrics.successfulAttempts / metrics.totalAttempts
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
    const now = Date.now()

    Object.entries(this.analytics).forEach(([key, metrics]) => {
      const hoursSinceFirstSeen = (
        now - new Date(metrics.firstSeen).getTime()
      ) / (1000 * 60 * 60)

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
        frequency: metrics.count / hoursSinceFirstSeen
      }
    })

    return result
  }

  async getTrends(options?: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    hours?: number
  }): Promise<Array<Omit<ErrorTrend, 'impactedUsers'> & { impactedUsers: number }>> {
    await this.ensureInitialized()

    let filteredTrends = this.trends

    if (options) {
      const { category, severity, hours } = options
      const cutoff = hours 
        ? new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
        : null

      filteredTrends = this.trends.filter(trend => {
        if (category && trend.category !== category) return false
        if (severity && trend.severity !== severity) return false
        if (cutoff && trend.period < cutoff) return false
        return true
      })
    }

    return filteredTrends.map(trend => ({
      ...trend,
      impactedUsers: trend.impactedUsers.size
    }))
  }

  getErrorsByFrequency(): [string, number][] {
    return Object.entries(this.analytics)
      .map(([key, metrics]) => [key, metrics.count / metrics.totalAttempts] as [string, number])
      .sort((a, b) => b[1] - a[1])
  }

  getErrorsByCount(): [string, number][] {
    return Object.entries(this.analytics)
      .map(([key, metrics]) => [key, metrics.count] as [string, number])
      .sort((a, b) => b[1] - a[1])
  }

  getErrorsBySeverity(severity: ErrorSeverity): string[] {
    return Object.entries(this.analytics)
      .filter(([, metrics]) => metrics.severity === severity)
      .map(([key]) => key)
  }

  getErrorsByCategory(category: ErrorCategory): string[] {
    return Object.entries(this.analytics)
      .filter(([, metrics]) => metrics.category === category)
      .map(([key]) => key)
  }

  getRecentErrors(hours: number = 24): string[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    return Object.entries(this.analytics)
      .filter(([, metrics]) => metrics.lastSeen >= cutoff)
      .map(([key]) => key)
  }

  getRelatedErrors(errorKey: string): string[] {
    return Array.from(this.analytics[errorKey]?.relatedErrors || [])
  }

  getErrorImpact(errorKey: string): ErrorImpactAnalysis {
    const metrics = this.analytics[errorKey]
    if (!metrics) {
      throw new Error(`No metrics found for error key: ${errorKey}`)
    }

    // Calculate hourly distribution
    const hourlyDistribution: { [hour: string]: number } = {}
    this.trends
      .filter(trend => trend.period >= metrics.firstSeen)
      .forEach(trend => {
        const hour = new Date(trend.period).getHours().toString().padStart(2, '0')
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + trend.count
      })

    // Calculate growth rate
    const recentPeriods = this.trends
      .filter(trend => trend.period >= metrics.firstSeen)
      .slice(0, 24)
    const oldCount = recentPeriods.slice(-12).reduce((sum, trend) => sum + trend.count, 0)
    const newCount = recentPeriods.slice(0, 12).reduce((sum, trend) => sum + trend.count, 0)
    const growthRate = oldCount === 0 ? 0 : (newCount - oldCount) / oldCount

    // Find peak user count
    const peakUserCount = Math.max(
      ...this.trends
        .filter(trend => trend.period >= metrics.firstSeen)
        .map(trend => trend.impactedUsers.size)
    )

    // Calculate recovery trend
    const recoveryTrend = metrics.totalAttempts === 0 
      ? 0 
      : (metrics.successfulAttempts / metrics.totalAttempts) * 100

    return {
      userCount: metrics.impactedUsers.size,
      recoveryRate: metrics.recoveryRate,
      avgResolutionTime: metrics.avgResolutionTime,
      relatedErrorsCount: metrics.relatedErrors.size,
      resolutionMetrics: {
        lastResolutionTime: metrics.lastResolutionTime,
        maxResolutionTime: metrics.maxResolutionTime,
        minResolutionTime: metrics.minResolutionTime,
        consecutiveFailures: metrics.consecutiveFailures,
        lastRecoveryTime: metrics.lastRecoveryTime,
        successRate: metrics.successfulAttempts / metrics.totalAttempts,
        totalAttempts: metrics.totalAttempts
      },
      trendAnalysis: {
        recentOccurrences: newCount,
        growthRate,
        peakUserCount,
        totalOccurrences: metrics.count,
        hourlyDistribution,
        recoveryTrend
      },
      contextAnalysis: {
        uniqueContexts: metrics.contexts.size,
        topContexts: Array.from(metrics.contexts).slice(0, 10),
        uniqueUrls: metrics.urls.size,
        topUrls: Array.from(metrics.urls).slice(0, 10)
      }
    }
  }

  async clearAnalytics(): Promise<void> {
    this.analytics = {}
    this.trends = []
    await this.storage.clearData()
  }

  private getErrorKey(error: AppError): string {
    return `${error.name}:${error.code}`
  }

  private addToSetWithLimit<T>(set: Set<T>, item: T, limit: number) {
    set.add(item)
    if (set.size > limit) {
      const firstItem = set.values().next().value
      set.delete(firstItem)
    }
  }

  private async persistData(): Promise<void> {
    try {
      await this.storage.saveData({
        analytics: this.analytics,
        trends: this.trends
      })
    } catch (error) {
      console.error('Failed to persist error analytics data:', error)
      throw error
    }
  }

  getRecoveryStrategyEffectiveness(errorKey: string): Record<ErrorRecoveryStrategy, number> {
    const metrics = this.analytics[errorKey]
    if (!metrics) {
      return Object.values(ErrorRecoveryStrategy).reduce((acc, strategy) => {
        acc[strategy] = 0
        return acc
      }, {} as Record<ErrorRecoveryStrategy, number>)
    }

    return Object.entries(metrics.recoveryAttempts).reduce((acc, [strategy, data]) => {
      acc[strategy as ErrorRecoveryStrategy] = data.attempts > 0
        ? (data.successes / data.attempts) * 100
        : 0
      return acc
    }, {} as Record<ErrorRecoveryStrategy, number>)
  }

  suggestRecoveryStrategy(errorKey: string): ErrorRecoveryStrategy {
    const metrics = this.analytics[errorKey]
    if (!metrics) return ErrorRecoveryStrategy.RETRY

    // If error is critical or security-related, don't retry
    if (metrics.severity === ErrorSeverity.CRITICAL ||
        metrics.category === ErrorCategory.SECURITY) {
      return ErrorRecoveryStrategy.NONE
    }

    // Get effectiveness of each strategy
    const effectiveness = this.getRecoveryStrategyEffectiveness(errorKey)
    
    // Find the most effective strategy
    let bestStrategy = ErrorRecoveryStrategy.RETRY
    let bestEffectiveness = 0

    Object.entries(effectiveness).forEach(([strategy, rate]) => {
      if (rate > bestEffectiveness) {
        bestStrategy = strategy as ErrorRecoveryStrategy
        bestEffectiveness = rate
      }
    })

    // If no strategy is effective, suggest based on error category
    if (bestEffectiveness === 0) {
      switch (metrics.category) {
        case ErrorCategory.NETWORK:
          return ErrorRecoveryStrategy.RETRY
        case ErrorCategory.AUTH:
          return ErrorRecoveryStrategy.REFRESH
        case ErrorCategory.PERFORMANCE:
          return ErrorRecoveryStrategy.RESET
        case ErrorCategory.DATA:
          return ErrorRecoveryStrategy.FALLBACK
        default:
          return ErrorRecoveryStrategy.RETRY
      }
    }

    return bestStrategy
  }
} 