'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
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

interface TimeOffRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  employee: {
    full_name: string
  }
}

export default function TimeOffList() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          employee:employees(full_name)
        `)
        .order('start_date', { ascending: false })

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch time off requests"
        })
        return
      }

      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching time off requests:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching requests"
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateRequestStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('time_off_requests')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Request ${status} successfully`
      })

      // Refresh the list
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update request status"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Time Off Requests</h2>
        <Button onClick={fetchRequests}>Refresh</Button>
      </div>

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
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
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