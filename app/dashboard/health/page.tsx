import { Suspense } from 'react';
import { SchedulerMonitor } from '@/services/scheduler/monitor';
import { HealthDashboardUI } from './components/HealthDashboardUI';
import { HealthDashboardLoading } from './components/HealthDashboardLoading';
import { HealthDashboardError } from '@/components/health-dashboard-error';
import { ErrorBoundary } from '@/components/error-boundary';
import { transformHealthData } from './utils';

async function getHealthData() {
  const monitor = new SchedulerMonitor();
  const data = await monitor.checkHealth();
  return transformHealthData(data);
}

export default async function HealthDashboardPage() {
  const initialData = await getHealthData();

  return (
    <ErrorBoundary fallback={HealthDashboardError}>
      <Suspense fallback={<HealthDashboardLoading />}>
        <HealthDashboardUI initialData={initialData} />
      </Suspense>
    </ErrorBoundary>
  );
} 