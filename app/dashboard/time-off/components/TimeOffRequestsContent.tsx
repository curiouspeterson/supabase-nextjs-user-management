'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { useHealthMonitor } from '@/hooks/use-health-monitor'
import { fetchTimeOffRequests } from '@/services/time-off'
import type { TimeOffRequest } from '@/services/time-off/types'

const TYPE_LABELS = {
  'VACATION': 'Vacation',
  'SICK': 'Sick Leave',
  'PERSONAL': 'Personal',
  'BEREAVEMENT': 'Bereavement',
  'JURY_DUTY': 'Jury Duty',
  'UNPAID': 'Unpaid Leave'
} as const

const STATUS_VARIANTS = {
  'PENDING': 'default',
  'APPROVED': 'success',
  'REJECTED': 'destructive'
} as const

export default function TimeOffRequestsContent() {
  const { trackError } = useHealthMonitor()
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null)

  const { data: requests, error, isLoading } = useQuery({
    queryKey: ['timeOffRequests'],
    queryFn: fetchTimeOffRequests,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load time off requests'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      trackError('TIME_OFF', 'FETCH_REQUESTS', { error: errorMessage })
    }
  }, [error, toast, trackError])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load time off requests. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests?.map(request => (
        <Card
          key={request.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedRequest(request)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {request.employee?.full_name || 'Unknown Employee'}
              </h3>
              <p className="text-sm text-gray-500">
                {TYPE_LABELS[request.type || 'PERSONAL']} • 
                {format(new Date(request.start_date), 'MMM d, yyyy')} - 
                {format(new Date(request.end_date), 'MMM d, yyyy')}
              </p>
              {request.notes && (
                <p className="mt-2 text-sm text-gray-600">
                  {request.notes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[request.status || 'PENDING']}>
                {request.status || 'PENDING'}
              </Badge>
              {request.is_paid && (
                <Badge variant="outline">Paid</Badge>
              )}
            </div>
          </div>
        </Card>
      ))}

      {requests?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No time off requests found
        </div>
      )}

      {selectedRequest && (
        <TimeOffRequestDialog
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  )
} 