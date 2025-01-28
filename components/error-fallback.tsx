'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-lg w-full">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <p className="mb-4 text-sm">{error.message}</p>
          <Button
            variant="outline"
            onClick={() => {
              resetErrorBoundary()
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
} 