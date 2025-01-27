'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

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
import { Badge } from '@/components/ui/badge'

type RequestStatus = 'Pending' | 'Approved' | 'Declined'

interface TimeOffRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  type: 'Vacation' | 'Sick' | 'Personal' | 'Training'
  status: RequestStatus
  notes: string
  created_at: string
  updated_at: string
  employee_role: 'Dispatcher' | 'Management' | 'Shift Supervisor'
}

function getStatusVariant(status: RequestStatus) {
  switch (status) {
    case 'Approved':
      return 'default'
    case 'Declined':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function TimeOffPage() {
  const { user, loading: userLoading } = useUser()
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('Pending')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setError('Please sign in to view time off requests')
      setIsLoading(false)
      return
    }

    async function fetchRequests() {
      try {
        const supabase = createClient()
        
        if (!user) {
          throw new Error('User not found')
        }

        console.log('Debug: Starting request fetch for user:', user.id)
        
        // Use the stored function
        const { data, error: fetchError } = await supabase
          .rpc('get_time_off_requests')

        if (fetchError) {
          console.error('Function query error:', fetchError)
          console.error('Full error details:', JSON.stringify(fetchError, null, 2))
          throw fetchError
        }

        console.log('Debug: Function response:', { data, error: fetchError })
        setRequests(data as TimeOffRequest[])
      } catch (err) {
        console.error('Detailed error:', err)
        setError('Failed to fetch time off requests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [user, userLoading])

  if (userLoading || isLoading) {
    return (
      <div className="container py-10">
        <div data-testid="loading-spinner" className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div role="alert" className="text-destructive">
          {error}
        </div>
      </div>
    )
  }

  const filteredRequests = requests.filter(request => request.status === selectedStatus)

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Off</h1>
          <p className="text-muted-foreground">View and manage time off requests</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          Request Time Off
        </Button>
      </div>

      <Tabs defaultValue="Pending" onValueChange={(value) => setSelectedStatus(value as RequestStatus)}>
        <TabsList aria-label="Filter time off requests">
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Declined">Declined</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedStatus}>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <p className="text-muted-foreground">No {selectedStatus.toLowerCase()} requests found.</p>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} role="article">
                  <CardHeader>
                    <CardTitle>
                      Employee ID: {request.employee_id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.start_date).toLocaleDateString()} -{' '}
                      {new Date(request.end_date).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p>{request.notes}</p>
                    <div className="mt-4">
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TimeOffRequestDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRequestSubmitted={() => {
          setIsDialogOpen(false)
          // Refresh requests
          window.location.reload()
        }}
      />
    </div>
  )
} 