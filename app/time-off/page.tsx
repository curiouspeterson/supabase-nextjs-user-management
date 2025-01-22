'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Calendar, Clock, Loader2 } from 'lucide-react'
import { TimeOffRequestDialog } from '@/components/time-off/time-off-request-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface TimeOffRequest {
  id: string
  employeeId: string
  employeeName: string
  startDate: string
  endDate: string
  type: 'Vacation' | 'Sick' | 'Personal' | 'Training'
  status: 'Pending' | 'Approved' | 'Declined'
  notes?: string
  reviewedBy?: string
  reviewedAt?: string
  submittedAt: string
}

// Sample data
const timeOffRequests: TimeOffRequest[] = [
  {
    id: '1',
    employeeId: '101',
    employeeName: 'John Doe',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    type: 'Vacation',
    status: 'Approved',
    notes: 'Annual family vacation',
    reviewedBy: 'Sarah Manager',
    reviewedAt: '2024-02-01T10:00:00Z',
    submittedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    employeeId: '102',
    employeeName: 'Jane Smith',
    startDate: '2024-03-10',
    endDate: '2024-03-11',
    type: 'Personal',
    status: 'Pending',
    notes: 'Doctor appointment',
    submittedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: '3',
    employeeId: '103',
    employeeName: 'Mike Johnson',
    startDate: '2024-03-25',
    endDate: '2024-03-26',
    type: 'Training',
    status: 'Declined',
    notes: 'CPR recertification',
    reviewedBy: 'Sarah Manager',
    reviewedAt: '2024-02-15T14:30:00Z',
    submittedAt: '2024-01-20T15:30:00Z',
  },
]

const statusColors = {
  Pending: 'bg-yellow-500',
  Approved: 'bg-green-500',
  Declined: 'bg-red-500',
}

const typeColors = {
  Vacation: 'bg-blue-500',
  Sick: 'bg-purple-500',
  Personal: 'bg-orange-500',
  Training: 'bg-cyan-500',
}

export default function TimeOffPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>(timeOffRequests)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreateRequest = async (data: any) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const newRequest: TimeOffRequest = {
        id: Math.random().toString(),
        employeeId: '101', // Would come from auth
        employeeName: 'John Doe', // Would come from auth
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        status: 'Pending',
        notes: data.notes,
        submittedAt: new Date().toISOString(),
      }
      
      setRequests([newRequest, ...requests])
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to create request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: TimeOffRequest['status']) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRequests(
        requests.map((request) =>
          request.id === id
            ? {
                ...request,
                status,
                reviewedBy: 'Sarah Manager', // Would come from auth
                reviewedAt: new Date().toISOString(),
              }
            : request
        )
      )
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: TimeOffRequest['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/10 text-green-500'
      case 'Declined':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-yellow-500/10 text-yellow-500'
    }
  }

  const filterRequests = (status: TimeOffRequest['status'] | 'all') => {
    if (status === 'all') return requests
    return requests.filter((request) => request.status === status)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Time Off Requests</h1>
          <p className="text-sm text-muted-foreground">
            Request and manage time off for dispatch staff
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          New Request
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Declined">Declined</TabsTrigger>
        </TabsList>

        {(['all', 'Pending', 'Approved', 'Declined'] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterRequests(status).map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{request.employeeName}</CardTitle>
                        <CardDescription>{request.type} Leave</CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(request.status)}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {new Date(request.startDate).toLocaleDateString()} -{' '}
                        {new Date(request.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-muted-foreground">{request.notes}</p>
                    )}
                    {request.reviewedBy && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Reviewed by {request.reviewedBy} on{' '}
                          {new Date(request.reviewedAt!).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {request.status === 'Pending' && (
                    <CardFooter className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'Declined')}
                        disabled={loading}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'Approved')}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <TimeOffRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateRequest}
      />
    </div>
  )
} 