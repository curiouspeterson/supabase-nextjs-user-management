'use client';

import { useEffect, useState } from 'react';
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
  ChartData,
  ChartOptions
} from 'chart.js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useHealthMonitor } from '@/hooks/use-health-monitor';
import { fetchMetricsHistory } from '@/services/health/index';
import type { HealthMetrics } from '@/services/health/types';

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

interface MetricChartsProps {
  metrics: HealthMetrics;
}

export default function MetricCharts({ metrics }: MetricChartsProps) {
  const [historicalData, setHistoricalData] = useState<{
    labels: string[]
    datasets: {
      cpu: number[]
      memory: number[]
      connections: number[]
      latency: number[]
      errors: number[]
    }
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetricsHistory(7)
      .then(setHistoricalData)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch metrics history'));
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!historicalData) {
    return null;
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const cpuData: ChartData<'line'> = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: historicalData.datasets.cpu,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const memoryData: ChartData<'line'> = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: historicalData.datasets.memory,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const connectionsData: ChartData<'line'> = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'Active Connections',
        data: historicalData.datasets.connections,
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  const latencyData: ChartData<'line'> = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'Request Latency (ms)',
        data: historicalData.datasets.latency,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
      },
    ],
  };

  const errorData: ChartData<'line'> = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'Error Rate (%)',
        data: historicalData.datasets.errors,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <Line options={options} data={cpuData} />
      </Card>
      <Card className="p-4">
        <Line options={options} data={memoryData} />
      </Card>
      <Card className="p-4">
        <Line options={options} data={connectionsData} />
      </Card>
      <Card className="p-4">
        <Line options={options} data={latencyData} />
      </Card>
      <Card className="p-4">
        <Line options={options} data={errorData} />
      </Card>
    </div>
  );
} 