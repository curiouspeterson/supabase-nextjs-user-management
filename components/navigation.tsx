'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('user_role')
          .eq('id', user.id)
          .single()
        setUserRole(employee?.user_role || null)
      }
    }
    getUserRole()
  }, [])

  const isManager = userRole === 'Manager' || userRole === 'Admin'

  const mainLinks = [
    {
      href: '/schedule',
      label: 'Schedule',
      show: true,
    },
    {
      href: '/shifts',
      label: 'Shifts',
      show: true,
    },
    {
      href: '/time-off',
      label: 'Time Off',
      show: true,
    },
    {
      href: '/staffing',
      label: 'Staffing Requirements',
      show: true,
    },
    {
      href: '/employees',
      label: 'Employees',
      show: isManager,
    },
  ]

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {/* Left - Site Title */}
      <div className="flex-shrink-0">
        <Link
          href="/"
          className="text-white font-bold text-xl hover:text-gray-200 transition-colors"
        >
          911 Dispatch
        </Link>
      </div>

      {/* Center - Main Navigation */}
      <nav className="flex space-x-4">
        {mainLinks
          .filter(link => link.show)
          .map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
      </nav>

      {/* Right - Account & Sign Out */}
      <div className="flex items-center space-x-4">
        <Link
          href="/account"
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === '/account'
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          )}
        >
          Account
        </Link>
        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
} 