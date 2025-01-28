'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScheduleErrorFallbackProps {
  error: Error
}

export function ScheduleErrorFallback({ error }: ScheduleErrorFallbackProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Schedule Error</AlertTitle>
      <AlertDescription>
        <p className="mb-4">
          {error?.message || 'An error occurred while loading your schedule'}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
} 