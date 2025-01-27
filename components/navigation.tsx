'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/lib/hooks/use-error-handler'
import { AuthError, DatabaseError } from '@/lib/errors'
import { useSupabase } from '@/lib/supabase/client'

interface NavigationProps {
  className?: string
}

interface AuthSubscription {
  unsubscribe: () => void
}

type Role = 'manager' | 'supervisor' | 'employee'

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { supabase, user } = useSupabase()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { handleError } = useErrorHandler()

  const setupAuthListener = useCallback(async (): Promise<AuthSubscription> => {
    try {
      const {
        data: { subscription },
      } = await supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          getUserRole()
          router.refresh()
        }
        if (event === 'SIGNED_OUT') {
          setRole(null)
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

  const getUserRole = useCallback(async () => {
    if (!user) {
      setRole(null)
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setRole(profile?.role as Role)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole(null)
    }
  }, [user, supabase])

  useEffect(() => {
    let subscription: AuthSubscription | null = null

    const setupSubscription = async () => {
      subscription = await setupAuthListener()
      // Get initial role
      await getUserRole()
    }

    setupSubscription()

    return () => {
      subscription?.unsubscribe()
    }
  }, [setupAuthListener, getUserRole])

  const isManager = !isLoading && role && (
    role === 'manager' || 
    role === 'supervisor' || 
    role === 'employee'
  )

  const mainLinks = [
    {
      href: '/schedule',
      label: 'Schedule',
      show: !!role, // Only show if authenticated
    },
    {
      href: '/shifts',
      label: 'Shifts',
      show: !!role,
    },
    {
      href: '/time-off',
      label: 'Time Off',
      show: !!role,
    },
    {
      href: '/staffing',
      label: 'Staffing Requirements',
      show: !!role,
    },
    {
      href: '/dashboard/patterns',
      label: 'Shift Patterns',
      show: isManager,
    },
    {
      href: '/employees',
      label: 'Employees',
      show: isManager,
    },
  ]

  const handleSignOut = useCallback(async () => {
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
  }, [supabase, handleError, isSigningOut])

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
        {role ? (
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
          <Link
            href="/login?mode=signin"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  )
} 