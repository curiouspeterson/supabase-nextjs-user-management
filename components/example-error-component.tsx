'use client'

import { useState } from 'react'
import { useLogError } from '@/contexts/error-analytics-context'
import { Button } from '@/components/ui/button'

export function ExampleErrorComponent() {
  const [count, setCount] = useState(0)
  const logError = useLogError()

  const handleSafeError = async () => {
    try {
      // Simulate an API call that fails
      throw new Error('API request failed')
    } catch (err) {
      await logError(err as Error, {
        severity: 'low',
        component: 'ExampleErrorComponent',
        metadata: {
          count,
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  const handleUnsafeError = () => {
    // This will trigger the ErrorBoundary
    throw new Error('Uncaught error example')
  }

  const handleAsyncError = async () => {
    // This simulates an async operation that fails
    await new Promise((resolve) => setTimeout(resolve, 1000))
    throw new Error('Async operation failed')
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Error Examples</h2>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Counter: {count}
        </p>
        <Button
          variant="outline"
          onClick={() => setCount(c => c + 1)}
        >
          Increment Counter
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Click the buttons below to trigger different types of errors:
        </p>
        
        <div className="space-x-4">
          <Button
            variant="default"
            onClick={handleSafeError}
          >
            Trigger Handled Error
          </Button>

          <Button
            variant="destructive"
            onClick={handleUnsafeError}
          >
            Trigger Unhandled Error
          </Button>

          <Button
            variant="destructive"
            onClick={handleAsyncError}
          >
            Trigger Async Error
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>The "Handled Error" will be caught and logged to analytics.</p>
        <p>The "Unhandled Error" will trigger the ErrorBoundary.</p>
        <p>The "Async Error" will trigger the ErrorBoundary and be logged.</p>
      </div>
    </div>
  )
} 