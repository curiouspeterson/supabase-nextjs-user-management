import { Metadata } from 'next'
import { Suspense } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import HealthDashboardUI from './components/HealthDashboardUI'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'System Health Dashboard',
  description: 'Monitor system health and performance metrics in real-time',
}

export const dynamic = 'force-dynamic'
export const revalidate = 30

async function getInitialHealthData() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scheduler/health`, {
    next: { revalidate: 30 }
  })
  if (!response.ok) throw new Error('Failed to fetch health data')
  return response.json()
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to load health data: {error.message}
      </AlertDescription>
    </Alert>
  )
}

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}

export default async function HealthPage() {
  const initialData = await getInitialHealthData()

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<LoadingFallback />}>
        <HealthDashboardUI initialData={initialData} />
      </Suspense>
    </ErrorBoundary>
  )
} 