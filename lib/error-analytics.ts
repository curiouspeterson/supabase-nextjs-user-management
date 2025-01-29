/**
 * Error analytics service for tracking and analyzing application errors
 * @module error-analytics
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'
import type { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

interface ErrorContext {
  component?: string
  errorType?: string
  errorMessage: string
  errorStack?: string
  browserInfo?: {
    userAgent?: string
    url?: string
    timestamp?: string
  }
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

interface ErrorBatchItem {
  error_message: string
  error_stack?: string
  error_type: string
  component: string
  browser_info: {
    user_agent?: string
    url?: string
    timestamp: string
  }
  batch_id: string
  context?: ErrorContext
}

export class ErrorAnalyticsError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(
      message,
      'ERROR_ANALYTICS_FAILED',
      {
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.MONITORING,
        cause
      }
    )
  }
}

const DEFAULT_CONFIG: ErrorAnalyticsConfig = {
  maxContexts: 100,
  maxUserAgents: 50,
  maxUrls: 50,
  maxTrends: 1000,
  trendPeriodMs: 24 * 60 * 60 * 1000, // 24 hours
  retentionDays: 30,
  batchSize: 50
}

export class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService | null = null
  private supabase: SupabaseClient<Database> | null = null
  private readonly component: string
  private config: ErrorAnalyticsConfig = DEFAULT_CONFIG
  private batchQueue: Map<string, ErrorBatchItem[]> = new Map()
  private batchTimeout: NodeJS.Timeout | null = null
  private isInitialized = false

  private constructor(component: string = 'default') {
    this.component = component
  }

  public static getInstance(component: string = 'default'): ErrorAnalyticsService {
    if (!ErrorAnalyticsService.instance) {
      ErrorAnalyticsService.instance = new ErrorAnalyticsService(component)
    }
    return ErrorAnalyticsService.instance
  }

  private async initializeSupabase(): Promise<void> {
    try {
      this.supabase = createClient()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      throw new ErrorAnalyticsError('Failed to initialize Supabase client', error)
    }
  }

  private async initializeConfig(): Promise<void> {
    if (!this.supabase) {
      throw new ErrorAnalyticsError('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('error_analytics_config')
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        this.config = {
          ...DEFAULT_CONFIG,
          ...data
        }
      }
    } catch (error) {
      console.error('Failed to load error analytics config:', error)
      // Continue with default config
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.initializeSupabase()
      await this.initializeConfig()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize error analytics:', error)
      throw new ErrorAnalyticsError('Failed to initialize error analytics', error)
    }
  }

  private generateBatchId(): string {
    return crypto.randomUUID()
  }

  private async processBatch(batchId: string): Promise<void> {
    if (!this.supabase) return

    const errors = this.batchQueue.get(batchId) || []
    if (errors.length === 0) return

    try {
      const { error } = await this.supabase
        .from('error_analytics_data')
        .insert(errors)

      if (error) throw error

      this.batchQueue.delete(batchId)
    } catch (error) {
      console.error('Error processing batch:', error)
      throw new ErrorAnalyticsError('Failed to process error batch', error)
    }
  }

  public async trackError(
    error: Error | AppError,
    context?: ErrorContext
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const errorType = error instanceof AppError ? error.code : error.name
      const batch = this.batchQueue.get(errorType) || []
      const batchId = this.generateBatchId()

      const browserInfo = typeof window !== 'undefined' ? {
        user_agent: window.navigator?.userAgent,
        url: window.location?.href,
        timestamp: new Date().toISOString()
      } : {
        timestamp: new Date().toISOString()
      }

      const errorItem: ErrorBatchItem = {
        error_message: error.message,
        error_stack: error instanceof Error ? error.stack : undefined,
        error_type: errorType,
        component: this.component,
        browser_info: browserInfo,
        batch_id: batchId,
        context
      }

      batch.push(errorItem)
      this.batchQueue.set(errorType, batch)

      if (batch.length >= this.config.batchSize) {
        await this.processBatch(batchId)
      } else {
        this.scheduleBatchProcessing()
      }
    } catch (error) {
      console.error('Failed to track error:', error)
      throw new ErrorAnalyticsError('Failed to track error', error)
    }
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimeout) return

    this.batchTimeout = setTimeout(async () => {
      this.batchTimeout = null
      const errorTypes = Array.from(this.batchQueue.keys())
      
      for (const errorType of errorTypes) {
        await this.processBatch(errorType).catch(console.error)
      }
    }, 5000)
  }

  public async getTrends(
    startTime?: Date,
    endTime: Date = new Date()
  ): Promise<ErrorTrend[]> {
    if (!this.supabase) return []

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      startTime = startTime ?? new Date(endTime.getTime() - this.config.trendPeriodMs)

      const { data, error } = await this.supabase
        .from('error_analytics_trends')
        .select('*')
        .eq('component', this.component)
        .gte('last_seen', startTime.toISOString())
        .lte('first_seen', endTime.toISOString())

      if (error) throw error

      return (data || []).map(trend => ({
        errorType: trend.error_type,
        count: trend.count,
        firstSeen: new Date(trend.first_seen),
        lastSeen: new Date(trend.last_seen),
        contexts: trend.contexts || [],
        userAgents: trend.user_agents || [],
        urls: trend.urls || []
      }))
    } catch (error) {
      console.error('Failed to get error trends:', error)
      return []
    }
  }

  public async cleanup(): Promise<void> {
    if (!this.supabase) return

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Process remaining batches
      const errorTypes = Array.from(this.batchQueue.keys())
      await Promise.all(errorTypes.map(type => this.processBatch(type)))

      // Clear old data
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - this.config.retentionDays)

      await Promise.all([
        this.supabase
          .from('error_analytics_data')
          .delete()
          .eq('component', this.component)
          .lt('timestamp', cutoff.toISOString()),
        
        this.supabase
          .from('error_analytics_trends')
          .delete()
          .eq('component', this.component)
          .lt('last_seen', cutoff.toISOString())
      ])
    } catch (error) {
      console.error('Failed to cleanup error analytics:', error)
      throw new ErrorAnalyticsError('Failed to cleanup error analytics', error)
    }
  }

  public async dispose(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    
    const errorTypes = Array.from(this.batchQueue.keys())
    await Promise.all(errorTypes.map(type => this.processBatch(type)))
  }
}

// Export singleton instance
export const errorAnalytics = ErrorAnalyticsService.getInstance() 