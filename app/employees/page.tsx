import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EmployeeList } from './components/EmployeeList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense } from 'react'
import { EmployeeSkeleton } from '@/components/skeletons/EmployeeSkeleton'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Employee Management | Schedule Master',
  description: 'Manage employees, roles, and team assignments',
}

// Define employee data type
export interface Employee {
  user_id: string
  email: string
  full_name: string
  role: EmployeeRole
  team_id: string | null
  team_name: string | null
  created_at: string
  updated_at: string
}

// Define employee role enum
export enum EmployeeRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE',
  CONTRACTOR = 'CONTRACTOR'
}

async function getEmployeeData() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) return redirect('/login')

    // Get employees with proper access control
    const { data: employees, error: employeeError } = await supabase
      .rpc('get_employees')
      .returns<Employee[]>()

    if (employeeError) {
      console.error('Error fetching employees:', employeeError)
      throw new Error('Failed to fetch employees')
    }

    return {
      employees: employees || [],
      user
    }
  } catch (error) {
    console.error('Error in getEmployeeData:', error)
    throw error
  }
}

export default async function EmployeesPage() {
  return (
    <ErrorBoundary fallback={<div>Error loading employees</div>}>
      <Suspense fallback={<EmployeeSkeleton />}>
        <EmployeeContent />
      </Suspense>
    </ErrorBoundary>
  )
}

async function EmployeeContent() {
  const { employees, user } = await getEmployeeData()

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      
      <EmployeeList 
        employees={employees}
        currentUserId={user.id}
      />
    </div>
  )
} 