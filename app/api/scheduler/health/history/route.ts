import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type { HealthMetrics } from '@/services/health/types'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 30

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10)
    
    const supabase = createClient()
    
    // Get metrics history for the specified number of days
    const { data: metrics, error } = await supabase
      .from('scheduler_metrics')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Process metrics into time series data
    const timestamps = metrics.map(m => new Date(m.created_at).toISOString())
    const processedMetrics = metrics.map(m => ({
      cpu_usage: m.schedule_generation_time,
      memory_usage: m.coverage_deficit,
      active_connections: m.overtime_violations,
      request_latency: m.pattern_errors,
      error_rate: m.last_run_status === 'error' ? 100 : 0
    }))

    const response = NextResponse.json({
      timestamps,
      metrics: processedMetrics,
    })

    // Add cache control headers
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59')

    return response
  } catch (error) {
    console.error('Failed to fetch metrics history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics history' },
      { status: 500 }
    )
  }
} 