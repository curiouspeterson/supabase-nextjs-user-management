import { Inter } from 'next/font/google'
import './globals.css'
import { ErrorAnalyticsProvider } from '@/contexts/error-analytics-context'
import ClientLayout from './client-layout'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" className={inter.className}>
      <body className="bg-background text-foreground">
        <ErrorAnalyticsProvider>
          <main className="min-h-screen flex flex-col">
            <ClientLayout>
              {children}
            </ClientLayout>
          </main>
        </ErrorAnalyticsProvider>
      </body>
    </html>
  )
}
