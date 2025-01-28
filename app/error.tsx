'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { errorHandler } from '@/lib/errors';
import { ErrorAnalyticsService } from '@/lib/error-analytics';

const analyticsService = new ErrorAnalyticsService('next-error-page');

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Handle and track the error
    errorHandler.handleError(error, 'next-error-page');
    
    // Track error analytics
    analyticsService.trackError(error, {
      digest: error.digest,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined
    }).catch(console.error);
  }, [error]);

  const errorMessage = errorHandler.formatErrorMessage(error);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Something went wrong!</h2>
        </div>
        
        <p className="text-sm text-gray-600">
          {errorMessage}
        </p>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          <Button
            onClick={() => {
              // Clear any error state before retrying
              errorHandler.handleError(error, 'next-error-page-reset');
              reset();
            }}
          >
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
} 