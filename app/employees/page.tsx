import { Suspense } from 'react'
import { getEmployees } from '@/app/actions/employees'
import EmployeeList from './components/EmployeeList'
import ErrorBoundary from '@/components/error-boundary'
import { Loader2 } from 'lucide-react'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Employee Management',
  description: 'Manage employee information and status',
}

export default async function EmployeesPage() {
  const initialEmployees = await getEmployees()
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <EmployeeList initialEmployees={initialEmployees} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 