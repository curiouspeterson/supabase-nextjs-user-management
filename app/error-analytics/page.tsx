'use client'

import { useState, useEffect } from 'react'
import { useErrorAnalyticsContext } from '@/contexts/error-analytics-context'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Clock, TrendingUp } from 'lucide-react'

export default function ErrorAnalyticsDashboard() {
  const { getErrorSummary, getErrorTrends, isLoading } = useErrorAnalyticsContext()
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date()
        const startDate = new Date()

        switch (timeRange) {
          case '24h':
            startDate.setHours(startDate.getHours() - 24)
            break
          case '7d':
            startDate.setDate(startDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(startDate.getDate() - 30)
            break
        }

        const [summaryData, trendsData] = await Promise.all([
          getErrorSummary({ startDate, endDate }),
          getErrorTrends({ startDate, endDate })
        ])

        setSummary(summaryData)
        setTrends(trendsData)
      } catch (err) {
        console.error('Failed to fetch analytics data:', err)
      }
    }

    fetchData()
  }, [timeRange, getErrorSummary, getErrorTrends])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Error Analytics Dashboard</h1>
        
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Errors"
          value={summary?.total ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Open Issues"
          value={summary?.byStatus?.open ?? 0}
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Critical Errors"
          value={summary?.bySeverity?.critical ?? 0}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Errors by Severity</h3>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="space-y-2">
              {summary?.bySeverity && Object.entries(summary.bySeverity).map(([severity, count]) => (
                <div key={severity} className="flex justify-between items-center">
                  <span className="capitalize">{severity}</span>
                  <span className="font-mono">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Error Trends</h3>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="space-y-2">
              {trends?.data && trends.data.map((point: any) => (
                <div key={point.date} className="flex justify-between items-center">
                  <span>{new Date(point.date).toLocaleDateString()}</span>
                  <span className="font-mono">{point.total}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  isLoading
}: {
  title: string
  value: number
  icon: React.ReactNode
  isLoading: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p className="text-2xl font-mono">{value}</p>
      )}
    </Card>
  )
} 