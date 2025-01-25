'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface NetworkStatus {
  online: boolean
  retrying: boolean
  lastError: Error | null
}

interface RetryConfig {
  maxRetries?: number
  retryDelay?: number
  onRetryAttempt?: (attempt: number) => void
  onMaxRetriesReached?: () => void
}

export function useNetworkError(config: RetryConfig = {}) {
  const [status, setStatus] = useState<NetworkStatus>({
    online: true,
    retrying: false,
    lastError: null
  })
  const { toast } = useToast()
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetryAttempt,
    onMaxRetriesReached
  } = config

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, online: true }))
      toast({
        title: 'Connection Restored',
        description: 'You are back online.',
        variant: 'default'
      })
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, online: false }))
      toast({
        title: 'Connection Lost',
        description: 'Please check your internet connection.',
        variant: 'destructive'
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast])

  const retryWithBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> => {
    try {
      setStatus(prev => ({ ...prev, retrying: true }))
      const result = await operation()
      setStatus(prev => ({ 
        ...prev, 
        retrying: false,
        lastError: null
      }))
      return result
    } catch (error) {
      const isNetworkError = error instanceof Error && (
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch') ||
        error.message.toLowerCase().includes('timeout') ||
        error.name === 'NetworkError'
      )

      if (!isNetworkError) {
        throw error
      }

      if (attempt >= maxRetries) {
        setStatus(prev => ({ 
          ...prev, 
          retrying: false,
          lastError: error as Error
        }))
        onMaxRetriesReached?.()
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`)
      }

      const delay = retryDelay * Math.pow(2, attempt)
      onRetryAttempt?.(attempt + 1)
      
      toast({
        title: 'Connection Error',
        description: `Retrying in ${delay / 1000} seconds... (Attempt ${attempt + 1}/${maxRetries})`,
        variant: 'destructive'
      })

      await new Promise(resolve => setTimeout(resolve, delay))
      return retryWithBackoff(operation, attempt + 1)
    }
  }, [maxRetries, retryDelay, onRetryAttempt, onMaxRetriesReached, toast])

  const wrapWithRetry = useCallback(<T>(operation: () => Promise<T>) => {
    return retryWithBackoff(operation)
  }, [retryWithBackoff])

  return {
    isOnline: status.online,
    isRetrying: status.retrying,
    lastError: status.lastError,
    wrapWithRetry
  }
} 