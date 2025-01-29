'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ValidationError {
  field: string
  message: string
}

interface AuthError extends Error {
  code?: string
  status?: number
  digest?: string
  details?: ValidationError[]
}

const getErrorMessage = (error: AuthError) => {
  // If we have validation errors, display them
  if (error.details?.length) {
    return error.details.map(err => err.message).join(', ')
  }

  // Otherwise check the error code
  switch (error.code) {
    case 'InvalidCredentialsError':
      return 'Invalid email or password'
    case 'UserNotFoundError':
      return 'No account found with this email'
    case 'TooManyRequestsError':
      return 'Too many login attempts. Please try again later'
    case 'ValidationError':
      return 'Please check your input and try again'
    default:
      return error.message || 'An error occurred during authentication'
  }
}

export default function LoginError({
  error,
  reset,
}: {
  error: AuthError
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Login error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      digest: error.digest,
      details: error.details,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-6" role="alert">
            {getErrorMessage(error)}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
          <button
            onClick={() => {
              reset()
              router.refresh()
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
} 