'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function HealthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Health dashboard error:', error)
  }, [error])

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Something went wrong while loading the health dashboard.'}
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button
          onClick={reset}
          variant="outline"
        >
          Try again
        </Button>
      </div>
    </div>
  )
} 