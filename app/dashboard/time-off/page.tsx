import { createClient } from '@/utils/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { TimeOffRequestsLoading } from './components/TimeOffRequestsLoading'
import { TimeOffRequestsError } from '@/components/time-off-error'
import { ErrorBoundary } from '@/components/error-boundary'
import type { Database } from '@/types/supabase'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Time Off Management | Schedule Master',
  description: 'Manage employee time off requests and approvals',
}

type TimeOffRequestRow = Database['public']['Tables']['time_off_requests']['Row']

interface TimeOffRequest extends TimeOffRequestRow {
  user_id: string
  reason: string
}

// Main content component
export async function TimeOffRequestsContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in to view your time off requests.</div>
  }

  const { data: requests } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  if (!requests) {
    return <div>No time off requests found.</div>
  }

  return (
    <div className="space-y-4">
      {requests.map((request: TimeOffRequest) => (
        <div key={request.id} className="p-4 border rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold">
                {formatDistanceToNow(new Date(request.start_date), { addSuffix: true })}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-sm rounded ${
                request.status === 'Approved'
                  ? 'bg-green-100 text-green-800'
                  : request.status === 'Denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {request.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Type:</span> {request.request_type}
            </p>
            <p className="text-sm text-gray-600">{request.reason}</p>
          </div>
        </div>
      ))}
    </div>
  )
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