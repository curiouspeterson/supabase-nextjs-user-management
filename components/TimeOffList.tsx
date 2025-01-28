'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { useTimeOffStore } from '@/lib/stores/time-off-store'
import type { TimeOffRequest } from '@/types'

export function TimeOffList() {
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()
  const { handleError } = useErrorBoundary()
  const { requests, updateRequest } = useTimeOffStore()
  const supabase = createClientComponentClient()

  React.useEffect(() => {
    const fetchTimeOffRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('time_off_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Update store with fetched requests
        requests.forEach(request => {
          updateRequest(request)
        })
      } catch (error) {
        handleError(error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch time off requests',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeOffRequests()
  }, [supabase, updateRequest, handleError, toast])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!requests.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No time off requests found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TimeOffRow key={request.id} request={request} />
        ))}
      </TableBody>
    </Table>
  )
}

function TimeOffRow({ request }: { request: TimeOffRequest }) {
  const { toast } = useToast()
  const { handleError } = useErrorBoundary()
  const { updateRequest } = useTimeOffStore()
  const [isUpdating, setIsUpdating] = React.useState(false)
  const supabase = createClientComponentClient()

  const handleStatusUpdate = React.useCallback(async (status: 'APPROVED' | 'REJECTED') => {
    try {
      setIsUpdating(true)

      const { error } = await supabase
        .from('time_off_requests')
        .update({ status })
        .eq('id', request.id)

      if (error) throw error

      updateRequest({ ...request, status })
      toast({
        title: 'Status updated',
        description: `Time off request has been ${status.toLowerCase()}`
      })
    } catch (error) {
      handleError(error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }, [request, supabase, updateRequest, handleError, toast])

  return (
    <TableRow>
      <TableCell className="capitalize">{request.type.toLowerCase()}</TableCell>
      <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
      <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
      <TableCell className="capitalize">{request.status.toLowerCase()}</TableCell>
      <TableCell>
        {request.status === 'PENDING' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('APPROVED')}
              disabled={isUpdating}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={isUpdating}
            >
              Reject
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
} 