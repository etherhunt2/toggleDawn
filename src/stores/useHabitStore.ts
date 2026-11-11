/**
 * useHabitStore — Zustand store for habit tracking.
 * Syncs with Payload REST API (/api/habits) with client-side caching.
 */

import { create } from 'zustand'

export interface Habit {
  id: number | string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  streak: number
  bestStreak: number
  completedDates: string[] // ISO date strings (YYYY-MM-DD)
  color?: string
  isActive: boolean
  mission?: { id: number; title: string } | number
  createdAt?: string
  updatedAt?: string
}

interface HabitState {
  habits: Habit[]
  isLoading: boolean
  error: string | null

  fetchHabits: () => Promise<void>
  addHabit: (data: Partial<Habit>) => Promise<Habit | null>
  toggleCompletion: (habitId: number | string, date?: string) => Promise<void>
  removeHabit: (habitId: number | string) => Promise<boolean>
  updateHabit: (habitId: number | string, data: Partial<Habit>) => Promise<boolean>
  getStreakForHabit: (habitId: number | string) => number
  getTodayCompletionRate: () => number
  clearError: () => void
}

export const useHabitStore = create<HabitState>()((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/habits?limit=100&depth=1&sort=-updatedAt', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch habits')
      const data = await res.json()
      set({ habits: data.docs, isLoading: false })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  addHabit: async (data) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          frequency: data.frequency || 'daily',
          streak: 0,
          bestStreak: 0,
          completedDates: [],
          color: data.color || '#00ff9d',
          isActive: data.isActive !== undefined ? data.isActive : true,
          ...(data.mission ? { mission: data.mission } : {}),
        }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create habit')
      const result = await res.json()
      const newHabit = result.doc
      set((state) => ({ habits: [newHabit, ...state.habits] }))
      return newHabit
    } catch (e: any) {
      set({ error: e.message })
      return null
    }
  },

  toggleCompletion: async (habitId, date) => {
    const today = date || new Date().toISOString().split('T')[0]
    const habit = get().habits.find((h) => h.id === habitId)
    if (!habit) return

    const currentDates: string[] = Array.isArray(habit.completedDates) ? habit.completedDates : []
    const alreadyDone = currentDates.includes(today)
    const completedDates = alreadyDone
      ? currentDates.filter((d) => d !== today)
      : [...currentDates, today]

    // Recalculate streak
    let streak = 0
    const sorted = [...completedDates].sort().reverse()
    const checkDate = new Date()
    for (const d of sorted) {
      const expected = checkDate.toISOString().split('T')[0]
      if (d === expected) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    const updatedData = {
      completedDates,
      streak,
      bestStreak: Math.max(habit.bestStreak || 0, streak),
    }

    // Optimistic local update
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habitId ? { ...h, ...updatedData } : h)),
    }))

    // Server update
    try {
      await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
        credentials: 'include',
      })
    } catch (e: any) {
      // Revert if failed
      set((state) => ({
        habits: state.habits.map((h) => (h.id === habitId ? habit : h)),
        error: e.message,
      }))
    }
  },

  removeHabit: async (habitId) => {
    const prev = get().habits
    set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) }))

    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete habit')
      return true
    } catch {
      set({ habits: prev })
      return false
    }
  },

  updateHabit: async (habitId, data) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) return false
      const updated = await res.json()
      set((state) => ({
        habits: state.habits.map((h) => (h.id === habitId ? { ...h, ...updated.doc } : h)),
      }))
      return true
    } catch {
      return false
    }
  },

  getStreakForHabit: (habitId) => {
    const habit = get().habits.find((h) => h.id === habitId)
    return habit?.streak || 0
  },

  getTodayCompletionRate: () => {
    const { habits } = get()
    const today = new Date().toISOString().split('T')[0]
    const activeHabits = habits.filter((h) => h.isActive)
    if (activeHabits.length === 0) return 0
    const completed = activeHabits.filter(
      (h) => Array.isArray(h.completedDates) && h.completedDates.includes(today),
    ).length
    return Math.round((completed / activeHabits.length) * 100)
  },

  clearError: () => set({ error: null }),
}))
