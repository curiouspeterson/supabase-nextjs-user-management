import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(cookies());
    
    // Get latest system metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('scheduler_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (metricsError) throw metricsError;

    // Calculate system status based on metrics
    const status = determineSystemStatus(metrics);

    return NextResponse.json({
      status,
      metrics: {
        cpu_usage: metrics.schedule_generation_time, // Using generation time as CPU proxy
        memory_usage: metrics.coverage_deficit, // Using coverage deficit as memory proxy
        active_connections: metrics.overtime_violations,
        request_latency: metrics.pattern_errors,
        error_rate: metrics.last_run_status === 'error' ? 100 : 0 // Convert error status to percentage
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: {
          status: 'unhealthy',
          message: 'Failed to retrieve system health status',
          timestamp: new Date().toISOString()
        },
        metrics: {
          cpu_usage: 0,
          memory_usage: 0,
          active_connections: 0,
          request_latency: 0,
          error_rate: 0
        }
      },
      { status: 500 }
    );
  }
}

function determineSystemStatus(metrics: any) {
  // Critical thresholds
  const CRITICAL_GENERATION_TIME = 10000; // 10 seconds
  const CRITICAL_COVERAGE_DEFICIT = 20; // 20% coverage deficit
  const CRITICAL_OVERTIME = 10; // 10 overtime violations
  const CRITICAL_PATTERN_ERRORS = 5;
  
  // Warning thresholds
  const WARNING_GENERATION_TIME = 5000; // 5 seconds
  const WARNING_COVERAGE_DEFICIT = 10; // 10% coverage deficit
  const WARNING_OVERTIME = 5; // 5 overtime violations
  const WARNING_PATTERN_ERRORS = 2;

  // Check for critical conditions
  if (
    metrics.schedule_generation_time >= CRITICAL_GENERATION_TIME ||
    metrics.coverage_deficit >= CRITICAL_COVERAGE_DEFICIT ||
    metrics.overtime_violations >= CRITICAL_OVERTIME ||
    metrics.pattern_errors >= CRITICAL_PATTERN_ERRORS
  ) {
    return {
      status: 'unhealthy',
      message: 'Critical scheduling thresholds exceeded',
      timestamp: new Date().toISOString()
    };
  }

  // Check for warning conditions
  if (
    metrics.schedule_generation_time >= WARNING_GENERATION_TIME ||
    metrics.coverage_deficit >= WARNING_COVERAGE_DEFICIT ||
    metrics.overtime_violations >= WARNING_OVERTIME ||
    metrics.pattern_errors >= WARNING_PATTERN_ERRORS
  ) {
    return {
      status: 'degraded',
      message: 'Scheduling performance is degraded',
      timestamp: new Date().toISOString()
    };
  }

  // System is healthy
  return {
    status: 'healthy',
    message: 'Scheduling system operational',
    timestamp: new Date().toISOString()
  };
} 