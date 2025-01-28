import { Suspense } from 'react'
import { TimeOffList } from '@/components/TimeOffList'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Time Off Management | Schedule Master',
  description: 'Manage employee time off requests and approvals',
}

export default function TimeOffPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Time Off Requests</h1>
        <p className="text-muted-foreground">
          Manage employee time off requests and approvals
        </p>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <TimeOffList />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 