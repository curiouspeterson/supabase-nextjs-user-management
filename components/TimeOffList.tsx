import { TimeOffRequest } from '@/lib/types/time-off'
import { formatDate } from '@/lib/utils/date'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

interface TimeOffListProps {
  requests: TimeOffRequest[]
  currentUserId: string
}

export default function TimeOffList({ requests, currentUserId }: TimeOffListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const supabase = createClientComponentClient()

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      setLoading(prev => ({ ...prev, [requestId]: true }))

      const { error } = await supabase
        .rpc('update_time_off_request_status', {
          p_request_id: requestId,
          p_status: newStatus
        })

      if (error) throw error

      toast({
        title: 'Status Updated',
        description: `Request status has been updated to ${newStatus.toLowerCase()}`,
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      })
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{request.employee_name}</span>
                  {request.employee_email && (
                    <span className="text-sm text-gray-500">
                      {request.employee_email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{request.request_type}</TableCell>
              <TableCell>{formatDate(request.start_date)}</TableCell>
              <TableCell>{formatDate(request.end_date)}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(request.status)}>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                      disabled={loading[request.id]}
                    >
                      {loading[request.id] ? (
                        <Skeleton className="h-4 w-4" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                      disabled={loading[request.id]}
                    >
                      {loading[request.id] ? (
                        <Skeleton className="h-4 w-4" />
                      ) : (
                        'Reject'
                      )}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No time off requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 