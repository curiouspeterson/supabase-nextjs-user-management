'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useHealthMonitor } from '@/hooks/use-health-monitor';
import { fetchStatusColors } from '@/services/health';
import { cn } from '@/lib/utils';
import MetricCharts from './MetricCharts';
import type { SystemStatus } from '@/services/health/types';

interface HealthDashboardUIProps {
  initialData?: {
    status: SystemStatus;
    metrics: {
      coverage_deficit: number;
      overtime_violations: number;
      pattern_errors: number;
      schedule_generation_time: number;
    };
  };
}

export default function HealthDashboardUI({ initialData }: HealthDashboardUIProps) {
  const { trackError } = useHealthMonitor();

  // Fetch status colors
  const { data: statusColors, error: colorError } = useQuery({
    queryKey: ['statusColors'],
    queryFn: fetchStatusColors,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  if (colorError) {
    trackError('HEALTH', 'FETCH_COLORS', {
      error: colorError instanceof Error ? colorError.message : 'Failed to fetch status colors'
    });
  }

  const getStatusColor = (status: SystemStatus) => {
    if (!statusColors) {
      // Fallback colors if custom colors aren't loaded
      return {
        color: 'text-gray-700',
        background: 'bg-gray-100'
      };
    }

    const colorConfig = statusColors.find(c => c.status === status);
    return {
      color: colorConfig?.color_class || 'text-gray-700',
      background: colorConfig?.background_class || 'bg-gray-100'
    };
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">System Status</h2>
          {initialData ? (
            <Badge
              variant="outline"
              className={cn(
                'px-4 py-1',
                getStatusColor(initialData.status).color,
                getStatusColor(initialData.status).background
              )}
            >
              {initialData.status}
            </Badge>
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Coverage Deficit"
            value={initialData?.metrics.coverage_deficit}
            format={value => `${value}%`}
            threshold={20}
          />
          <MetricCard
            label="Overtime Violations"
            value={initialData?.metrics.overtime_violations}
            threshold={0}
          />
          <MetricCard
            label="Pattern Errors"
            value={initialData?.metrics.pattern_errors}
            threshold={0}
          />
          <MetricCard
            label="Generation Time"
            value={initialData?.metrics.schedule_generation_time}
            format={value => `${value}ms`}
            threshold={5000}
            thresholdComparator="gt"
          />
        </div>
      </Card>

      {/* Metrics History */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Metrics History</h2>
        <MetricCharts />
      </Card>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value?: number;
  format?: (value: number) => string;
  threshold?: number;
  thresholdComparator?: 'gt' | 'lt' | 'eq';
}

function MetricCard({
  label,
  value,
  format = value => value.toString(),
  threshold,
  thresholdComparator = 'gt'
}: MetricCardProps) {
  const isOverThreshold = threshold !== undefined && value !== undefined && (
    thresholdComparator === 'gt' ? value > threshold :
    thresholdComparator === 'lt' ? value < threshold :
    value === threshold
  );

  if (value === undefined) {
    return (
      <div className="rounded-lg border p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-16" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div
        className={cn(
          'mt-2 text-2xl font-semibold',
          isOverThreshold ? 'text-red-600' : 'text-gray-900'
        )}
      >
        {format(value)}
      </div>
    </div>
  );
} 