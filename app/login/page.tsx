'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LoginForm from './login-form'
import { SignUpForm } from './signup-form'

export default function Login() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'signin'
  const isSignUp = mode === 'signup'

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex flex-col gap-2 text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp 
            ? 'Enter your details to create your account'
            : 'Enter your credentials to access your account'
          }
        </p>
      </div>

      {isSignUp ? <SignUpForm /> : <LoginForm />}

      <p className="text-sm text-center text-gray-600 mt-4">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <Link 
              href="/login?mode=signin"
              className="text-green-700 hover:text-green-800 font-medium"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <Link 
              href="/login?mode=signup"
              className="text-green-700 hover:text-green-800 font-medium"
            >
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  )
}