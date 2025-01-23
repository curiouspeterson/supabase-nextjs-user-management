'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/lib/database.types'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks'
import { TimeOffRequestDialog } from '@/components/time-off/time-off-request-dialog'
import { TimeOffRequestWithReviewer, TimeOffStatus } from '@/lib/types/time-off'
import { updateTimeOffRequest } from '@/lib/api/time-off'
import { Loader2 } from 'lucide-react'

type DbTimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']

interface TimeOffRequestResponse extends Omit<DbTimeOffRequest, 'employee_id' | 'reviewed_by'> {
  employee: {
    id: string
    email: string
    full_name: string | null
  }
  reviewer: {
    id: string
    email: string
    full_name: string | null
  } | null
}

export default function TimeOffPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [requests, setRequests] = React.useState<TimeOffRequestWithReviewer[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedTab, setSelectedTab] = React.useState<TimeOffStatus>('Pending')
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          employee:employee_id(
            id,
            email,
            full_name
          ),
          reviewer:reviewed_by(
            id,
            email,
            full_name
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to match our expected types
      const transformedData: TimeOffRequestWithReviewer[] = (data as TimeOffRequestResponse[]).map(request => ({
        ...request,
        employee: {
          id: request.employee.id,
          email: request.employee.email,
          full_name: request.employee.full_name ?? ''
        },
        reviewer: request.reviewer ? {
          id: request.reviewer.id,
          email: request.reviewer.email,
          full_name: request.reviewer.full_name ?? ''
        } : null
      }))

      setRequests(transformedData)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to load time off requests. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateStatus(id: string, status: TimeOffStatus) {
    if (!user) return

    try {
      const { error } = await updateTimeOffRequest(id, {
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Time off request has been updated.',
      })

      fetchRequests()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to update time off request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const filteredRequests = requests.filter(
    (request) => request.status === selectedTab
  )

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Off</h1>
          <p className="text-muted-foreground">
            View and manage time off requests
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Request Time Off</Button>
      </div>

      <Tabs value={selectedTab} onValueChange={(value: TimeOffStatus) => setSelectedTab(value)}>
        <TabsList>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Declined">Declined</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No requests found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>
                      {request.employee?.full_name || 'Unknown Employee'}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(request.start_date), 'PPP')} -{' '}
                      {format(new Date(request.end_date), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium">Type:</span> {request.type}
                      </div>
                      {request.notes && (
                        <div>
                          <span className="font-medium">Notes:</span>{' '}
                          {request.notes}
                        </div>
                      )}
                      {request.reviewed_by && (
                        <div>
                          <span className="font-medium">Reviewed by:</span>{' '}
                          {request.reviewer?.full_name || 'Unknown'}
                        </div>
                      )}
                      {request.reviewed_at && (
                        <div>
                          <span className="font-medium">Reviewed on:</span>{' '}
                          {format(new Date(request.reviewed_at), 'PPP')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {selectedTab === 'Pending' && (
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleUpdateStatus(request.id, 'Declined')
                        }
                      >
                        Decline
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateStatus(request.id, 'Approved')
                        }
                      >
                        Approve
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TimeOffRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchRequests}
      />
    </div>
  )
} 