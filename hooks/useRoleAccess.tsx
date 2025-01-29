'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { createClient } from '@/lib/supabase/client';

export type Role = 'admin' | 'user' | 'manager';

interface UseRoleAccessReturn {
  roles: Role[];
  loading: boolean;
  error: Error | null;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasAllRoles: (roles: Role[]) => boolean;
}

const DEFAULT_ROLE: Role = 'user';

export function useRoleAccess(): UseRoleAccessReturn {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([DEFAULT_ROLE]);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function fetchRoles() {
      if (!user) {
        if (mounted) {
          setRoles([DEFAULT_ROLE]);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .abortSignal(controller.signal);

        if (rolesError) throw rolesError;

        if (mounted) {
          setRoles(data?.map(r => r.role as Role) ?? [DEFAULT_ROLE]);
          setError(null);
        }
      } catch (e) {
        console.error('Failed to fetch roles:', e);
        if (mounted && !controller.signal.aborted) {
          setError(e instanceof Error ? e : new Error('Failed to fetch roles'));
          setRoles([DEFAULT_ROLE]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      fetchRoles();
    }

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [user, authLoading, supabase]);

  const hasRole = (role: Role) => roles.includes(role);
  const hasAnyRole = (requiredRoles: Role[]) => requiredRoles.some(hasRole);
  const hasAllRoles = (requiredRoles: Role[]) => requiredRoles.every(hasRole);

  return {
    roles,
    loading: loading || authLoading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles
  };
}

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { hasAnyRole, loading, error } = useRoleAccess();

  if (loading) {
    return fallback || null;
  }

  if (error || !hasAnyRole(requiredRoles)) {
    return fallback || null;
  }

  return <>{children}</>;
}

export function withRoleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles: Role[],
  FallbackComponent?: React.ComponentType<P>
) {
  return function WithRoleAccessWrapper(props: P) {
    return (
      <RoleGuard
        requiredRoles={requiredRoles}
        fallback={FallbackComponent ? <FallbackComponent {...props} /> : null}
      >
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
}