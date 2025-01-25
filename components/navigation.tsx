'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { AuthError, DatabaseError } from '@/lib/errors'

interface NavigationProps {
  className?: string
}

interface AuthSubscription {
  unsubscribe: () => void
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { handleError } = useErrorHandler()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const setupAuthListener = useCallback(async (): Promise<AuthSubscription> => {
    try {
      const {
        data: { subscription },
      } = await supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          router.refresh()
        }
        if (event === 'SIGNED_OUT') {
          router.refresh()
        }
      })

      return {
        unsubscribe: () => {
          subscription.unsubscribe()
        }
      }
    } catch (error) {
      handleError(new AuthError('Failed to setup auth listener'), 'Navigation.setupAuthListener')
      return { unsubscribe: () => {} }
    }
  }, [supabase, router, handleError])

  useEffect(() => {
    let subscription: AuthSubscription | null = null

    const setupSubscription = async () => {
      subscription = await setupAuthListener()
    }

    setupSubscription()

    return () => {
      subscription?.unsubscribe()
    }
  }, [setupAuthListener])

  const getUserRole = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new AuthError('Failed to get user data')
      }
      
      // Check both user metadata and employees table for role
      if (user) {
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('user_role')
          .eq('id', user.id)
          .single()
        
        if (employeeError) {
          throw new DatabaseError('Failed to fetch employee role')
        }
        
        // Use employee table role if available, fallback to metadata
        const role = employee?.user_role || user.user_metadata?.role
        setUserRole(role)
      }
    } catch (error) {
      handleError(error, 'Navigation.getUserRole')
      // Set a default role to prevent blocking the UI
      setUserRole('Employee')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, handleError])

  useEffect(() => {
    getUserRole()
  }, [getUserRole])

  const isManager = !isLoading && (
    userRole === 'Manager' || 
    userRole === 'Admin' || 
    userRole === 'Supervisor'
  )

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

  const handleSignOut = async () => {
    if (isSigningOut) return
    
    try {
      setIsSigningOut(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new AuthError('Failed to sign out')
      }
      
      window.location.href = '/'
    } catch (error) {
      handleError(error, 'Navigation.handleSignOut')
      setIsSigningOut(false)
    }
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
              aria-current={pathname === link.href ? 'page' : undefined}
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
      </div>
    </div>
  )
} 