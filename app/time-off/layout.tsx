import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Off Requests | 911 Dispatch Management',
  description: 'Request and manage time off for dispatch staff',
}

export default function TimeOffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 