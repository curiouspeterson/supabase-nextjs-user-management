import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shift Templates | 911 Dispatch Management',
  description: 'Manage shift templates and schedules for dispatch staff',
}

export default function ShiftsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 