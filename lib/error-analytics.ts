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

// Default configuration
const DEFAULT_CONFIG: ErrorAnalyticsConfig = {
  maxContexts: 100,
  maxUserAgents: 50,
  maxUrls: 100,
  maxTrends: 1000,
  trendPeriodMs: 3600000, // 1 hour
  retentionDays: 30,
  batchSize: 50
}

export class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService | null = null;
  private readonly supabase: SupabaseClient<Database>;
  private readonly component: string;
  private config: ErrorAnalyticsConfig = DEFAULT_CONFIG;
  private batchQueue: Map<string, any[]> = new Map();
  private batchTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;
  private isServer = typeof window === 'undefined';

  private constructor(component: string = 'default') {
    this.component = component;
    this.supabase = createClient();
    this.initializeConfig().catch(console.error);
  }

  public static getInstance(component: string = 'default'): ErrorAnalyticsService {
    // For SSR, return a dummy instance that logs to console
    if (typeof window === 'undefined') {
      return new Proxy(new ErrorAnalyticsService(component), {
        get: (target, prop) => {
          if (prop === 'trackError') {
            return (error: Error) => {
              console.error('[Server] Error tracked:', error);
              return Promise.resolve();
            };
          }
          return target[prop as keyof ErrorAnalyticsService];
        },
      });
    }

    if (!ErrorAnalyticsService.instance) {
      ErrorAnalyticsService.instance = new ErrorAnalyticsService(component);
    }
    return ErrorAnalyticsService.instance;
  }

  private async initializeConfig(): Promise<void> {
    if (this.isServer) return;

    try {
      const { data, error } = await this.supabase
        .from('error_analytics_config')
        .select('*')
        .eq('component', this.component)
        .single();

      if (error) {
        console.warn('Error fetching config:', error);
        return;
      }

      if (data) {
        this.config = {
          maxContexts: data.max_contexts,
          maxUserAgents: data.max_user_agents,
          maxUrls: data.max_urls,
          maxTrends: data.max_trends,
          trendPeriodMs: data.trend_period_ms,
          retentionDays: data.retention_days,
          batchSize: data.batch_size,
        };
      }
    } catch (error) {
      console.error('Error initializing config:', error);
    }
  }

  private generateBatchId(): string {
    return crypto.randomUUID();
  }

  private async processBatch(batchId: string): Promise<void> {
    const errors = this.batchQueue.get(batchId) || [];
    if (errors.length === 0) return;

    try {
      const { error } = await this.supabase
        .from('error_analytics_data')
        .insert(errors);

      if (error) {
        console.error('Error inserting batch:', error);
        return;
      }

      // Clear the processed batch
      this.batchQueue.delete(batchId);
      const timeout = this.batchTimeouts.get(batchId);
      if (timeout) {
        clearTimeout(timeout);
        this.batchTimeouts.delete(batchId);
      }
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }

  public async trackError(
    error: Error | AppError,
    context?: ErrorContext
  ): Promise<void> {
    if (this.isServer) {
      console.error('[Server] Error tracked:', error);
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const errorType = error instanceof AppError ? error.code : error.name;
      const batch = this.batchQueue.get(errorType) || [];

      batch.push({
        errorMessage: error.message,
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType,
        browserInfo: {
          userAgent: window?.navigator?.userAgent,
          url: window?.location?.href,
          timestamp: new Date().toISOString()
        },
        batch_id: this.generateBatchId(),
      });

      if (batch.length >= this.config.batchSize) {
        this.batchQueue.set(errorType, batch);
        await this.processBatch(errorType);
      } else {
        this.batchQueue.set(errorType, batch);
        this.scheduleBatchProcessing();
      }
    } catch (error) {
      console.error('Failed to track error:', error);
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

  public async getTrends(
    startTime?: Date,
    endTime: Date = new Date()
  ): Promise<ErrorTrend[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const supabase = this.supabase
    if (!supabase) return []

    try {
      if (!startTime) {
        startTime = new Date(endTime.getTime() - this.config.trendPeriodMs)
      }

      const { data, error } = await supabase
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
        contexts: (trend.contexts || []) as ErrorContext[],
        userAgents: (trend.user_agents || []) as string[],
        urls: (trend.urls || []) as string[]
      }))
    } catch (error) {
      console.error('Failed to get error trends:', error)
      return []
    }
  }

  public async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const supabase = this.supabase
    if (!supabase) return

    try {
      // Process any remaining batches
      const errorTypes = Array.from(this.batchQueue.keys())
      for (const errorType of errorTypes) {
        await this.processBatch(errorType)
      }

      // Clear old data
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - this.config.retentionDays)

      await supabase
        .from('error_analytics_data')
        .delete()
        .eq('component', this.component)
        .lt('timestamp', cutoff.toISOString())

      await supabase
        .from('error_analytics_trends')
        .delete()
        .eq('component', this.component)
        .lt('last_seen', cutoff.toISOString())
    } catch (error) {
      console.error('Failed to cleanup error analytics:', error)
    }
  }

  /**
   * Cleanup resources and process remaining errors
   * @returns Promise<void>
   */
  public async dispose(): Promise<void> {
    if (this.isServer) return;

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    // Process any remaining batches
    const errorTypes = Array.from(this.batchQueue.keys());
    for (const errorType of errorTypes) {
      await this.processBatch(errorType);
    }
  }
}

// Export singleton instance
export const errorAnalytics = ErrorAnalyticsService.getInstance(); 