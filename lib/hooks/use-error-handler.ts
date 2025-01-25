import { useToast } from '@/components/ui/use-toast'
import { errorHandler } from '@/lib/errors'
import { useCallback } from 'react'

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback((error: unknown, context?: string) => {
    // Log error
    const errorResult = errorHandler.handleError(error, context)

    // Show toast notification
    toast({
      title: 'Error',
      description: errorHandler.formatErrorMessage(error),
      variant: 'destructive',
    })

    return errorResult
  }, [toast])

  return {
    handleError,
  }
} 