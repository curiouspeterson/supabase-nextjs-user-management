'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import FullPageLoader from './FullPageLoader'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading state during SSR or initial client load
  if (!isClient || loading) {
    return <FullPageLoader />
  }

  // Redirect to login if no user
  if (!user) {
    router.push('/auth/login')
    return <FullPageLoader />
  }

  // Render children if authenticated
  return <>{children}</>
} 