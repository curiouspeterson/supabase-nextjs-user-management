'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
const LOADING_TIMEOUT = 5000; // 5 seconds

export function useRoleAccess(requiredRoles: Role[]): UseRoleAccessReturn {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { supabase, user } = useSupabase();

  const checkAccess = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If no user, immediately return without access
      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // If no supabase client, handle as auth error
      if (!supabase) {
        throw new AuthError('Auth client not initialized');
      }

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setError(new Error('Request timed out'));
        }
      }, LOADING_TIMEOUT);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      if (profileError) {
        // Handle 404 (no profile) differently
        if (profileError.code === 'PGRST116') {
          console.warn('No profile found for user:', user.id);
          setHasAccess(false);
          return;
        }

        // Handle unauthorized access
        if (profileError.code === '42501' || profileError.message?.includes('access control')) {
          console.warn('Unauthorized access to profiles table');
          setHasAccess(false);
          return;
        }

        throw profileError;
      }

      const userRole = profile?.role as Role;
      setHasAccess(requiredRoles.includes(userRole));
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      console.error('Error checking role access:', err);
      setError(err as Error);
      setHasAccess(false);

      // Only retry on network errors or auth errors
      const isRetryableError = 
        err instanceof AuthError || 
        (err as any)?.message?.includes('network') ||
        (err as any)?.message?.includes('timeout');

      if (retryCount < MAX_RETRIES && isRetryableError) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkAccess();
        }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, requiredRoles, retryCount, isLoading]);

  // Initial check
  useEffect(() => {
    let mounted = true;

    if (user) {
      checkAccess();
    } else {
      setHasAccess(false);
      setIsLoading(false);
      setError(null);
    }

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [user, checkAccess]);

  // Expose retry function
  const retry = useCallback(() => {
    setRetryCount(0);
    checkAccess();
  }, [checkAccess]);

  return { hasAccess, isLoading, error, retry };
}

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { hasAccess, isLoading, error } = useRoleAccess(requiredRoles);

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