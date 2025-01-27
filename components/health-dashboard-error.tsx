'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { resetHealthDashboard } from '@/app/dashboard/health/actions'

export function HealthDashboardError({ error }: { error: Error }) {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Health Dashboard</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error.message}</p>
            <Button onClick={() => resetHealthDashboard()} variant="secondary">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 