'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { useAuth } from '@/lib/auth/hooks'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { AlertCircle, Loader2 } from 'lucide-react'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { user, signOut, loading: authLoading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { handleError } = useErrorHandler()
  
  // Only check role access if user is logged in
  const { 
    hasAccess: isManager, 
    isLoading: roleLoading,
    error: roleError 
  } = useRoleAccess(['Manager', 'Admin'])

  // Handle role access errors
  useEffect(() => {
    if (roleError && user) {
      console.warn('Role access error:', roleError)
      handleError(roleError, 'Navigation.roleAccess')
    }
  }, [roleError, handleError, user])

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return
    
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      handleError(error as Error, 'Navigation.signOut')
    } finally {
      setIsSigningOut(false)
    }
  }, [signOut, isSigningOut, handleError])

  // Show loading state during initial load or role check
  if (authLoading || (user && roleLoading)) {
    return (
      <div className="flex items-center justify-center w-full py-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // Basic links that don't require role check
  const basicLinks = [
    {
      href: '/schedule',
      label: 'Schedule',
      show: !!user,
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
  ]

  // Manager-only links
  const managerLinks = [
    {
      href: '/dashboard/patterns',
      label: 'Shift Patterns',
      show: isManager && !roleLoading,
    },
    {
      href: '/employees',
      label: 'Employees',
      show: isManager && !roleLoading,
    },
  ]

  // Development-only links
  const devLinks = process.env.NODE_ENV === 'development' ? [
    {
      href: '/test-errors',
      label: 'Test Errors',
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      href: '/error-analytics',
      label: 'Error Analytics',
    },
  ] : []

  // Combine all visible links
  const visibleLinks = [
    ...basicLinks.filter(link => link.show),
    ...managerLinks.filter(link => link.show),
    ...devLinks,
  ]

  return (
    <div className={cn('flex items-center justify-between w-full bg-gray-800 text-white px-4 py-2', className)}>
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
        {visibleLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1',
              pathname === link.href
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.icon && <span>{link.icon}</span>}
            <span>{link.label}</span>
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
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  <span>Signing Out...</span>
                </>
              ) : (
                'Sign Out'
              )}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === '/auth/login'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-green-700',
                pathname === '/auth/signup'
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