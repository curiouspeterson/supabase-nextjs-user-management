import { Suspense } from 'react'
import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { ScheduleSkeleton } from '@/components/skeletons'
import { ScheduleErrorFallback } from './components/ScheduleErrorFallback'
import { ScheduleLoading } from './components/ScheduleLoading'
import { EmployeeScheduleContent } from './components/EmployeeScheduleContent'

export const metadata: Metadata = {
  title: 'My Schedule | Schedule Master',
  description: 'View and manage your work schedule',
}

export default function EmployeeSchedulePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Schedule</h1>
      </div>

      <ErrorBoundary fallback={<ScheduleErrorFallback error={new Error('Failed to load schedule')} />}>
        <Suspense fallback={<ScheduleLoading />}>
          <EmployeeScheduleContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 