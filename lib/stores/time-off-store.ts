import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimeOffRequest } from '@/types'

interface TimeOffState {
  requests: TimeOffRequest[]
  addRequest: (request: TimeOffRequest) => void
  updateRequest: (request: TimeOffRequest) => void
  removeRequest: (id: string) => void
  getRequest: (id: string) => TimeOffRequest | undefined
  clearRequests: () => void
}

export const useTimeOffStore = create<TimeOffState>()(
  persist(
    (set, get) => ({
      requests: [],
      
      addRequest: (request) => 
        set((state) => ({
          requests: [...state.requests, request]
        })),
      
      updateRequest: (request) =>
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === request.id ? { ...r, ...request } : r
          )
        })),
      
      removeRequest: (id) =>
        set((state) => ({
          requests: state.requests.filter((r) => r.id !== id)
        })),
      
      getRequest: (id) => 
        get().requests.find((r) => r.id === id),
      
      clearRequests: () => 
        set({ requests: [] })
    }),
    {
      name: 'time-off-store',
      version: 1,
      partialize: (state) => ({
        requests: state.requests
      })
    }
  )
) 