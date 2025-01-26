'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
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
          <button
            onClick={() => reset()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try again
          </button>
          <button
            onClick={() => router.replace('/login')}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
} 