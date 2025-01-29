'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface Employee {
  id: string
  email: string
  full_name: string
  role: string
  status: string
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name')

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch employees"
        })
        return
      }

      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching employees"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Employees</h2>
        <Button onClick={fetchEmployees}>Refresh</Button>
      </div>
      
      <div className="grid gap-4">
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No employees found
          </p>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{employee.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{employee.role}</span>
                  <p className="text-xs text-muted-foreground">
                    Status: {employee.status}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 