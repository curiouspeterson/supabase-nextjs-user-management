'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div role="alert" className="p-4 bg-white rounded-lg shadow-lg max-w-lg mx-auto mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <pre className="text-sm bg-gray-50 p-3 rounded mb-4 overflow-auto max-h-40 text-gray-700">
        {error.message}
      </pre>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  )
} 