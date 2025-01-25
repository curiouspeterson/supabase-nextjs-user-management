import { useToast } from '@/components/ui/use-toast'

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    console.error('Error:', error)
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    })
  }

  return { handleError }
} 