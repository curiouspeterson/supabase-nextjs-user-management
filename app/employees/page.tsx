'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/app/database.types'
import { EmployeeDialog } from './employee-dialog'
import { DeleteDialog } from './delete-dialog'

type Employee = Database['public']['Tables']['employees']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>()
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee>()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(undefined)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        setError('Please sign in to view employees')
        return
      }

      // Check if user is a manager or admin
      const { data: currentEmployee, error: roleError } = await supabase
        .from('employees')
        .select('user_role')
        .eq('id', user.id)
        .single()

      if (roleError) throw roleError
      if (!currentEmployee || !['Manager', 'Admin'].includes(currentEmployee.user_role)) {
        setError('You do not have permission to view this page')
        return
      }

      // Fetch employees with their profile data
      const { data: employeesData, error: employeesError } = await supabase
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

      if (employeesError) throw employeesError
      setEmployees(employeesData)
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while loading the page')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch current user and employees data
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center">{error}</div>
      </div>
    )
  }

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
          <Button onClick={() => setShowAddDialog(true)}>Add Employee</Button>
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
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee)
                        setShowEditDialog(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEmployeeToDelete(employee)
                        setShowDeleteDialog(true)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          fetchData()
          setShowAddDialog(false)
        }}
      />

      <EmployeeDialog
        employee={selectedEmployee}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          fetchData()
          setShowEditDialog(false)
        }}
      />

      {employeeToDelete && (
        <DeleteDialog
          employee={employeeToDelete}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={() => {
            fetchData()
            setShowDeleteDialog(false)
          }}
        />
      )}
    </div>
  )
} 