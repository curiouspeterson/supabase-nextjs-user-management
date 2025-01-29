'use client'

import { ErrorAnalyticsProvider } from '@/contexts/error-analytics-context'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        // Only log client-side errors
        if (typeof window !== 'undefined') {
          console.error('Caught in boundary:', error)
        }
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorAnalyticsProvider>
          {children}
        </ErrorAnalyticsProvider>
      </Suspense>
    </ErrorBoundary>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div role="alert" className="p-4">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <pre className="text-sm bg-gray-100 p-2 rounded mb-4">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
