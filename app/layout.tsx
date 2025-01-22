import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { headers } from 'next/headers'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: '911 Dispatch',
  description: 'A comprehensive scheduling solution for 911 dispatch centers',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if the current path is a login/auth page
  const headersList = headers()
  const pathname = headersList.get('next-url') || ''
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth')

  return (
    <html lang="en" className={`${GeistSans.className} dark antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <div className="relative flex min-h-screen flex-col">
          {/* Header - Only show if not on auth pages */}
          {!isAuthPage && (
            <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="flex flex-1 items-center justify-between">
                  <nav className="flex items-center space-x-6">
                    <Link href="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                      911 Dispatch
                    </Link>
                    <Link href="/schedule" className="nav-link">
                      Schedule
                    </Link>
                    <Link href="/employees" className="nav-link">
                      Employees
                    </Link>
                    <Link href="/shifts" className="nav-link">
                      Shift Templates
                    </Link>
                    <Link href="/time-off" className="nav-link">
                      Time Off
                    </Link>
                  </nav>
                  
                  {user ? (
                    <nav className="flex items-center gap-4">
                      <Link href="/account" className="nav-link">
                        Account
                      </Link>
                      <Link href="/auth/signout" className="nav-link">
                        Sign Out
                      </Link>
                    </nav>
                  ) : (
                    <nav className="flex items-center gap-4">
                      <Link href="/login" className="nav-link">
                        Sign In
                      </Link>
                    </nav>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
