'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { HealthStatus } from '../types';
import { refreshHealthData } from '../actions';

interface Props {
  initialData: HealthStatus;
}

export function HealthDashboardUI({ initialData }: Props) {
  const [health, setHealth] = useState<HealthStatus>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const newData = await refreshHealthData();
      setHealth(newData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh health data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scheduler Health Dashboard</h1>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <p className="text-2xl font-bold mt-2">{health.status}</p>
            </div>
            {getStatusIcon(health.status)}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500">Coverage Deficit</p>
          <p className="text-2xl font-bold mt-2">
            {health.metrics.coverage_deficit}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500">Pattern Errors</p>
          <p className="text-2xl font-bold mt-2">
            {health.metrics.pattern_errors}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500">Overtime Violations</p>
          <p className="text-2xl font-bold mt-2">
            {health.metrics.overtime_violations}
          </p>
        </Card>
      </div>

      {health.alerts.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
          <div className="space-y-2">
            {health.alerts.map((alert, index) => (
              <Alert key={index} variant="warning">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Coverage Report</h2>
        <div className="space-y-4">
          {health.coverage.map((day) => (
            <div key={day.date} className="border-t pt-4 first:border-t-0 first:pt-0">
              <h3 className="font-medium mb-2">{day.date}</h3>
              <div className="space-y-2">
                {day.periods.map((period, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {period.start_time} - {period.end_time}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          period.actual >= period.required
                            ? 'success'
                            : 'destructive'
                        }
                      >
                        {period.actual}/{period.required} Staff
                      </Badge>
                      <Badge variant="outline">
                        {period.supervisors} Supervisors
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">System Metrics</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Last Schedule Generation Time
            </span>
            <span className="font-medium">
              {health.metrics.schedule_generation_time}ms
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Last Run Status</span>
            <Badge
              variant={
                health.metrics.last_run_status === 'success'
                  ? 'success'
                  : 'destructive'
              }
            >
              {health.metrics.last_run_status}
            </Badge>
          </div>
          {health.metrics.error_message && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{health.metrics.error_message}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
} 