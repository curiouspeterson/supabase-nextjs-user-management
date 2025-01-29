'use client';

import React, { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/client';

type Role = 'Manager' | 'Admin' | 'Employee';

interface UseRoleAccessReturn {
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useRoleAccess(requiredRoles: Role[]): UseRoleAccessReturn {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { supabase, user } = useSupabase();

  useEffect(() => {
    async function checkAccess() {
      try {
        if (!supabase) {
          setError(new Error('Supabase client not initialized'));
          return;
        }

        if (!user) {
          setHasAccess(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        const userRole = profile?.role as Role;
        setHasAccess(requiredRoles.includes(userRole));
      } catch (err) {
        setError(err as Error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    // Only check access if we have a user
    if (user) {
      checkAccess();
    } else {
      setHasAccess(false);
      setIsLoading(false);
    }
  }, [supabase, user, requiredRoles]);

  return { hasAccess, isLoading, error };
}

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role[];
}

export function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const { hasAccess, isLoading, error } = useRoleAccess(requiredRoles);

  if (isLoading) {
    return null;
  }

  if (error || !hasAccess) {
    return null;
  }

  return children;
}

export function withRoleAccess(WrappedComponent: React.ComponentType, requiredRoles: Role[]) {
  return function WithRoleAccessWrapper(props: any) {
    return (
      <RoleGuard requiredRoles={requiredRoles}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
} 