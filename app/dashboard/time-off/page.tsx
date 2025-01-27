import { Suspense } from 'react'
import { Metadata } from 'next'
import { TimeOffRequestsContent } from './components/TimeOffRequestsContent'
import { TimeOffRequestsLoading } from './components/TimeOffRequestsLoading'
import { TimeOffRequestsError } from '@/components/time-off-error'
import { ErrorBoundary } from '@/components/error-boundary'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Time Off Management | Schedule Master',
  description: 'Manage employee time off requests and approvals',
}

export default function TimeOffPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Time Off Requests</h1>
      <ErrorBoundary fallback={TimeOffRequestsError}>
        <Suspense fallback={<TimeOffRequestsLoading />}>
          <TimeOffRequestsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 