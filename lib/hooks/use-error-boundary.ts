import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface ErrorBoundaryState {
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export function useErrorBoundary() {
  const { toast } = useToast()

  const handleError = useCallback((error: unknown) => {
    console.error('Error caught by error boundary:', error)

    // Log error to monitoring service
    // TODO: Implement proper error logging service
    
    toast({
      title: 'An error occurred',
      description: error instanceof Error ? error.message : 'Something went wrong',
      variant: 'destructive'
    })

    return {
      error: error instanceof Error ? error : new Error('An unknown error occurred'),
      errorInfo: null
    } as ErrorBoundaryState
  }, [toast])

  return {
    handleError
  }
} 