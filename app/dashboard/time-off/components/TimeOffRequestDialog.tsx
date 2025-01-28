'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useHealthMonitor } from '@/hooks/use-health-monitor'
import { updateTimeOffRequest } from '@/services/time-off'
import { TimeOffRequest, TimeOffRequestStatus } from '@/services/time-off/types'

interface TimeOffRequestDialogProps {
  request: TimeOffRequest
  onClose: () => void
}

const STATUS_VARIANTS = {
  [TimeOffRequestStatus.PENDING]: 'default',
  [TimeOffRequestStatus.APPROVED]: 'success',
  [TimeOffRequestStatus.REJECTED]: 'destructive'
} as const

export default function TimeOffRequestDialog({ request, onClose }: TimeOffRequestDialogProps) {
  const { trackError } = useHealthMonitor()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: TimeOffRequestStatus) => {
    setIsLoading(true)
    try {
      await updateTimeOffRequest(request.id, { status: newStatus })
      toast({
        title: 'Request Updated',
        description: `Time off request has been ${newStatus.toLowerCase()}`,
        variant: 'default'
      })
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update request'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      trackError('TIME_OFF', 'UPDATE_STATUS', { error: errorMessage, requestId: request.id })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Time Off Request Details</DialogTitle>
          <DialogDescription>
            Review and manage time off request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Employee</h4>
            <p className="text-sm text-gray-600">
              {request.employee?.full_name || 'Unknown Employee'}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Date Range</h4>
            <p className="text-sm text-gray-600">
              {format(new Date(request.start_date), 'MMM d, yyyy')} - 
              {format(new Date(request.end_date), 'MMM d, yyyy')}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Type</h4>
            <p className="text-sm text-gray-600">
              {request.type}
              {request.is_paid && (
                <Badge variant="outline" className="ml-2">Paid</Badge>
              )}
            </p>
          </div>

          {request.notes && (
            <div>
              <h4 className="font-medium">Notes</h4>
              <p className="text-sm text-gray-600">{request.notes}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium">Status</h4>
            <Badge variant={STATUS_VARIANTS[request.status]}>
              {request.status}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {request.status === TimeOffRequestStatus.PENDING && (
            <>
              <Button
                variant="default"
                onClick={() => handleStatusUpdate(TimeOffRequestStatus.APPROVED)}
                disabled={isLoading}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(TimeOffRequestStatus.REJECTED)}
                disabled={isLoading}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 