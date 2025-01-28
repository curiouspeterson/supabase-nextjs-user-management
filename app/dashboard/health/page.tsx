'use client';

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useHealthMonitor } from '@/hooks/use-health-monitor'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HealthPage() {
  const {
    status,
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  } = useHealthMonitor({
    interval: 30000,
    onStatusChange: (newStatus) => {
      console.log('Health status changed:', newStatus)
    }
  })

  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [startMonitoring, stopMonitoring])

  if (!status || !metrics) {
    return <LoadingSpinner />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500'
      case 'degraded':
        return 'text-yellow-500'
      case 'unhealthy':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">System Health Monitor</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(status.status)}`}>
                {status.status.toUpperCase()}
              </div>
              {status.message && (
                <p className="text-sm text-gray-500 mt-2">{status.message}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={metrics.cpu_usage} className="mb-2" />
              <span className="text-sm text-gray-500">{metrics.cpu_usage.toFixed(1)}%</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={metrics.memory_usage} className="mb-2" />
              <span className="text-sm text-gray-500">{metrics.memory_usage.toFixed(1)}%</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.active_connections}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.request_latency.toFixed(2)}ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.error_rate.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <time className="text-sm text-gray-500">
                {new Date(status.timestamp).toLocaleString()}
              </time>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
} 