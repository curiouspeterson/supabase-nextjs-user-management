import { NextResponse } from 'next/server';
import { SchedulerMonitor } from '@/services/scheduler/monitor';

export async function GET() {
  try {
    const monitor = new SchedulerMonitor();
    const health = await monitor.checkHealth();

    // Set appropriate status code based on health status
    const status = health.status === 'healthy' ? 200 :
                  health.status === 'degraded' ? 429 : 500;

    return NextResponse.json(health, { status });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'critical',
      metrics: {
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 0,
        last_run_status: 'error',
        error_message: 'Health check failed'
      },
      coverage: [],
      alerts: ['Health check system error']
    }, { status: 500 });
  }
} 