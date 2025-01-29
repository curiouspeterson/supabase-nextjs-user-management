import { Suspense } from 'react'
import { EmployeeList } from './components/EmployeeList'
import { EmployeeForm } from './components/employee-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Employee Management | Schedule Master',
  description: 'Manage employees, roles, and team assignments',
}

export default function EmployeesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">
          Manage employees, roles, and team assignments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ErrorBoundary>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Employee List</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <EmployeeList />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Add Employee</h2>
            <EmployeeForm />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
} 