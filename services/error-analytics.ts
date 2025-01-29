import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Severity levels for errors
export const ErrorSeverity = z.enum(['low', 'medium', 'high', 'critical'])
export type ErrorSeverity = z.infer<typeof ErrorSeverity>

// Schema for error analytics data
export const ErrorAnalyticsData = z.object({
  error_type: z.string(),
  message: z.string(),
  severity: ErrorSeverity,
  component: z.string().optional(),
  stack_trace: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  user_id: z.string().optional(),
  environment: z.string().optional(),
})

export type ErrorAnalyticsData = z.infer<typeof ErrorAnalyticsData>

// Schema for error analytics configuration
const ErrorAnalyticsConfig = z.object({
  org_id: z.string(),
  alert_thresholds: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
    critical: z.number(),
  }),
  notification_channels: z.array(z.string()),
  enabled: z.boolean(),
})

export class ErrorAnalyticsService {
  private supabase
  
  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async logError(data: ErrorAnalyticsData) {
    try {
      const validatedData = ErrorAnalyticsData.parse(data)
      
      const { error } = await this.supabase
        .from('error_analytics')
        .insert({
          ...validatedData,
          created_at: new Date().toISOString(),
          status: 'open',
        })

      if (error) throw error

      await this.checkAlertThresholds(validatedData.severity)

      return { success: true }
    } catch (err) {
      console.error('Failed to log error:', err)
      return { success: false, error: err }
    }
  }

  private async checkAlertThresholds(severity: ErrorSeverity) {
    try {
      const { data: config } = await this.supabase
        .from('error_analytics_config')
        .select('*')
        .single()

      if (!config) return

      const validatedConfig = ErrorAnalyticsConfig.parse(config)
      
      const { data: recentErrors } = await this.supabase
        .from('error_analytics')
        .select('*')
        .eq('severity', severity)
        .eq('status', 'open')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString())

      if (!recentErrors) return

      if (recentErrors.length >= validatedConfig.alert_thresholds[severity]) {
        await this.sendNotifications(severity, recentErrors.length, validatedConfig)
      }
    } catch (err) {
      console.error('Failed to check alert thresholds:', err)
    }
  }

  private async sendNotifications(severity: ErrorSeverity, count: number, config: z.infer<typeof ErrorAnalyticsConfig>) {
    // Implementation would depend on notification channels (email, Slack, etc.)
    console.log(`Alert: ${count} ${severity} errors in the last hour`)
  }

  async resolveError(errorId: string, resolvedBy: string, notes?: string) {
    try {
      const { error } = await this.supabase
        .from('error_analytics')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution_notes: notes,
        })
        .eq('id', errorId)

      if (error) throw error

      return { success: true }
    } catch (err) {
      console.error('Failed to resolve error:', err)
      return { success: false, error: err }
    }
  }

  async getErrorSummary(orgId: string, options?: {
    environment?: string
    startDate?: Date
    endDate?: Date
  }) {
    try {
      let query = this.supabase
        .from('error_analytics')
        .select('*')
        .eq('org_id', orgId)

      if (options?.environment) {
        query = query.eq('environment', options.environment)
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate.toISOString())
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: {
          total: data.length,
          bySeverity: data.reduce((acc, curr) => {
            acc[curr.severity] = (acc[curr.severity] || 0) + 1
            return acc
          }, {} as Record<ErrorSeverity, number>),
          byStatus: data.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1
            return acc
          }, {} as Record<string, number>),
        },
      }
    } catch (err) {
      console.error('Failed to get error summary:', err)
      return { success: false, error: err }
    }
  }

  async getErrorTrends(orgId: string, options?: {
    environment?: string
    component?: string
    errorType?: string
    startDate?: Date
    endDate?: Date
  }) {
    try {
      let query = this.supabase
        .from('error_analytics')
        .select('*')
        .eq('org_id', orgId)

      if (options?.environment) {
        query = query.eq('environment', options.environment)
      }

      if (options?.component) {
        query = query.eq('component', options.component)
      }

      if (options?.errorType) {
        query = query.eq('error_type', options.errorType)
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate.toISOString())
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: this.aggregateErrorTrends(data),
      }
    } catch (err) {
      console.error('Failed to get error trends:', err)
      return { success: false, error: err }
    }
  }

  private aggregateErrorTrends(errors: any[]) {
    // Group errors by day
    const groupedByDay = errors.reduce((acc, error) => {
      const date = new Date(error.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          total: 0,
          bySeverity: {} as Record<ErrorSeverity, number>,
        }
      }
      acc[date].total++
      acc[date].bySeverity[error.severity] = (acc[date].bySeverity[error.severity] || 0) + 1
      return acc
    }, {} as Record<string, { total: number; bySeverity: Record<ErrorSeverity, number> }>)

    return Object.entries(groupedByDay)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
} 