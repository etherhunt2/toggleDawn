'use client'

import { create } from 'zustand'

export type ToastType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'terminate'
  | 'quit'
  | 'pause'
  | 'resume'
  | 'sync'

export interface HUDToast {
  id: string
  type: ToastType
  title: string
  message: string
  detail?: string
  duration?: number // ms, defaults to 4500
  createdAt: number
}

interface ToastState {
  toasts: HUDToast[]
  showToast: (toast: Omit<HUDToast, 'id' | 'createdAt'>) => string
  updateToast: (id: string, updates: Partial<Omit<HUDToast, 'id' | 'createdAt'>>) => void
  dismissToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newToast: HUDToast = {
      ...toast,
      id,
      duration: toast.duration ?? 4500,
      createdAt: Date.now(),
    }

    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast], // Keep at most 5 toasts on screen
    }))

    // Auto dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }

    return id
  },

  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))

    // If an updated toast has a duration, reset its dismissal
    const duration = updates.duration ?? 4500
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearAll: () => {
    set({ toasts: [] })
  },
}))

/**
 * Convenience helper to show a toast anywhere in the app without hooks
 */
export function triggerHUDToast(toast: Omit<HUDToast, 'id' | 'createdAt'>): string {
  const id = useToastStore.getState().showToast(toast)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toggledawn:hud-toast', {
        detail: {
          ...toast,
          id,
          createdAt: Date.now(),
          duration: toast.duration ?? 4500,
        },
      }),
    )
  }
  return id
}
