'use client'

import { useOptimistic, useTransition } from 'react'
import { updateTimeOffStatus } from '@/app/actions/time-off'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { TimeOffRequest } from '@/types'

interface TimeOffListProps {
  initialRequests: TimeOffRequest[]
}

export default function TimeOffList({ initialRequests }: TimeOffListProps) {
  const [requests, setRequests] = useOptimistic(initialRequests)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
    // Optimistic update
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status } : req
      )
    )

    startTransition(async () => {
      try {
        await updateTimeOffStatus(id, status)
        toast({
          title: "Success",
          description: `Request ${status} successfully`
        })
      } catch (error) {
        // Revert optimistic update on error
        setRequests(initialRequests)
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update request status"
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No time off requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employee?.full_name}</TableCell>
                <TableCell>{format(new Date(request.start_date), 'PP')}</TableCell>
                <TableCell>{format(new Date(request.end_date), 'PP')}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === 'approved'
                        ? 'success'
                        : request.status === 'rejected'
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 