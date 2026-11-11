/**
 * useAuthStore — Zustand store for authentication state.
 * Uses Payload CMS built-in auth (POST /api/users/login).
 * Persists user session in localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: number
  email: string
  name?: string
  role?: 'admin' | 'user'
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            set({
              isLoading: false,
              error: data?.errors?.[0]?.message || 'Invalid credentials',
            })
            return false
          }

          const data = await res.json()
          set({
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role || 'user',
            },
            token: data.token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch {
          set({ isLoading: false, error: 'Network error. Please try again.' })
          return false
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null })
        try {
          // Standard signup automatically defaults to role: 'user'
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role: 'user' }),
            credentials: 'include',
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            const errorMsg =
              data?.errors?.[0]?.message ||
              (data?.message ? String(data.message) : 'Account registration failed')
            set({ isLoading: false, error: errorMsg })
            return false
          }

          // Automatically log the newly registered normal user in
          return await get().login(email, password)
        } catch {
          set({ isLoading: false, error: 'Registration network error. Please try again.' })
          return false
        }
      },

      logout: async () => {
        try {
          await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include',
          })
        } catch {
          // Ignore network errors during logout
        }
        set({ user: null, token: null, isAuthenticated: false, error: null })
      },

      checkAuth: async () => {
        try {
          const res = await fetch('/api/users/me', {
            credentials: 'include',
          })
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              set({
                user: {
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.name,
                  role: data.user.role || 'user',
                },
                isAuthenticated: true,
              })
              return
            }
          }
          // Not authenticated
          set({ user: null, token: null, isAuthenticated: false })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'toggle-dawn-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
