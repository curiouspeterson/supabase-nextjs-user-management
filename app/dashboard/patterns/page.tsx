import { Suspense } from 'react'
import { PatternList } from './components/pattern-list'
import { PatternForm } from './components/pattern-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

export default function PatternsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Shift Patterns</h1>
        <p className="text-muted-foreground">
          Create and manage shift patterns for scheduling
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ErrorBoundary>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Available Patterns</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <PatternList />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Create Pattern</h2>
            <PatternForm />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
} 