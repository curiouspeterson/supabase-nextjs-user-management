import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Health | Dashboard',
  description: 'Monitor system health and performance metrics in real-time',
  openGraph: {
    title: 'System Health Dashboard',
    description: 'Monitor system health and performance metrics in real-time',
    type: 'website',
  },
}

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system health and performance metrics in real-time
        </p>
      </div>
      {children}
    </div>
  )
} 