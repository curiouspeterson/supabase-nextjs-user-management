import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { AuthError, DatabaseError } from '@/lib/errors'

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error)

    // Default error message
    let message = 'An unexpected error occurred. Please try again.'

    // Handle specific error types
    if (error instanceof AuthError) {
      message = error.message || 'Authentication error occurred.'
    } else if (error instanceof DatabaseError) {
      message = error.message || 'Database error occurred.'
    } else if (error instanceof Error) {
      message = error.message
    }

    // Show toast notification
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }, [toast])

  return { handleError }
} 