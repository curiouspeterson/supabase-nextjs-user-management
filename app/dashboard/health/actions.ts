'use server';

import { SchedulerMonitor } from '@/services/scheduler/monitor';
import type { HealthStatus } from './types';
import { transformHealthData } from './utils';
import { revalidatePath } from 'next/cache'

export async function refreshHealthData(): Promise<HealthStatus> {
  const monitor = new SchedulerMonitor();
  const data = await monitor.checkHealth();
  return transformHealthData(data);
}

/**
 * Server action to reset the error state and refresh the page data
 */
export async function resetHealthDashboard() {
  // Revalidate the health dashboard page to refresh the data
  revalidatePath('/dashboard/health')
} 