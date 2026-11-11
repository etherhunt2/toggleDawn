/**
 * useScheduleStore — Zustand store for schedule/planner management.
 * Syncs with Payload REST API (/api/schedules) with client-side caching.
 */

import { create } from 'zustand'

export interface ScheduleEvent {
  id: number | string
  title: string
  description?: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  category: 'study' | 'work' | 'exercise' | 'social' | 'rest' | 'other'
  isRecurring: boolean
  recurringDays?: number[] // 0=Sun, 1=Mon, ...
  color?: string
  isCompleted: boolean
  mission?: { id: number; title: string } | number
  createdAt?: string
  updatedAt?: string
}

interface ScheduleState {
  events: ScheduleEvent[]
  selectedDate: string
  isLoading: boolean
  error: string | null

  fetchEvents: (params?: { date?: string }) => Promise<void>
  addEvent: (event: Partial<ScheduleEvent>) => Promise<ScheduleEvent | null>
  updateEvent: (id: number | string, data: Partial<ScheduleEvent>) => Promise<boolean>
  removeEvent: (id: number | string) => Promise<boolean>
  toggleComplete: (id: number | string) => Promise<void>
  setSelectedDate: (date: string) => void
  getEventsForDate: (date: string) => ScheduleEvent[]
  getUpcomingEvents: (limit?: number) => ScheduleEvent[]
  clearError: () => void
}

export const useScheduleStore = create<ScheduleState>()((set, get) => ({
  events: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  fetchEvents: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.date) {
        searchParams.set('where[date][equals]', params.date)
      }
      searchParams.set('sort', 'startTime')
      searchParams.set('depth', '1')
      searchParams.set('limit', '100')

      const res = await fetch(`/api/schedules?${searchParams}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch schedules')
      const data = await res.json()
      set({ events: data.docs, isLoading: false })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  addEvent: async (data) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category || 'study',
          isRecurring: data.isRecurring || false,
          recurringDays: data.recurringDays || [],
          color: data.color || '#00ff9d',
          isCompleted: data.isCompleted || false,
          ...(data.mission ? { mission: data.mission } : {}),
        }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create schedule event')
      const result = await res.json()
      const newEvent = result.doc
      set((state) => ({ events: [...state.events, newEvent] }))
      return newEvent
    } catch (e: any) {
      set({ error: e.message })
      return null
    }
  },

  updateEvent: async (id, data) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) return false
      const updated = await res.json()
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...updated.doc } : e)),
      }))
      return true
    } catch {
      return false
    }
  },

  removeEvent: async (id) => {
    const prev = get().events
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }))

    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete schedule event')
      return true
    } catch {
      set({ events: prev })
      return false
    }
  },

  toggleComplete: async (id) => {
    const event = get().events.find((e) => e.id === id)
    if (!event) return

    const newCompleted = !event.isCompleted
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, isCompleted: newCompleted } : e)),
    }))

    try {
      await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newCompleted }),
        credentials: 'include',
      })
    } catch {
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
      }))
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  getEventsForDate: (date) => {
    const { events } = get()
    const dayOfWeek = new Date(date).getDay()
    return events
      .filter((e) => {
        if (e.date === date || e.date?.startsWith(date)) return true
        if (e.isRecurring && Array.isArray(e.recurringDays) && e.recurringDays.includes(dayOfWeek)) {
          return true
        }
        return false
      })
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  },

  getUpcomingEvents: (limit = 5) => {
    const { events } = get()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    return events
      .filter((e) => {
        const evDate = e.date?.split('T')[0] || e.date
        if (evDate > today) return true
        if (evDate === today && (e.startTime || '') >= currentTime) return true
        return false
      })
      .sort((a, b) => {
        const aDate = a.date?.split('T')[0] || a.date
        const bDate = b.date?.split('T')[0] || b.date
        const dateCompare = aDate.localeCompare(bDate)
        if (dateCompare !== 0) return dateCompare
        return (a.startTime || '').localeCompare(b.startTime || '')
      })
      .slice(0, limit)
  },

  clearError: () => set({ error: null }),
}))
