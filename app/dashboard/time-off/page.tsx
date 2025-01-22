import { createClient } from '@/utils/supabase/server'
import { Database } from '@/app/database.types'
import { revalidatePath } from 'next/cache'

type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row'] & {
  employees: Database['public']['Tables']['profiles']['Row']
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

  const { data: requests } = await supabase
    .from('time_off_requests')
    .select('*, employees:profiles!inner(*)')
    .order('start_date', { ascending: false })

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
    <div className="flex-1 flex flex-col gap-8 px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Off Request Management</h1>
      </div>

      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map((request: TimeOffRequest) => (
            <div
              key={request.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {request.employees?.full_name || 'Unknown Employee'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(request.start_date).toLocaleDateString()} -{' '}
                    {new Date(request.end_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {request.reason}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    request.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'Denied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {request.status}
                </span>
              </div>

              {request.status === 'Pending' && (
                <form
                  action={updateRequestStatus}
                  className="mt-4 border-t pt-4 space-y-4"
                >
                  <input type="hidden" name="requestId" value={request.id} />
                  
                  <div>
                    <label
                      htmlFor={`notes-${request.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Notes
                    </label>
                    <textarea
                      id={`notes-${request.id}`}
                      name="notes"
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      name="status"
                      value="Approved"
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="Denied"
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Deny
                    </button>
                  </div>
                </form>
              )}

              {request.manager_notes && (
                <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                  <span className="font-medium">Manager Notes:</span>{' '}
                  {request.manager_notes}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">
            No time off requests found
          </div>
        )}
      </div>
    </div>
  )
} 