import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employee Management | Schedule Master',
  description: 'Manage employees, roles, and team assignments'
}

export default function EmployeesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
} 