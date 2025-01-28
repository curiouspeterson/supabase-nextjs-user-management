'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import type { Employee } from '@/types/employee'
import { EmployeeRole } from '@/types/employee'

interface EmployeeListProps {
  employees: Employee[]
  currentUserId: string
}

export function EmployeeList({ employees, currentUserId }: EmployeeListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleRoleUpdate = async (employeeId: string, newRole: EmployeeRole, reason: string = '') => {
    try {
      setLoading(prev => ({ ...prev, [employeeId]: true }))

      const { data: success, error } = await supabase
        .rpc('update_employee_role', {
          p_employee_id: employeeId,
          p_new_role: newRole,
          p_reason: reason,
          p_client_info: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })

      if (error) throw error
      if (!success) {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to update this role',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Role Updated',
        description: `Employee role has been updated to ${newRole}`,
      })

      router.refresh()
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update employee role',
        variant: 'destructive',
      })
    } finally {
      setLoading(prev => ({ ...prev, [employeeId]: false }))
    }
  }

  const getRoleBadgeColor = (role: EmployeeRole) => {
    switch (role) {
      case EmployeeRole.ADMIN:
        return 'bg-red-500'
      case EmployeeRole.MANAGER:
        return 'bg-blue-500'
      case EmployeeRole.SUPERVISOR:
        return 'bg-green-500'
      case EmployeeRole.EMPLOYEE:
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <span className="font-medium">{employee.fullName}</span>
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(employee.role)}>
                  {employee.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {employee.id !== currentUserId && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleUpdate(employee.id, EmployeeRole.MANAGER)}
                        disabled={loading[employee.id]}
                      >
                        {loading[employee.id] ? (
                          <Skeleton className="h-4 w-4" />
                        ) : (
                          'Promote'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleUpdate(employee.id, EmployeeRole.EMPLOYEE)}
                        disabled={loading[employee.id]}
                      >
                        {loading[employee.id] ? (
                          <Skeleton className="h-4 w-4" />
                        ) : (
                          'Demote'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No employees found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 