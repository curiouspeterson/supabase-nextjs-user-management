'use client'

import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/supabase'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'

type TimeOffRequestRow = Database['public']['Tables']['time_off_requests']['Row']

interface TimeOffRequest extends TimeOffRequestRow {
  user_id: string
  reason: string
}

export function TimeOffRequestsContent() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Please sign in to view your time off requests.')
          return
        }

        const { data: requestsData, error: requestsError } = await supabase
          .from('time_off_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })

        if (requestsError) {
          throw requestsError
        }

        if (!requestsData) {
          setRequests([])
          return
        }

        // Transform the data to include required fields
        const transformedRequests: TimeOffRequest[] = requestsData.map(request => ({
          ...request,
          user_id: request.employee_id, // Map employee_id to user_id
          reason: request.notes || '', // Map notes to reason
        }))

        setRequests(transformedRequests)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching requests')
        toast({
          title: 'Error',
          description: 'Failed to fetch time off requests',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (requests.length === 0) {
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
                  : request.status === 'Declined'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {request.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Type:</span> {request.type}
            </p>
            <p className="text-sm text-gray-600">{request.reason}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 