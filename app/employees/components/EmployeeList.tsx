'use client'

import { useOptimistic, useTransition } from 'react'
import { updateEmployeeStatus, type Employee } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
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

interface EmployeeListProps {
  initialEmployees: Employee[]
}

export default function EmployeeList({ initialEmployees }: EmployeeListProps) {
  const [employees, setEmployees] = useOptimistic(initialEmployees)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleStatusUpdate = (id: string, status: 'active' | 'inactive') => {
    // Optimistic update
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id ? { ...emp, status } : emp
      )
    )

    startTransition(async () => {
      try {
        await updateEmployeeStatus(id, status)
        toast({
          title: "Success",
          description: `Employee status updated to ${status}`
        })
      } catch (error) {
        // Revert optimistic update on error
        setEmployees(initialEmployees)
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update employee status"
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{format(new Date(employee.start_date), 'PP')}</TableCell>
                <TableCell>
                  <Badge
                    variant={employee.status === 'active' ? 'success' : 'secondary'}
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate(
                      employee.id,
                      employee.status === 'active' ? 'inactive' : 'active'
                    )}
                  >
                    {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 