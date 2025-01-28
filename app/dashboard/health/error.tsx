'use client'

import { Error } from '@/components/ui/error'
import { resetHealthDashboard } from './actions'

export default function HealthDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Error
      title="Health Dashboard Error"
      message={error.message || 'Failed to load health dashboard'}
      retry={() => {
        resetHealthDashboard()
        reset()
      }}
    />
  )
} 