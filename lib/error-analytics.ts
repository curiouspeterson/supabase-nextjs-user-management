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
  max_contexts: number
  max_user_agents: number
  max_urls: number
  max_trends: number
  trend_period_ms: number
  retention_days: number
  batch_size: number
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
      ErrorSeverity.ERROR,
      ErrorCategory.MONITORING,
      { cause }
    )
  }
}

const DEFAULT_CONFIG: ErrorAnalyticsConfig = {
  max_contexts: 100,
  max_user_agents: 50,
  max_urls: 50,
  max_trends: 1000,
  trend_period_ms: 24 * 60 * 60 * 1000, // 24 hours
  retention_days: 30,
  batch_size: 50
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

  public getSupabaseClient(): SupabaseClient<Database> | null {
    return this.supabase
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
      // Check authentication status
      const { data: { session } } = await this.supabase.auth.getSession()
      
      if (!session) {
        console.warn('No active session. Using default config.')
        return
      }

      const { data, error } = await this.supabase
        .from('error_analytics_config')
        .select()
        .eq('component', this.component)
        .maybeSingle()

      if (error) {
        if (error.code === '42501') {
          console.warn('Insufficient permissions for error analytics config. Using default config.')
        } else {
          console.warn('Error loading analytics config:', error)
        }
        return
      }

      if (data) {
        this.config = {
          max_contexts: data.max_contexts,
          max_user_agents: data.max_user_agents,
          max_urls: data.max_urls,
          max_trends: data.max_trends,
          trend_period_ms: data.trend_period_ms,
          retention_days: data.retention_days,
          batch_size: data.batch_size
        }
      }
    } catch (error) {
      console.error('Failed to initialize config:', error)
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

      if (batch.length >= this.config.batch_size) {
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

  public async resolveError(errorId: string, notes?: string): Promise<void> {
    if (!this.supabase) {
      throw new ErrorAnalyticsError('Supabase client not initialized')
    }

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const { error } = await this.supabase
        .from('error_analytics_data')
        .update({ resolved_at: new Date().toISOString(), resolution_notes: notes })
        .eq('id', errorId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to resolve error:', error)
      throw new ErrorAnalyticsError('Failed to resolve error', error)
    }
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
      startTime = startTime ?? new Date(endTime.getTime() - this.config.trend_period_ms)

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
      cutoff.setDate(cutoff.getDate() - this.config.retention_days)

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