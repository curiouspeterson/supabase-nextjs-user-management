'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { TimeOffRequestDialog } from '@/components/time-off/time-off-request-dialog'
import { useUser } from '@/lib/hooks'
import { useErrorBoundary } from '@/lib/hooks/use-error-boundary'
import { useTimeOffStore } from '@/lib/stores/time-off-store'
import type { TimeOffRequest, TimeOffStatus } from '@/lib/types/time-off'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TimeOffRequestCard({ request }: { request: TimeOffRequest }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const getStatusColor = (status: TimeOffStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{request.type}</CardTitle>
            <Badge className={getStatusColor(request.status)}>
              {request.status}
            </Badge>
          </div>
          <CardDescription>
            Submitted on {format(new Date(request.submitted_at), 'PPP')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Date</span>
            <span>{format(new Date(request.start_date), 'PPP')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">End Date</span>
            <span>{format(new Date(request.end_date), 'PPP')}</span>
          </div>
          {request.notes && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm mt-1">{request.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Edit
          </Button>
        </CardFooter>
      </Card>
      <TimeOffRequestDialog
        request={request}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}

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
    <div className="space-y-4">
      {requests.map((request) => (
        <TimeOffRequestCard key={request.id} request={request} />
      ))}
    </div>
  )
} 