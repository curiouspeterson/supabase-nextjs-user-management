import './globals.css'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'User Management',
  description: 'The fastest way to manage your users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="bg-background text-foreground">
        <ErrorBoundary>
          <main className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white">
              <div className="container mx-auto px-4 py-4">
                <Navigation />
              </div>
            </header>
            <div className="flex-1">
              {children}
            </div>
          </main>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
