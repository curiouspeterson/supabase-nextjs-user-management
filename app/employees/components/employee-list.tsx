'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { getEmployees } from '@/services/employees'
import { useSupabase } from '@/lib/supabase/client'
import type { Employee } from '@/types/employee'

export function EmployeeList() {
  const { user, isLoading: isAuthLoading, isInitialized } = useSupabase()

  const {
    data: employees = [],
    isLoading: isEmployeesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['employees', user?.id],
    queryFn: async () => {
      try {
        // If not authenticated, return empty array
        if (!user) return []
        
        const data = await getEmployees()
        if (!Array.isArray(data)) {
          console.error('Invalid employees data:', data)
          return []
        }
        return data
      } catch (err) {
        console.error('Error fetching employees:', err)
        throw err
      }
    },
    enabled: isInitialized && user !== null,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message === 'Not authenticated') {
        return false
      }
      return failureCount < 3
    }
  })

  // Handle initial loading state (auth not initialized)
  if (!isInitialized) {
    return <LoadingSpinner />
  }

  // Handle authentication loading state
  if (isAuthLoading) {
    return <LoadingSpinner />
  }

  // Handle not authenticated state
  if (user === null) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Please sign in to view employees</p>
      </Card>
    )
  }

  // Handle query loading state
  if (isEmployeesLoading) {
    return <LoadingSpinner />
  }

  // Handle error state
  if (isError && error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">Error loading employees: {error.message}</p>
      </Card>
    )
  }

  // Handle empty state
  if (!Array.isArray(employees) || employees.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No employees found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  )
}

function EmployeeCard({ employee }: { employee: Employee }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Employee {employee.id}</h3>
          <p className="text-sm text-muted-foreground">
            {employee.employee_role}
          </p>
        </div>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Role</p>
          <p className="capitalize">{employee.employee_role.toLowerCase()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">User Role</p>
          <p className="capitalize">{employee.user_role.toLowerCase()}</p>
        </div>
      </div>
    </Card>
  )
} 