import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import type { 
  SystemStatus, 
  HealthResponse, 
  SchedulerMetrics 
} from '@/services/health/types';

// Configure edge runtime
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

// Rate limiting types
type RateLimitEntry = number[]; // Array of timestamps
type RateLimitMap = Map<string, RateLimitEntry>;

// Rate limiting map
const rateLimit: RateLimitMap = new Map();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function GET(): Promise<NextResponse<HealthResponse>> {
  try {
    // Get client IP for rate limiting
    const headersList = headers();
    const clientIp = headersList.get('x-forwarded-for') || 'unknown';
    
    // Implement rate limiting
    const now = Date.now();
    const clientRequests: number[] = rateLimit.get(clientIp) || [];
    const recentRequests = clientRequests.filter((time: number) => now - time < RATE_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (now + RATE_WINDOW).toString(),
          }
        }
      );
    }
    
    recentRequests.push(now);
    rateLimit.set(clientIp, recentRequests);

    const supabase = createClient();
    
    // Get latest system metrics with caching
    const { data: metrics, error: metricsError } = await supabase
      .from('scheduler_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (metricsError) throw metricsError;

    // Calculate system status based on metrics
    const status = determineSystemStatus(metrics);

    const response = NextResponse.json({
      status,
      metrics: {
        cpu_usage: metrics.schedule_generation_time,
        memory_usage: metrics.coverage_deficit,
        active_connections: metrics.overtime_violations,
        request_latency: metrics.pattern_errors,
        error_rate: metrics.last_run_status === 'error' ? 100 : 0
      }
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
    response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT - recentRequests.length).toString());
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = NextResponse.json(
      {
        status: {
          status: 'unhealthy' as const,
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
      } satisfies HealthResponse,
      { status: 500 }
    );

    // Add security headers even for error responses
    errorResponse.headers.set('X-Content-Type-Options', 'nosniff');
    errorResponse.headers.set('X-Frame-Options', 'DENY');
    errorResponse.headers.set('X-XSS-Protection', '1; mode=block');
    errorResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    errorResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return errorResponse;
  }
}

function determineSystemStatus(metrics: SchedulerMetrics): SystemStatus {
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