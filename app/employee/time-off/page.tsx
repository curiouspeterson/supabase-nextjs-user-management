import { createClient } from '@/utils/supabase/server'
import TimeOffRequestForm from '@/components/time-off/TimeOffRequestForm'
import { Database } from '@/app/database.types'

type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']

export default async function TimeOffRequestPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          Please sign in to request time off
        </div>
      </div>
    )
  }

  const { data: requests } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('start_date', { ascending: false })

  return (
    <div className="flex-1 flex flex-col gap-8 px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Off Requests</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Submit New Request</h2>
          <TimeOffRequestForm employeeId={user.id} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">My Requests</h2>
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
      </div>
    </div>
  )
} 