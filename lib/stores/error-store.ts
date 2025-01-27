'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'
import { errorAnalytics } from '@/lib/error-analytics'

interface ErrorState {
  errors: Map<string, AppError>
  lastError: AppError | null
  hasError: boolean
}

interface ErrorActions {
  setError: (path: string, error: AppError) => void
  clearError: (path: string) => void
  clearAllErrors: () => void
  hasErrorForPath: (path: string) => boolean
  getErrorForPath: (path: string) => AppError | null
}

interface AppError {
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
        const newError = {
          ...error,
          timestamp: new Date().toISOString(),
          path
        }

        // Track error in analytics
        errorAnalytics.trackError(newError)

        set(state => {
          const newErrors = new Map(state.errors)
          newErrors.set(path, newError)
          return {
            errors: newErrors,
            lastError: newError,
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