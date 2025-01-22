import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employees | 911 Dispatch Management',
  description: 'Manage dispatch center employees, roles, and certifications',
}

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 