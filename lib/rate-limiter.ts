'use client'

import { createClient } from '@/utils/supabase/client'
import { AppError } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'

export class RateLimitError extends AppError {
  constructor(
    message: string,
    public key: string,
    public resetAt: Date,
    public remaining: number
  ) {
    super(
      message,
      'RATE_LIMIT_EXCEEDED',
      429,
      true,
      ErrorSeverity.MEDIUM,
      ErrorCategory.RATE_LIMIT,
      {
        key,
        resetAt: resetAt.toISOString(),
        remaining,
      }
    )
  }
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

interface RateLimitMetrics {
  windowStart: Date
  requestCount: number
  lastRequest: Date | null
}

export class RateLimiter {
  private static instance: RateLimiter
  private supabase = createClient()

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async checkLimit(key: string, userId?: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_rate_limit', {
          p_key: key,
          p_user_id: userId
        })

      if (error) throw error

      const result = data[0] as RateLimitResult
      if (!result.allowed) {
        throw new RateLimitError(
          `Rate limit exceeded for ${key}. Try again in ${this.formatTimeUntilReset(result.resetAt)}.`,
          key,
          new Date(result.resetAt),
          result.remaining
        )
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error
      }
      throw new AppError(
        'Failed to check rate limit',
        'RATE_LIMIT_CHECK_FAILED',
        500,
        true,
        ErrorSeverity.HIGH,
        ErrorCategory.RATE_LIMIT,
        { key, userId, error }
      )
    }
  }

  async getMetrics(
    key: string,
    userId?: string,
    windowStart: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)
  ): Promise<RateLimitMetrics[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_rate_limit_metrics', {
          p_key: key,
          p_user_id: userId,
          p_window_start: windowStart.toISOString()
        })

      if (error) throw error

      return data.map((metric: any) => ({
        windowStart: new Date(metric.window_start),
        requestCount: metric.request_count,
        lastRequest: metric.last_request ? new Date(metric.last_request) : null
      }))
    } catch (error) {
      throw new AppError(
        'Failed to get rate limit metrics',
        'RATE_LIMIT_METRICS_FAILED',
        500,
        true,
        ErrorSeverity.MEDIUM,
        ErrorCategory.RATE_LIMIT,
        { key, userId, windowStart, error }
      )
    }
  }

  private formatTimeUntilReset(resetAt: string | Date): string {
    const reset = new Date(resetAt)
    const now = new Date()
    const diff = Math.max(0, Math.ceil((reset.getTime() - now.getTime()) / 1000))

    if (diff < 60) {
      return `${diff} second${diff === 1 ? '' : 's'}`
    }

    const minutes = Math.ceil(diff / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance() 