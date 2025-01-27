'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { EmployeeDialog } from './employee-dialog'
import { DeleteDialog } from './delete-dialog'
import { useRouter } from 'next/navigation'
import type { Employee as EmployeeType } from '@/services/scheduler/types'
import type { Database } from '@/types/supabase'

type DatabaseEmployee = Database['public']['Tables']['employees']['Row'] & {
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
    username: string | null
  }
}

const mapDatabaseEmployee = (employee: DatabaseEmployee): EmployeeType => ({
  id: employee.id,
  user_id: employee.id,
  employee_role: employee.employee_role === 'Dispatcher' ? 'Employee' :
                employee.employee_role === 'Management' ? 'Management' :
                employee.employee_role,
  weekly_hours_scheduled: employee.weekly_hours_scheduled || 40,
  default_shift_type_id: employee.default_shift_type_id,
  created_at: employee.created_at,
  updated_at: employee.updated_at,
  full_name: employee.profiles?.full_name || 'Unknown',
  avatar_url: employee.profiles?.avatar_url || null,
  username: employee.profiles?.username || null,
  user_role: employee.user_role === 'Admin' ? 'Admin' : 'Employee'
})

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | undefined>(undefined)
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeType | undefined>(undefined)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const supabase = createClient()
  const router = useRouter()

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

      // Fetch employees with their profile data and shift type
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          employee_role,
          user_role,
          weekly_hours_scheduled,
          default_shift_type_id,
          allow_overtime,
          max_weekly_hours,
          profiles:profiles!left (
            full_name,
            avatar_url,
            updated_at,
            username
          ),
          shift_types:shift_types!left (
            name,
            description
          )
        `)
        .order('employee_role', { ascending: true })
        .returns<DatabaseEmployee[]>()

      if (employeesError) throw employeesError

      // Get user emails from API
      const userIds = employeesData?.map(employee => employee.id) || []
      const usersResponse = await fetch(`/api/users?ids=${userIds.join(',')}`)
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch user data')
      }
      const usersData = await usersResponse.json()

      // Create a map of user IDs to emails
      const userEmailMap = new Map(usersData.map((user: { id: string, email: string }) => [user.id, user.email]))

      // Add emails to employee data
      const employeesWithEmail = employeesData?.map(employee => ({
        ...employee,
        email: userEmailMap.get(employee.id) || ''
      })) || []

      setEmployees(employeesWithEmail as DatabaseEmployee[])
    } catch (err) {
      setError('An error occurred while loading the page')
      console.error('Error in fetchData:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch current user and employees data
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEmployeeUpdated = () => {
    setShowAddDialog(false)
    setSelectedEmployee(undefined)
    router.refresh()
  }

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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <Button onClick={() => setShowAddDialog(true)}>Add Employee</Button>
      </div>

      <div className="grid gap-4">
        {employees.map(employee => (
          <div
            key={employee.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{employee.profiles?.full_name || 'Unknown'}</h3>
              <p className="text-sm text-gray-500">{employee.employee_role}</p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedEmployee(mapDatabaseEmployee(employee))}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showAddDialog && (
        <EmployeeDialog
          isOpen={true}
          onClose={() => setShowAddDialog(false)}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

      {selectedEmployee && (
        <EmployeeDialog
          isOpen={true}
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(undefined)}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

      {showDeleteDialog && employeeToDelete && (
        <DeleteDialog
          employee={employeeToDelete}
          onClose={() => {
            setEmployeeToDelete(undefined)
            setShowDeleteDialog(false)
          }}
          onSuccess={() => {
            setEmployeeToDelete(undefined)
            setShowDeleteDialog(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
} 