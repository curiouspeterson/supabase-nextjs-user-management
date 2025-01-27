'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { resetPatternsError } from './actions';

export default function PatternsError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('Patterns page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'Failed to load shift patterns. Please try again.'}
        </p>
        <Button onClick={() => resetPatternsError()}>Try again</Button>
      </div>
    </div>
  );
} 