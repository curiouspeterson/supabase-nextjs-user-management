'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { resetScheduleError } from '@/app/employee/schedule/actions'

export function ScheduleError({ error }: { error: Error }) {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Schedule</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error.message}</p>
            <Button onClick={() => resetScheduleError()} variant="secondary">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 