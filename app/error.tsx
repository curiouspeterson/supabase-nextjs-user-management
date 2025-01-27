'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { resetGlobalError } from './actions';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm max-w-2xl w-full">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred. Please try again later.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              onClick={() => resetGlobalError()}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 