'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useHealthMonitor } from '@/hooks/use-health-monitor';
import { cn } from '@/lib/utils';
import MetricCharts from './MetricCharts';
import type { SystemStatus, HealthResponse } from '@/services/health/types';
import { useEffect } from 'react';

interface HealthDashboardUIProps {
  initialData?: HealthResponse;
}

const statusColors = {
  healthy: {
    color: 'text-green-700',
    background: 'bg-green-100'
  },
  degraded: {
    color: 'text-yellow-700',
    background: 'bg-yellow-100'
  },
  unhealthy: {
    color: 'text-red-700',
    background: 'bg-red-100'
  }
} as const;

export default function HealthDashboardUI({ initialData }: HealthDashboardUIProps) {
  const { status, metrics, isMonitoring, startMonitoring } = useHealthMonitor({
    onStatusChange: (newStatus) => {
      console.log('Health status changed:', newStatus);
    },
  });

  // Start monitoring when component mounts
  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  const getStatusColor = (status: SystemStatus) => {
    return statusColors[status.status] || {
      color: 'text-gray-700',
      background: 'bg-gray-100'
    };
  };

  const renderStatusBadge = (status: SystemStatus) => {
    const { color, background } = getStatusColor(status);
    return (
      <Badge className={cn('capitalize', color, background)}>
        {status.status}
      </Badge>
    );
  };

  // Show loading state
  if (!initialData && !status) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <Skeleton className="h-8 w-24" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[200px]" />
        </Card>
      </div>
    );
  }

  const currentStatus = status || initialData?.status;
  const currentMetrics = metrics || initialData?.metrics;

  if (!currentStatus || !currentMetrics) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">System Status</h2>
            <Badge className={cn('capitalize', 'text-gray-700', 'bg-gray-100')}>
              Unknown
            </Badge>
          </div>
        </Card>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to retrieve system status.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">System Status</h2>
          {renderStatusBadge(currentStatus)}
        </div>
      </Card>

      {currentStatus.status === 'unhealthy' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System is experiencing critical issues. Please check the metrics below.
          </AlertDescription>
        </Alert>
      )}

      {currentStatus.status === 'degraded' && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System performance is degraded. Some features may be affected.
          </AlertDescription>
        </Alert>
      )}

      <MetricCharts metrics={currentMetrics} />
    </div>
  );
} 