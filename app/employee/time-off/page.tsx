import { createClient } from '@/utils/supabase/server'
import TimeOffRequestForm from '@/components/time-off/TimeOffRequestForm'
import { Database } from '@/app/database.types'

type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']
type Employee = Database['public']['Tables']['employees']['Row']

interface TimeOffRequestWithEmployee extends TimeOffRequest {
  employee: Pick<Employee, 'id' | 'user_role'>
}

export default async function TimeOffPage() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw new Error('Authentication error')
    }

    if (!user) {
      return (
        <div className="text-center p-4">
          <p>Please sign in to view this page</p>
        </div>
      )
    }

    // First check if employee record exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new Error('Failed to fetch employee record')
    }

    if (!employee) {
      return (
        <div className="text-center p-4">
          <p>Employee record not found. Please contact your administrator.</p>
        </div>
      )
    }

    // Fetch time off requests with proper error handling
    const { data: requests, error: requestsError } = await supabase
      .from('time_off_requests')
      .select(`
        *,
        employee:employees!time_off_requests_employee_id_fkey (
          id,
          user_role
        )
      `)
      .eq('employee_id', user.id)
      .order('submitted_at', { ascending: false })
      .returns<TimeOffRequestWithEmployee[]>()

    if (requestsError) {
      throw new Error('Failed to fetch time off requests')
    }

    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Time Off Requests</h1>
        <TimeOffRequestForm />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">My Requests</h2>
            <div className="space-y-4">
              {requests && requests.length > 0 ? (
                requests.map((request) => (
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
                          Type: {request.type}
                        </div>
                        {request.notes && (
                          <div className="text-sm text-gray-600 mt-1">
                            Notes: {request.notes}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          request.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'Declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    {request.reviewed_by && request.reviewed_at && (
                      <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                        <div>Reviewed on: {new Date(request.reviewed_at).toLocaleDateString()}</div>
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
  } catch (error) {
    console.error('Error in TimeOffPage:', error)
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Time Off Requests</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p className="font-bold">Error</p>
          <p>Failed to load time off requests. Please try again later.</p>
        </div>
      </div>
    )
  }
} 