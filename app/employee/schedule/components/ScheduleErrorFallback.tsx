'use client'

import { Error } from '@/components/ui/error'
import { resetScheduleError } from '../actions'

export default function ScheduleErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Error
      title="Schedule Error"
      message={error.message || 'Failed to load schedule'}
      retry={() => {
        resetScheduleError()
        reset()
      }}
    />
  )
} 