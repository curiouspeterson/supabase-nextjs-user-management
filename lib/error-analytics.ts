/**
 * Error analytics service for tracking and analyzing application errors
 * @module error-analytics
 */

'use client'

import { createClient } from '@/utils/supabase/client'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'

interface ErrorContext {
  [key: string]: unknown
}

interface ErrorAnalyticsConfig {
  maxContexts: number
  maxUserAgents: number
  maxUrls: number
  maxTrends: number
  trendPeriodMs: number
  retentionDays: number
  batchSize: number
}

interface ErrorTrend {
  errorType: string
  count: number
  firstSeen: Date
  lastSeen: Date
  contexts: ErrorContext[]
  userAgents: string[]
  urls: string[]
}

export class ErrorAnalyticsError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(
      message,
      'ERROR_ANALYTICS_FAILED',
      500,
      true,
      ErrorSeverity.HIGH,
      ErrorCategory.MONITORING,
      { cause }
    )
  }
}

export type AnalyticsError = ErrorAnalyticsError

export class ErrorAnalyticsService {
  private supabase = createClient()
  private component: string
  private config: ErrorAnalyticsConfig | null = null
  private batchQueue: Map<string, any[]> = new Map()
  private batchTimeout: NodeJS.Timeout | null = null
  private localStorageKey: string

  constructor(component: string = 'default') {
    this.component = component
    this.localStorageKey = `error_analytics_${component}`
    this.loadLocalStorage()
  }

  private async loadConfig(): Promise<ErrorAnalyticsConfig> {
    try {
      const { data, error } = await this.supabase
        .from('error_analytics_config')
        .select('*')
        .eq('component', this.component)
        .single()

      if (error) throw error

      return {
        maxContexts: data.max_contexts,
        maxUserAgents: data.max_user_agents,
        maxUrls: data.max_urls,
        maxTrends: data.max_trends,
        trendPeriodMs: data.trend_period_ms,
        retentionDays: data.retention_days,
        batchSize: data.batch_size
      }
    } catch (error) {
      console.error('Failed to load error analytics config:', error)
      // Return default config
      return {
        maxContexts: 100,
        maxUserAgents: 50,
        maxUrls: 100,
        maxTrends: 1000,
        trendPeriodMs: 3600000,
        retentionDays: 30,
        batchSize: 50
      }
    }
  }

  private loadLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.localStorageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.batchQueue = new Map(Object.entries(data))
      }
    } catch (error) {
      console.error('Failed to load error analytics from localStorage:', error)
    }
  }

  private saveLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data = Object.fromEntries(this.batchQueue)
      localStorage.setItem(this.localStorageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save error analytics to localStorage:', error)
    }
  }

  private async processBatch(errorType: string): Promise<void> {
    const batch = this.batchQueue.get(errorType) || []
    if (batch.length === 0) return

    try {
      const batchId = crypto.randomUUID()
      
      // Insert batch data
      const { error: insertError } = await this.supabase
        .from('error_analytics_data')
        .insert(
          batch.map(item => ({
            component: this.component,
            error_type: errorType,
            error_message: item.message,
            context: item.context,
            user_agent: item.userAgent,
            url: item.url,
            batch_id: batchId,
            timestamp: item.timestamp
          }))
        )

      if (insertError) throw insertError

      // Process the batch
      const { error: processError } = await this.supabase
        .rpc('process_error_analytics_batch', {
          p_batch_id: batchId
        })

      if (processError) throw processError

      // Clear processed batch
      this.batchQueue.delete(errorType)
      this.saveLocalStorage()
    } catch (error) {
      console.error('Failed to process error analytics batch:', error)
      // Keep the batch in queue for retry
    }
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimeout) return

    this.batchTimeout = setTimeout(async () => {
      this.batchTimeout = null
      const errorTypes = Array.from(this.batchQueue.keys())
      
      for (const errorType of errorTypes) {
        await this.processBatch(errorType)
      }
    }, 5000) // Process every 5 seconds
  }

  async trackError(
    error: Error | AppError,
    context?: ErrorContext
  ): Promise<void> {
    try {
      if (!this.config) {
        this.config = await this.loadConfig()
      }

      const errorType = error instanceof AppError ? error.code : error.name
      const batch = this.batchQueue.get(errorType) || []

      batch.push({
        message: error.message,
        context,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: new Date().toISOString()
      })

      if (batch.length >= this.config.batchSize) {
        this.batchQueue.set(errorType, batch)
        await this.processBatch(errorType)
      } else {
        this.batchQueue.set(errorType, batch)
        this.saveLocalStorage()
        this.scheduleBatchProcessing()
      }
    } catch (error) {
      console.error('Failed to track error:', error)
      throw new ErrorAnalyticsError('Failed to track error', error)
    }
  }

  async getTrends(
    startTime?: Date,
    endTime: Date = new Date()
  ): Promise<ErrorTrend[]> {
    try {
      if (!startTime) {
        if (!this.config) {
          this.config = await this.loadConfig()
        }
        startTime = new Date(endTime.getTime() - this.config.trendPeriodMs)
      }

      const { data, error } = await this.supabase
        .from('error_analytics_trends')
        .select('*')
        .eq('component', this.component)
        .gte('last_seen', startTime.toISOString())
        .lte('first_seen', endTime.toISOString())

      if (error) throw error

      return data.map(trend => ({
        errorType: trend.error_type,
        count: trend.count,
        firstSeen: new Date(trend.first_seen),
        lastSeen: new Date(trend.last_seen),
        contexts: (trend.contexts || []).map(context => context as ErrorContext),
        userAgents: trend.user_agents || [],
        urls: trend.urls || []
      }))
    } catch (error) {
      console.error('Failed to get error trends:', error)
      throw new ErrorAnalyticsError('Failed to get error trends', error)
    }
  }

  async clearAnalytics(errorType?: string): Promise<void> {
    try {
      if (errorType) {
        // Clear specific error type
        this.batchQueue.delete(errorType)
        await this.supabase
          .from('error_analytics_data')
          .delete()
          .eq('component', this.component)
          .eq('error_type', errorType)

        await this.supabase
          .from('error_analytics_trends')
          .delete()
          .eq('component', this.component)
          .eq('error_type', errorType)
      } else {
        // Clear all analytics
        this.batchQueue.clear()
        await this.supabase
          .from('error_analytics_data')
          .delete()
          .eq('component', this.component)

        await this.supabase
          .from('error_analytics_trends')
          .delete()
          .eq('component', this.component)
      }

      this.saveLocalStorage()
    } catch (error) {
      console.error('Failed to clear error analytics:', error)
      throw new ErrorAnalyticsError('Failed to clear error analytics', error)
    }
  }

  async cleanup(): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('cleanup_error_analytics_data', {
          p_component: this.component
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to cleanup error analytics:', error)
      throw new ErrorAnalyticsError('Failed to cleanup error analytics', error)
    }
  }
}

// Create and export singleton instance
export const errorAnalytics = new ErrorAnalyticsService() 