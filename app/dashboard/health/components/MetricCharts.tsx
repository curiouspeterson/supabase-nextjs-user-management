'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useHealthMonitor } from '@/hooks/use-health-monitor';
import { fetchMetricsHistory } from '@/services/health';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default function MetricCharts() {
  const { trackError } = useHealthMonitor();
  
  // Fetch metrics history for the last 7 days
  const { data: metricsHistory, error, isLoading } = useQuery({
    queryKey: ['metricsHistory'],
    queryFn: () => fetchMetricsHistory({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      interval: '1 hour'
    }),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Process data for charts
  const chartData = useMemo(() => {
    if (!metricsHistory) return null;

    const labels = metricsHistory.map(m => 
      format(new Date(m.timestamp), 'MMM d, h:mm a')
    );

    return {
      labels,
      datasets: [
        {
          label: 'Coverage Deficit (%)',
          data: metricsHistory.map(m => m.metrics.coverage_deficit),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Overtime Violations',
          data: metricsHistory.map(m => m.metrics.overtime_violations),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Pattern Errors',
          data: metricsHistory.map(m => m.metrics.pattern_errors),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  }, [metricsHistory]);

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load metrics history';
    trackError('HEALTH', 'FETCH_METRICS_HISTORY', { error: errorMessage });
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!chartData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No metrics data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Chart */}
      <Card className="p-6">
        <div className="h-[400px]">
          <Line options={chartOptions} data={chartData} />
        </div>
      </Card>

      {/* Performance Chart */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Schedule Generation Performance</h3>
        <div className="h-[200px]">
          <Line
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Time (ms)'
                  }
                }
              }
            }}
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: 'Generation Time (ms)',
                  data: metricsHistory!.map(m => m.metrics.schedule_generation_time),
                  borderColor: 'rgb(153, 102, 255)',
                  backgroundColor: 'rgba(153, 102, 255, 0.5)',
                }
              ]
            }}
          />
        </div>
      </Card>
    </div>
  );
} 