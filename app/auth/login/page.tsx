import { Suspense } from 'react'
import LoginForm from './login-form'
import FullPageLoader from '@/components/FullPageLoader'

export const metadata = {
  title: 'Login',
  description: 'Login to your account',
}

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <Suspense fallback={<FullPageLoader />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
} 