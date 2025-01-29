'use client'

import { ExampleErrorComponent } from '@/components/example-error-component'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestErrorsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Error Testing Page</h1>
        <Button asChild>
          <Link href="/error-analytics">
            View Analytics
          </Link>
        </Button>
      </div>

      <div className="prose max-w-none">
        <p>
          This page contains examples of different types of errors and how they are handled
          by our error analytics system. Use the buttons below to trigger various error
          scenarios and then check the analytics dashboard to see how they are tracked.
        </p>
      </div>

      <div className="border rounded-lg bg-white">
        <ExampleErrorComponent />
      </div>

      <div className="text-sm text-gray-500">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Handled errors are caught and logged directly to our analytics system
          </li>
          <li>
            Unhandled errors trigger the ErrorBoundary component and are logged automatically
          </li>
          <li>
            All errors include additional context like the component name and current state
          </li>
          <li>
            The analytics dashboard shows real-time error statistics and trends
          </li>
        </ul>
      </div>
    </div>
  )
} 