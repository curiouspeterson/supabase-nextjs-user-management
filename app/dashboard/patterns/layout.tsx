import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shift Patterns | Schedule Master',
  description: 'Create and manage shift patterns for scheduling'
}

export default function PatternsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
} 