import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Role = 'admin' | 'manager' | 'employee'

interface RoleAccess {
  role: Role | null
  isAdmin: boolean
  isManager: boolean
  isEmployee: boolean
  canGenerateSchedule: boolean
  canViewStats: boolean
  canCreateSchedule: boolean
  canEditSchedule: boolean
  canDeleteSchedule: boolean
  isLoading: boolean
}

export function useRoleAccess(): RoleAccess {
  const supabase = createClientComponentClient()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          setRole(profile?.role as Role || null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        setRole(profile?.role as Role || null)
      } else if (event === 'SIGNED_OUT') {
        setRole(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    role,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isEmployee: role === 'employee',
    canGenerateSchedule: role === 'admin' || role === 'manager',
    canViewStats: role === 'admin' || role === 'manager',
    canCreateSchedule: role === 'admin' || role === 'manager',
    canEditSchedule: role === 'admin' || role === 'manager',
    canDeleteSchedule: role === 'admin' || role === 'manager',
    isLoading
  }
}

// Higher-order component for role-based access control
export function withRoleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: Role[]
): React.FC<P> {
  return function WithRoleAccessWrapper(props: P) {
    const { role, isLoading } = useRoleAccess()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!role || !allowedRoles.includes(role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

// Role-based UI component
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null
}: {
  children: React.ReactNode
  allowedRoles: Role[]
  fallback?: React.ReactNode
}) {
  const { role, isLoading } = useRoleAccess()

  if (isLoading) {
    return null
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback
  }

  return <>{children}</>
} 