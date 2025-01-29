'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { useSupabase } from '@/lib/supabase/client'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { AlertCircle, Loader2 } from 'lucide-react'

interface NavigationProps {
  className?: string
}

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
      
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      // Redirect to login page
      router.push('/login')
    } catch (error) {
      handleError(error, 'Navigation.handleSignOut')
    } finally {
      setIsSigningOut(false)
    }
  }, [handleError, isSigningOut, router, supabase])

  const mainLinks = [
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
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
        <Link
          href="/test-errors"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1',
            pathname === '/test-errors' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Test Errors</span>
        </Link>
        <Link
          href="/error-analytics"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === '/error-analytics' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Error Analytics
        </Link>
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
                  Signing Out...
                </>
              ) : (
                'Sign Out'
              )}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
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
              href="/signup"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-green-700',
                pathname === '/signup'
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