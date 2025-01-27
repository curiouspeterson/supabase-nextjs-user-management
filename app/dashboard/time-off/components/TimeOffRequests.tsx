'use client'

import { createClient } from '@/utils/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/supabase'

type TimeOffRequestRow = Database['public']['Tables']['time_off_requests']['Row']

interface TimeOffRequest extends TimeOffRequestRow {
  user_id: string
  reason: string
}

export async function TimeOffRequests() {
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