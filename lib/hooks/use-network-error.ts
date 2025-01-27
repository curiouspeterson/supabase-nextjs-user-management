'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { NetworkError } from '@/lib/errors'

export enum RetryStrategy {
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
  FIBONACCI = 'FIBONACCI'
}

interface RetryMetrics {
  totalRetries: number
  successfulRetries: number
  failedRetries: number
  lastRetry: Date | null
  avgRetryDelay: number
  maxRetryDelay: number
}

interface NetworkRetryConfig {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  strategy?: RetryStrategy
  jitterFactor?: number
  onRetryAttempt?: (attempt: number, delay: number) => void
  onMaxRetriesReached?: () => void
}

const DEFAULT_CONFIG: Required<NetworkRetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  strategy: RetryStrategy.EXPONENTIAL,
  jitterFactor: 0.1,
  onRetryAttempt: () => {},
  onMaxRetriesReached: () => {}
}

export function useNetworkError(config: NetworkRetryConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const supabase = createClient()
  
  const [metrics, setMetrics] = useState<RetryMetrics>({
    totalRetries: 0,
    successfulRetries: 0,
    failedRetries: 0,
    lastRetry: null,
    avgRetryDelay: 0,
    maxRetryDelay: 0
  })

  const calculateDelay = useCallback((attempt: number): number => {
    let delay: number
    const { baseDelay, strategy, maxDelay, jitterFactor } = mergedConfig

    switch (strategy) {
      case RetryStrategy.LINEAR:
        delay = baseDelay * attempt
        break
      case RetryStrategy.EXPONENTIAL:
        delay = baseDelay * Math.pow(2, attempt - 1)
        break
      case RetryStrategy.FIBONACCI:
        delay = baseDelay * (attempt === 1 ? 1 : fibonacci(attempt))
        break
      default:
        delay = baseDelay
    }

    // Add jitter
    const jitter = delay * jitterFactor * (Math.random() * 2 - 1)
    delay = Math.min(delay + jitter, maxDelay)

    return Math.floor(delay)
  }, [mergedConfig])

  const updateMetrics = useCallback(async (
    delay: number,
    success: boolean,
    endpoint: string
  ) => {
    const newMetrics = {
      ...metrics,
      totalRetries: metrics.totalRetries + 1,
      successfulRetries: success ? metrics.successfulRetries + 1 : metrics.successfulRetries,
      failedRetries: success ? metrics.failedRetries : metrics.failedRetries + 1,
      lastRetry: new Date(),
      avgRetryDelay: ((metrics.avgRetryDelay * metrics.totalRetries) + delay) / (metrics.totalRetries + 1),
      maxRetryDelay: Math.max(metrics.maxRetryDelay, delay)
    }

    setMetrics(newMetrics)

    try {
      await supabase.rpc('log_network_retry_metrics', {
        p_component: 'network-retry',
        p_endpoint: endpoint,
        p_metrics: newMetrics,
        p_retry_details: {
          lastAttemptSuccess: success,
          lastRetryDelay: delay,
          strategy: mergedConfig.strategy
        }
      })
    } catch (error) {
      console.error('Failed to log network retry metrics:', error)
    }
  }, [metrics, mergedConfig.strategy, supabase])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const wrapWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    endpoint: string = 'unknown'
  ): Promise<T> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= mergedConfig.maxRetries; attempt++) {
      try {
        const result = await operation()
        if (attempt > 1) {
          await updateMetrics(calculateDelay(attempt - 1), true, endpoint)
        }
        return result
      } catch (error) {
        lastError = error as Error
        
        if (attempt === mergedConfig.maxRetries) {
          await updateMetrics(calculateDelay(attempt), false, endpoint)
          mergedConfig.onMaxRetriesReached?.()
          throw new NetworkError(
            `Max retries (${mergedConfig.maxRetries}) reached for endpoint: ${endpoint}`,
            {
              cause: lastError,
              endpoint,
              attempts: attempt,
              metrics: metrics
            }
          )
        }

        const delay = calculateDelay(attempt)
        mergedConfig.onRetryAttempt?.(attempt, delay)
        await sleep(delay)
      }
    }

    // This should never be reached due to the throw above
    throw lastError
  }, [
    mergedConfig,
    calculateDelay,
    updateMetrics,
    metrics
  ])

  return {
    wrapWithRetry,
    metrics
  }
}

// Helper function for Fibonacci sequence
function fibonacci(n: number): number {
  if (n <= 1) return n
  let prev = 0, curr = 1
  for (let i = 2; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }
  return curr
}