'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { resetShiftsError } from './actions'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error
    console.error('Shifts page error:', error)

    // If the error is related to authentication, redirect to login
    if (error.message.includes('auth') || error.message.toLowerCase().includes('unauthorized')) {
      router.replace('/login')
    }
  }, [error, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="mt-2 text-sm text-gray-500">
          {error.message}
        </p>
        <div className="mt-4 space-x-4">
          <Button
            onClick={() => resetShiftsError()}
            variant="default"
          >
            Try again
          </Button>
          <Button
            onClick={() => router.replace('/login')}
            variant="secondary"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  )
} 