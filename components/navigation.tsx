'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { AuthError, DatabaseError } from '@/lib/errors'
import { useSupabase } from '@/lib/supabase/client'
import { useRoleAccess } from '@/hooks/useRoleAccess'

interface NavigationProps {
  className?: string
}

interface AuthSubscription {
  unsubscribe: () => void
}

type Role = 'Manager' | 'Admin' | 'Employee'

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { supabase, user } = useSupabase()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { handleError } = useErrorHandler()
  const { hasAccess: isManager, isLoading, error } = useRoleAccess(['Manager', 'Admin'])

  useEffect(() => {
    if (error) {
      handleError(error, 'Navigation.roleAccess')
    }
  }, [error, handleError])

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return
    
    try {
      setIsSigningOut(true)
      
      // Call the sign-out API endpoint
      const response = await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include' // Important for cookie handling
      })

      // Force reload to ensure clean state
      window.location.href = '/login'
      
    } catch (error) {
      handleError(error, 'Navigation.handleSignOut')
      setIsSigningOut(false)
    }
  }, [handleError, isSigningOut])

  const mainLinks = [
    {
      href: '/schedule',
      label: 'Schedule',
      show: !!user, // Only show if authenticated
    },
    {
      href: '/shifts',
      label: 'Shifts',
      show: !!user,
    },
    {
      href: '/time-off',
      label: 'Time Off',
      show: !!user,
    },
    {
      href: '/staffing',
      label: 'Staffing Requirements',
      show: !!user,
    },
    {
      href: '/dashboard/patterns',
      label: 'Shift Patterns',
      show: isManager && !isLoading,
    },
    {
      href: '/employees',
      label: 'Employees',
      show: isManager && !isLoading,
    },
  ]

  const filteredLinks = mainLinks.filter(link => link.show)

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
      <nav className="flex space-x-4" role="navigation" aria-label="Main navigation">
        {filteredLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === link.href
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right - Account & Sign Out */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              href="/account"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === '/account'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
              aria-current={pathname === '/account' ? 'page' : undefined}
            >
              Account
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isSigningOut 
                  ? "opacity-50 cursor-not-allowed"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              aria-busy={isSigningOut}
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login?mode=signin"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === '/login' && !pathname.includes('signup')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=signup"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-green-700',
                pathname === '/login' && pathname.includes('signup')
                  ? 'bg-green-800 text-white'
                  : 'text-white hover:bg-green-800'
              )}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
} 