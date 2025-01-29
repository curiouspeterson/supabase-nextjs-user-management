import './globals.css'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '@/components/error-fallback'
import { ErrorAnalyticsProvider } from '@/contexts/error-analytics-context'
import { Suspense } from 'react'
import { ErrorBoundaryProvider } from '@/src/providers'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'User Management',
  description: 'The fastest way to manage your users',
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="bg-background text-foreground">
        <ErrorBoundaryProvider>
          <ErrorAnalyticsProvider>
            <main className="min-h-screen flex flex-col">
              <header className="bg-gray-800 text-white">
                <div className="container mx-auto px-4 py-4">
                  <Navigation />
                </div>
              </header>
              <div className="flex-1">
                <Suspense fallback={<LoadingSkeleton />}>
                  {children}
                </Suspense>
              </div>
            </main>
            <Toaster />
          </ErrorAnalyticsProvider>
        </ErrorBoundaryProvider>
      </body>
    </html>
  )
}
