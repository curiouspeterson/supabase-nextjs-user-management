import { createClient } from '@/utils/supabase/server'
import { Database } from '@/app/database.types'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface TimeOffRequest {
  id: number
  user_id: string
  start_date: string
  end_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export default async function TimeOffManagementPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          Please sign in to manage time off requests
        </div>
      </div>
    )
  }

  // Check if user is a manager
  const { data: employee } = await supabase
    .from('employees')
    .select('user_role')
    .eq('id', user.id)
    .single()

  if (!employee || !['Manager', 'Admin'].includes(employee.user_role)) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          You do not have permission to manage time off requests
        </div>
      </div>
    )
  }

  const { data: requests, error } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching time off requests:', error)
    return <div>Error loading time off requests</div>
  }

  const timeOffRequests = requests as TimeOffRequest[]

  async function updateRequestStatus(formData: FormData) {
    'use server'

    const requestId = formData.get('requestId') as string
    const status = formData.get('status') as 'Approved' | 'Denied'
    const notes = formData.get('notes') as string

    const supabase = await createClient()
    
    await supabase
      .from('time_off_requests')
      .update({
        status,
        manager_notes: notes
      })
      .eq('id', requestId)

    revalidatePath('/dashboard/time-off')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Time Off Requests</h1>
        <Link
          href="/dashboard/time-off/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Request
        </Link>
      </div>

      <div className="space-y-4">
        {timeOffRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-start"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {request.reason}
              </div>
            </div>
            <span
              className="text-sm text-gray-500"
              title={new Date(request.created_at).toLocaleString()}
            >
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </span>
          </div>
        ))}

        {timeOffRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No time off requests found
          </div>
        )}
      </div>
    </div>
  )
} 