import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Schedule } from '@/types'

interface ScheduleState {
  schedules: Schedule[]
  addSchedule: (schedule: Schedule) => void
  updateSchedule: (schedule: Schedule) => void
  removeSchedule: (id: string) => void
  getSchedule: (id: string) => Schedule | undefined
  clearSchedules: () => void
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],
      
      addSchedule: (schedule) => 
        set((state) => ({
          schedules: [...state.schedules, schedule]
        })),
      
      updateSchedule: (schedule) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === schedule.id ? { ...s, ...schedule } : s
          )
        })),
      
      removeSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id)
        })),
      
      getSchedule: (id) => 
        get().schedules.find((s) => s.id === id),
      
      clearSchedules: () => 
        set({ schedules: [] })
    }),
    {
      name: 'schedule-store',
      version: 1,
      partialize: (state) => ({
        schedules: state.schedules
      })
    }
  )
) 