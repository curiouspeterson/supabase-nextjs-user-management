'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/lib/auth/actions'
import { AppError } from '@/lib/types/error'
import FullPageLoader from '@/components/FullPageLoader'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect_to')
  const urlError = searchParams.get('error')
  const [state, formAction] = useFormState(login, null)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('LoginForm - Mounted')
    console.log('LoginForm - Redirect:', redirectTo)
    
    if (urlError) {
      console.error('LoginForm - URL Error:', urlError)
    }
    if (state?.error) {
      console.error('LoginForm - Form Error:', state.error)
    }
    
    return () => {
      console.log('LoginForm - Unmounted')
    }
  }, [urlError, state?.error, redirectTo])

  // Show loading state during SSR
  if (!isClient) {
    return <FullPageLoader />
  }

  // Format error message
  const errorMessage = (() => {
    if (state?.error instanceof AppError) {
      return state.error.message
    }
    if (urlError === 'auth_error') {
      return 'Authentication failed. Please try again.'
    }
    if (urlError) {
      return 'An error occurred. Please try again.'
    }
    return null
  })()

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="redirect_to" value={redirectTo || '/dashboard'} />
      
      <div className="-space-y-px rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Password"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700" role="alert">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
 