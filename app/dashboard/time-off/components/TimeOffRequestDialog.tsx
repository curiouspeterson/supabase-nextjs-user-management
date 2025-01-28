'use client'

import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { updateTimeOffRequest } from '@/services/time-off'
import { TimeOffRequest, TimeOffRequestStatus } from '@/services/time-off/types'
import { BaseTimeOffDialog, useTimeOffRequest, STATUS_VARIANTS, formatTimeOffDates } from '@/components/time-off/base-dialog'

interface TimeOffRequestDialogProps {
  request: TimeOffRequest
  onClose: () => void
}

export default function TimeOffRequestDialog({ request, onClose }: TimeOffRequestDialogProps) {
  const { isLoading, setIsLoading, handleError, showSuccessMessage } = useTimeOffRequest()

  const handleStatusUpdate = async (newStatus: TimeOffRequestStatus) => {
    setIsLoading(true)
    try {
      await updateTimeOffRequest(request.id, { status: newStatus })
      showSuccessMessage(`Time off request has been ${newStatus.toLowerCase()}`)
      onClose()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseTimeOffDialog
      open={true}
      onClose={onClose}
      title="Time Off Request Details"
      description="Review and manage time off request"
    >
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
            {formatTimeOffDates(request)}
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
    </BaseTimeOffDialog>
  )
} 