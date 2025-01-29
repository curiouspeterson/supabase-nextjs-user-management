/**
 * Error analytics service for tracking and analyzing application errors
 * @module error-analytics
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'
import type { Database } from '@/types/supabase'

interface ErrorContext {
  [key: string]: unknown
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
  max_contexts: 100,
  max_user_agents: 50,
  max_urls: 100,
  max_trends: 1000,
  trend_period_ms: 3600000,
  retention_days: 30,
  batch_size: 50
}

export class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService | null = null;
  private readonly supabase = createClient();
  private readonly component: string;
  private config: ErrorAnalyticsConfig = DEFAULT_CONFIG;
  private batchQueue: Map<string, any[]> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isServer = typeof window === 'undefined';

  private constructor(component: string = 'default') {
    this.component = component;
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

  private async loadConfig(): Promise<ErrorAnalyticsConfig> {
    if (this.isServer) return DEFAULT_CONFIG;

    try {
      const supabase = this.supabase;
      if (!supabase) return DEFAULT_CONFIG;

      const { data, error } = await supabase
        .from('error_analytics_config')
        .select('*')
        .eq('component', this.component)
        .maybeSingle();

      if (error) {
        console.error('Error loading config:', error);
        return DEFAULT_CONFIG;
      }

      if (!data) {
        // Create default config for component
        const { error: insertError } = await supabase
          .from('error_analytics_config')
          .insert({
            component: this.component,
            max_contexts: DEFAULT_CONFIG.max_contexts,
            max_user_agents: DEFAULT_CONFIG.max_user_agents,
            max_urls: DEFAULT_CONFIG.max_urls,
            max_trends: DEFAULT_CONFIG.max_trends,
            trend_period_ms: DEFAULT_CONFIG.trend_period_ms,
            retention_days: DEFAULT_CONFIG.retention_days,
            batch_size: DEFAULT_CONFIG.batch_size
          });

        if (insertError) {
          console.error('Error creating default config:', insertError);
        }

        return DEFAULT_CONFIG;
      }

      return {
        max_contexts: data.max_contexts ?? DEFAULT_CONFIG.max_contexts,
        max_user_agents: data.max_user_agents ?? DEFAULT_CONFIG.max_user_agents,
        max_urls: data.max_urls ?? DEFAULT_CONFIG.max_urls,
        max_trends: data.max_trends ?? DEFAULT_CONFIG.max_trends,
        trend_period_ms: data.trend_period_ms ?? DEFAULT_CONFIG.trend_period_ms,
        retention_days: data.retention_days ?? DEFAULT_CONFIG.retention_days,
        batch_size: data.batch_size ?? DEFAULT_CONFIG.batch_size
      };
    } catch (error) {
      console.error('Failed to load error analytics config:', error);
      return DEFAULT_CONFIG;
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.config = await this.loadConfig()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize error analytics:', error)
      this.config = DEFAULT_CONFIG
      this.isInitialized = true
    }
  }

  private async processBatch(errorType: string): Promise<void> {
    const batch = this.batchQueue.get(errorType)
    if (!batch || batch.length === 0) return

    const supabase = this.supabase
    if (!supabase) return

    const batchId = crypto.randomUUID()

    try {
      // Insert batch data
      const { error: dataError } = await supabase
        .from('error_analytics_data')
        .insert(
          batch.map(item => ({
            component: this.component,
            error_type: errorType,
            error_message: item.message,
            context: item.context || {},
            user_agent: item.userAgent,
            url: item.url,
            batch_id: batchId,
            timestamp: item.timestamp
          }))
        )

      if (dataError) throw dataError

      // Update trends
      const { error: trendError } = await supabase
        .from('error_analytics_trends')
        .upsert({
          component: this.component,
          error_type: errorType,
          count: batch.length,
          first_seen: batch[0].timestamp,
          last_seen: batch[batch.length - 1].timestamp,
          contexts: batch.map(item => item.context || {}).slice(0, this.config.max_contexts),
          user_agents: [...new Set(batch.map(item => item.userAgent).filter(Boolean))].slice(0, this.config.max_user_agents),
          urls: [...new Set(batch.map(item => item.url).filter(Boolean))].slice(0, this.config.max_urls)
        }, {
          onConflict: 'component,error_type'
        })

      if (trendError) throw trendError

      // Clear processed batch
      this.batchQueue.delete(errorType)
    } catch (error) {
      console.error('Failed to process error batch:', error)
      // Keep the batch for retry
      this.scheduleBatchProcessing()
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
        message: error.message,
        context,
        userAgent: window?.navigator?.userAgent,
        url: window?.location?.href,
        timestamp: new Date().toISOString()
      });

      if (batch.length >= this.config.batch_size) {
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
        startTime = new Date(endTime.getTime() - this.config.trend_period_ms)
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
      cutoff.setDate(cutoff.getDate() - this.config.retention_days)

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