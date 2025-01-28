'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Something went wrong!</h2>
        </div>
        
        <p className="text-sm text-gray-600">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          <Button
            onClick={() => reset()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
} 