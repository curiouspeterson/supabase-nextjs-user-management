import { NextResponse } from 'next/server';
import { SchedulerMonitor } from '@/services/scheduler/monitor';

export async function GET(request: Request) {
  try {
    const monitor = new SchedulerMonitor();
    const health = await monitor.checkHealth();

    // Set appropriate status code based on health status
    const status = health.status === 'healthy' ? 200 :
                  health.status === 'degraded' ? 429 : 500;

    return NextResponse.json(health, { status });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'critical',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 