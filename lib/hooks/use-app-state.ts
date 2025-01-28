import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStateData {
  schedules: Record<string, any>;
  preferences: Record<string, any>;
  settings: Record<string, any>;
}

interface AppState {
  isLoading: boolean;
  error: Error | null;
  appState: AppStateData;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  persistState: () => void;
  updateState: (newState: Partial<AppStateData>) => void;
}

const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      appState: {
        schedules: {},
        preferences: {},
        settings: {}
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      persistState: () => {
        // This is handled automatically by the persist middleware
      },
      updateState: (newState) => set((state) => ({
        appState: {
          ...state.appState,
          ...newState
        }
      }))
    }),
    {
      name: 'app-state',
      partialize: (state) => ({
        appState: state.appState
      })
    }
  )
);

export { useAppState };
export type { AppState, AppStateData }; 