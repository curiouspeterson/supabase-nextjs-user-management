import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { Database } from '@/app/database.types'

export const metadata: Metadata = {
  title: 'Employees | 911 Dispatch Management',
  description: 'Manage dispatch center employees, roles, and certifications',
}

type Employee = Database['public']['Tables']['employees']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default async function EmployeesPage() {
  const supabase = await createClient()

  // Get current user to check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          Please sign in to view employees
        </div>
      </div>
    )
  }

  // Check if user is a manager or admin
  const { data: currentEmployee } = await supabase
    .from('employees')
    .select('user_role')
    .eq('id', user.id)
    .single()

  if (!currentEmployee || !['Manager', 'Admin'].includes(currentEmployee.user_role)) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">
          You do not have permission to view this page
        </div>
      </div>
    )
  }

  // Fetch employees with their profile data
  const { data: employees } = await supabase
    .from('employees')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        updated_at
      )
    `)
    .order('employee_role', { ascending: true })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage dispatch center employees, roles, and certifications
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Import</Button>
          <Button>Add Employee</Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Employee Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">User Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Hours Scheduled</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees?.map((employee) => (
                <tr key={employee.id} className="hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium">{employee.profiles?.full_name || 'Unnamed'}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${employee.employee_role === 'Dispatcher' ? 'bg-blue-100 text-blue-800' : 
                        employee.employee_role === 'Shift Supervisor' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'}`}>
                      {employee.employee_role}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${employee.user_role === 'Employee' ? 'bg-gray-100 text-gray-800' :
                        employee.user_role === 'Manager' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {employee.user_role}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{employee.weekly_hours_scheduled} hrs/week</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 