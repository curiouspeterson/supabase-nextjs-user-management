import { Suspense } from 'react'
import { getTimeOffRequests } from '@/app/actions/time-off'
import TimeOffList from '@/components/TimeOffList'
import ErrorBoundary from '@/components/error-boundary'
import { Loader2 } from 'lucide-react'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Time Off Management | Schedule Master',
  description: 'Manage employee time off requests and approvals',
}

export default async function TimeOffPage() {
  const initialRequests = await getTimeOffRequests()
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Time Off Management</h1>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <TimeOffList initialRequests={initialRequests} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 