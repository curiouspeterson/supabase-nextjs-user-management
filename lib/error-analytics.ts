/**
 * Error analytics service for tracking and analyzing application errors
 * @module error-analytics
 */

import { StorageAdapter } from './storage/error-analytics-storage'
import {
  ErrorRecoveryStrategy,
  ErrorSeverity,
  ErrorCategory,
  ErrorMetrics,
  ErrorTrend,
  ErrorMetadata
} from '@/lib/types/error'

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
 * Interface for error analytics data
 */
export interface ErrorAnalytics {
  [key: string]: ErrorMetrics
}

/**
 * Interface for error impact analysis
 */
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

/**
 * Service for tracking and analyzing application errors
 */
export class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService | null = null
  private errorMetrics: Map<string, ErrorMetrics> = new Map()
  private errorTrends: Map<string, ErrorTrend[]> = new Map()
  private storage: StorageAdapter
  private initialized = false
  private readonly maxContexts = 100
  private readonly maxUserAgents = 50
  private readonly maxUrls = 100
  private readonly maxTrends = 1000
  private readonly trendPeriodMs = 3600000 // 1 hour

  private constructor() {
    this.storage = new StorageAdapter()
    this.loadPersistedData()
  }

  public static getInstance(): ErrorAnalyticsService {
    if (!ErrorAnalyticsService.instance) {
      ErrorAnalyticsService.instance = new ErrorAnalyticsService()
    }
    return ErrorAnalyticsService.instance
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const data = await this.storage.getData()
      if (data) {
        this.errorMetrics = new Map(Object.entries(data.analytics))
        this.errorTrends = new Map(Object.entries(data.trends))
      }
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize error analytics:', error)
      throw error
    }
  }

  private initializeMetrics(
    error: AppError,
    now: string
  ): ErrorMetrics {
    return {
      count: 1,
      firstSeen: now,
      lastSeen: now,
      contexts: [],
      userAgents: [],
      urls: [],
      severity: error.severity,
      category: error.category,
      recoveryStrategy: error.recoveryStrategy,
      impactedUsers: 0,
      recoveryRate: 0,
      avgResolutionTime: 0,
      relatedErrors: [],
      frequency: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      consecutiveFailures: 0,
      lastResolutionTime: 0,
      maxResolutionTime: 0,
      minResolutionTime: Number.MAX_VALUE,
      lastRecoveryTime: null,
      recoveryAttempts: Object.values(ErrorRecoveryStrategy).reduce((acc, strategy) => {
        acc[strategy] = { attempts: 0, successes: 0 }
        return acc
      }, {} as Record<ErrorRecoveryStrategy, { attempts: number; successes: number }>)
    }
  }

  async trackError(error: AppError, context?: string, userId?: string): Promise<string> {
    await this.ensureInitialized()

    const now = new Date().toISOString()
    const errorKey = this.getErrorKey(error)

    if (!this.errorMetrics.has(errorKey)) {
      this.errorMetrics.set(errorKey, this.initializeMetrics(error, now))
    }

    const metrics = this.errorMetrics.get(errorKey)!
    metrics.count++
    metrics.lastSeen = now

    // Update arrays with limits
    if (context) {
      metrics.contexts = Array.from(new Set([...metrics.contexts, context]))
        .slice(-this.maxContexts)
    }

    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    metrics.userAgents = Array.from(new Set([...metrics.userAgents, userAgent]))
      .slice(-this.maxUserAgents)

    const url = typeof window !== 'undefined' ? window.location.href : 'unknown'
    metrics.urls = Array.from(new Set([...metrics.urls, url]))
      .slice(-this.maxUrls)

    if (userId) {
      metrics.impactedUsers++
    }

    // Update trends
    this.updateTrends(errorKey, error.severity, error.category, userId)

    // Find related errors
    this.findRelatedErrors(errorKey, error)

    // Persist data
    await this.persistData()

    return errorKey
  }

  private updateTrends(
    errorKey: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    userId?: string
  ): void {
    const now = new Date()
    const period = new Date(
      Math.floor(now.getTime() / this.trendPeriodMs) * this.trendPeriodMs
    ).toISOString()

    const trend: ErrorTrend = {
      timestamp: period,
      count: 1,
      severity,
      category,
      impactedUsers: userId ? 1 : 0
    }

    const trends = this.errorTrends.get(errorKey) || []
    trends.push(trend)

    // Maintain trend limit
    if (trends.length > this.maxTrends) {
      trends.shift()
    }

    this.errorTrends.set(errorKey, trends)
  }

  private findRelatedErrors(errorKey: string, error: AppError): void {
    const metrics = this.errorMetrics.get(errorKey)
    if (!metrics) return

    this.errorMetrics.forEach((otherMetrics, key) => {
      if (key !== errorKey) {
        // Check for errors with similar contexts or URLs
        const hasCommonContext = metrics.contexts.some(ctx => 
          otherMetrics.contexts.includes(ctx))
        const hasCommonUrl = metrics.urls.some(url => 
          otherMetrics.urls.includes(url))

        if (hasCommonContext || hasCommonUrl) {
          metrics.relatedErrors = Array.from(new Set([...metrics.relatedErrors, key]))
          otherMetrics.relatedErrors = Array.from(new Set([...otherMetrics.relatedErrors, errorKey]))
        }
      }
    })
  }

  updateErrorResolution(
    errorKey: string,
    resolutionTime: number,
    wasSuccessful: boolean,
    strategy: ErrorRecoveryStrategy = ErrorRecoveryStrategy.RETRY
  ): void {
    const metrics = this.errorMetrics.get(errorKey)
    if (!metrics) return

    metrics.totalAttempts++
    metrics.lastResolutionTime = resolutionTime

    // Update strategy-specific metrics
    const strategyMetrics = metrics.recoveryAttempts[strategy]
    strategyMetrics.attempts++
    if (wasSuccessful) {
      strategyMetrics.successes++
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

    this.errorMetrics.forEach((metrics, key) => {
      const hoursSinceFirstSeen = (
        now - new Date(metrics.firstSeen).getTime()
      ) / (1000 * 60 * 60)

      result[key] = {
        count: metrics.count,
        firstSeen: metrics.firstSeen,
        lastSeen: metrics.lastSeen,
        contexts: metrics.contexts,
        userAgents: metrics.userAgents,
        urls: metrics.urls,
        severity: metrics.severity,
        category: metrics.category,
        impactedUsers: metrics.impactedUsers,
        recoveryRate: metrics.recoveryRate,
        avgResolutionTime: metrics.avgResolutionTime,
        relatedErrors: metrics.relatedErrors,
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

    let filteredTrends = this.errorTrends.get(options?.category?.toString() || '') || []

    if (options) {
      const { category, severity, hours } = options
      const cutoff = hours 
        ? new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
        : null

      filteredTrends = filteredTrends.filter(trend => {
        if (category && trend.category !== category) return false
        if (severity && trend.severity !== severity) return false
        if (cutoff && trend.timestamp < cutoff) return false
        return true
      })
    }

    return filteredTrends.map(trend => ({
      ...trend,
      impactedUsers: trend.impactedUsers
    }))
  }

  getErrorsByFrequency(): [string, number][] {
    return Object.entries(this.errorMetrics)
      .map(([key, metrics]) => [key, metrics.count / metrics.totalAttempts] as [string, number])
      .sort((a, b) => b[1] - a[1])
  }

  getErrorsByCount(): [string, number][] {
    return Object.entries(this.errorMetrics)
      .map(([key, metrics]) => [key, metrics.count] as [string, number])
      .sort((a, b) => b[1] - a[1])
  }

  getErrorsBySeverity(severity: ErrorSeverity): string[] {
    return Object.entries(this.errorMetrics)
      .filter(([, metrics]) => metrics.severity === severity)
      .map(([key]) => key)
  }

  getErrorsByCategory(category: ErrorCategory): string[] {
    return Object.entries(this.errorMetrics)
      .filter(([, metrics]) => metrics.category === category)
      .map(([key]) => key)
  }

  getRecentErrors(hours: number = 24): string[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    return Object.entries(this.errorMetrics)
      .filter(([, metrics]) => metrics.lastSeen >= cutoff)
      .map(([key]) => key)
  }

  getRelatedErrors(errorKey: string): string[] {
    return Array.from(this.errorMetrics.get(errorKey)?.relatedErrors || [])
  }

  getErrorImpact(errorKey: string): ErrorImpactAnalysis {
    const metrics = this.errorMetrics.get(errorKey)
    if (!metrics) {
      throw new Error(`No metrics found for error key: ${errorKey}`)
    }

    // Calculate hourly distribution
    const hourlyDistribution: { [hour: string]: number } = {}
    this.errorTrends.get(errorKey)?.forEach(trend => {
      const hour = new Date(trend.timestamp).getHours().toString().padStart(2, '0')
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + trend.count
    })

    // Calculate growth rate
    const recentPeriods = this.errorTrends.get(errorKey)?.slice(0, 24) || []
    const oldCount = recentPeriods.slice(-12).reduce((sum, trend) => sum + trend.count, 0)
    const newCount = recentPeriods.slice(0, 12).reduce((sum, trend) => sum + trend.count, 0)
    const growthRate = oldCount === 0 ? 0 : (newCount - oldCount) / oldCount

    // Find peak user count
    const peakUserCount = Math.max(
      ...this.errorTrends.get(errorKey)?.map(trend => trend.impactedUsers) || []
    )

    // Calculate recovery trend
    const recoveryTrend = metrics.totalAttempts === 0 
      ? 0 
      : (metrics.successfulAttempts / metrics.totalAttempts) * 100

    return {
      userCount: metrics.impactedUsers,
      recoveryRate: metrics.recoveryRate,
      avgResolutionTime: metrics.avgResolutionTime,
      relatedErrorsCount: metrics.relatedErrors.length,
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
        uniqueContexts: metrics.contexts.length,
        topContexts: metrics.contexts.slice(0, 10),
        uniqueUrls: metrics.urls.length,
        topUrls: metrics.urls.slice(0, 10)
      }
    }
  }

  async clearAnalytics(): Promise<void> {
    this.errorMetrics.clear()
    this.errorTrends.clear()
    await this.storage.clearData()
  }

  private getErrorKey(error: AppError): string {
    return `${error.name}:${error.code}`
  }

  private loadPersistedData(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    try {
      const data = localStorage.getItem('errorMetrics')
      if (data) {
        this.errorMetrics = new Map(JSON.parse(data))
      }

      const trendsData = localStorage.getItem('errorTrends')
      if (trendsData) {
        this.errorTrends = new Map(JSON.parse(trendsData))
      }
    } catch (error) {
      console.error('Failed to load persisted error data:', error)
    }
  }

  private async persistData(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const analyticsData = Object.fromEntries(this.errorMetrics)
      const trendsData = Array.from(this.errorTrends.entries())

      await this.storage.saveData({
        analytics: analyticsData,
        trends: trendsData
      })
    } catch (error) {
      console.error('Failed to persist error analytics data:', error)
      throw error
    }
  }

  /**
   * Suggests a recovery strategy based on error metrics
   * @param errorKey - The error key to analyze
   * @returns Suggested recovery strategy
   */
  suggestRecoveryStrategy(errorKey: string): ErrorRecoveryStrategy {
    const metrics = this.errorMetrics.get(errorKey)
    if (!metrics) return ErrorRecoveryStrategy.RETRY

    // If we've had too many consecutive failures, try a different strategy
    if (metrics.consecutiveFailures > 3) {
      return ErrorRecoveryStrategy.REFRESH
    }

    // If the error is persistent across refreshes, try resetting
    if (metrics.count > 5 && metrics.recoveryRate < 0.2) {
      return ErrorRecoveryStrategy.RESET
    }

    // If nothing else works, fallback to home
    if (metrics.count > 10 && metrics.recoveryRate < 0.1) {
      return ErrorRecoveryStrategy.FALLBACK
    }

    return ErrorRecoveryStrategy.RETRY
  }
}

ErrorAnalyticsService.instance = null; 