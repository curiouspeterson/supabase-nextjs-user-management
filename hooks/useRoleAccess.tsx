'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSupabase } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';

type Role = 'Manager' | 'Admin' | 'Employee';

interface UseRoleAccessReturn {
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const LOADING_TIMEOUT = 5000;

export function useRoleAccess(requiredRole: Role): UseRoleAccessReturn {
  const { supabase, user } = useSupabase();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const checkAccess = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      setHasAccess(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const userRole = data?.role as Role;
      const roleHierarchy: Record<Role, number> = {
        'Admin': 3,
        'Manager': 2,
        'Employee': 1
      };

      setHasAccess(roleHierarchy[userRole] >= roleHierarchy[requiredRole]);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check role access'));
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkAccess();
        }, RETRY_DELAY * Math.pow(2, retryCount));
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, requiredRole, retryCount]);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    checkAccess();
  }, [checkAccess]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const init = async () => {
      setIsLoading(true);
      timeoutId = setTimeout(() => {
        if (isLoading) {
          setError(new Error('Role check timed out'));
          setIsLoading(false);
        }
      }, LOADING_TIMEOUT);

      await checkAccess();
    };

    init();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkAccess]);

  return { hasAccess, isLoading, error, retry };
}

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { hasAccess, isLoading, error } = useRoleAccess(requiredRoles[0]);

  if (isLoading) {
    return fallback || null;
  }

  if (error || !hasAccess) {
    return fallback || null;
  }

  return children;
}

export function withRoleAccess(
  WrappedComponent: React.ComponentType,
  requiredRoles: Role[],
  FallbackComponent?: React.ComponentType
) {
  return function WithRoleAccessWrapper(props: any) {
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