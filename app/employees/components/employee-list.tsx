import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useErrorBoundary } from 'react-error-boundary'
import { getEmployees } from '@/services/employees'
import type { Employee } from '@/services/employees/types'

export function EmployeeList() {
  const { showBoundary } = useErrorBoundary()
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  React.useEffect(() => {
    if (error) {
      showBoundary(error)
    }
  }, [error, showBoundary])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!employees?.length) {
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
          <h3 className="font-medium">{employee.fullName}</h3>
          <p className="text-sm text-muted-foreground">
            {employee.email}
          </p>
        </div>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Role</p>
          <p className="capitalize">{employee.role.toLowerCase()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="capitalize">{employee.status.toLowerCase()}</p>
        </div>
      </div>
    </Card>
  )
} 