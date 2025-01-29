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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-lg w-full">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <div className="mt-2 text-sm text-gray-600">
            {error.message}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-48">
              {error.stack}
            </div>
          )}
          <div className="mt-6 flex gap-4">
            <Button
              variant="default"
              onClick={() => {
                resetError()
                window.location.reload()
              }}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/'
              }}
            >
              Go to homepage
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
} 