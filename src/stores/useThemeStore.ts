/**
 * useThemeStore — Zustand store for theme management.
 * Syncs with Payload's existing data-theme attribute system.
 * Replaces the need for React Context-based theme management.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark' as Theme,

      setTheme: (theme: Theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },
    }),
    {
      name: 'payload-theme',
      onRehydrateStorage: () => (state) => {
        // Sync DOM on rehydration
        if (state && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    },
  ),
)

