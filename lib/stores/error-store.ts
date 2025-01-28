'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'
import { AppError } from '@/lib/errors'
import { errorAnalytics } from '@/lib/error-analytics'

interface ErrorState {
  errors: Map<string, ErrorDetails>
  lastError: ErrorDetails | null
  hasError: boolean
}

interface ErrorActions {
  setError: (path: string, error: AppError) => void
  clearError: (path: string) => void
  clearAllErrors: () => void
  hasErrorForPath: (path: string) => boolean
  getErrorForPath: (path: string) => ErrorDetails | null
}

interface ErrorDetails {
  message: string
  code: string
  severity: ErrorSeverity
  category: ErrorCategory
  timestamp: string
  path: string
  metadata?: Record<string, unknown>
}

const initialState: ErrorState = {
  errors: new Map(),
  lastError: null,
  hasError: false
}

export const useErrorStore = create<ErrorState & ErrorActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setError: (path: string, error: AppError) => {
        // Create new AppError instance for tracking
        const newError = new AppError(
          error.message,
          error.code,
          error.statusCode,
          error.shouldLog,
          error.severity,
          error.category,
          {
            ...error.metadata,
            path,
            timestamp: new Date().toISOString()
          },
          error.recoveryStrategy
        )

        // Track error in analytics
        errorAnalytics.trackError(newError)

        // Convert to ErrorDetails for state storage
        const errorDetails: ErrorDetails = {
          message: newError.message,
          code: newError.code,
          severity: newError.severity,
          category: newError.category,
          timestamp: new Date().toISOString(),
          path,
          metadata: newError.metadata
        }

        set(state => {
          const newErrors = new Map(state.errors)
          newErrors.set(path, errorDetails)
          return {
            errors: newErrors,
            lastError: errorDetails,
            hasError: true
          }
        })
      },

      clearError: (path: string) => {
        set(state => {
          const newErrors = new Map(state.errors)
          newErrors.delete(path)
          return {
            errors: newErrors,
            lastError: newErrors.size > 0 
              ? Array.from(newErrors.values())[newErrors.size - 1]
              : null,
            hasError: newErrors.size > 0
          }
        })
      },

      clearAllErrors: () => {
        set(initialState)
      },

      hasErrorForPath: (path: string) => {
        return get().errors.has(path)
      },

      getErrorForPath: (path: string) => {
        return get().errors.get(path) || null
      }
    }),
    {
      name: 'error-store',
      partialize: (state) => ({
        errors: Array.from(state.errors.entries()),
        lastError: state.lastError,
        hasError: state.hasError
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        errors: new Map(persistedState.errors || [])
      })
    }
  )
) 