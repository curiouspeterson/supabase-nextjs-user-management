'use client'

import { Suspense, useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AppErrorBoundary } from '@/src/providers/error-boundary'
import FullPageLoader from '@/components/FullPageLoader'
import { Navigation } from '@/components/navigation'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading state during hydration
  if (!isClient) {
    return <FullPageLoader />
  }

  return (
    <AppErrorBoundary>
      <header className="sticky top-0 z-50">
        <Suspense fallback={<FullPageLoader />}>
          <Navigation />
        </Suspense>
      </header>
      <Suspense fallback={<FullPageLoader />}>
        {children}
      </Suspense>
      <Toaster />
    </AppErrorBoundary>
  )
} 