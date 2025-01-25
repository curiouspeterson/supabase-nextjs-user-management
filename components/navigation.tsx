'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const setupAuthListener = useCallback(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })

    return subscription
  }, [supabase, router])

  useEffect(() => {
    const subscription = setupAuthListener()
    return () => {
      subscription.unsubscribe()
    }
  }, [setupAuthListener])

  const getUserRole = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check both user metadata and employees table for role
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('user_role')
          .eq('id', user.id)
          .single()
        
        // Use employee table role if available, fallback to metadata
        const role = employee?.user_role || user.user_metadata?.role
        setUserRole(role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

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

  async function handleSignOut() {
    if (isSigningOut) return
    try {
      setIsSigningOut(true)
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
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
          disabled={isSigningOut}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isSigningOut 
              ? "opacity-50 cursor-not-allowed"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          )}
        >
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
} 