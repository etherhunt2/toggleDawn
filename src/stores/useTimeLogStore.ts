/**
 * useTimeLogStore — Zustand store for time tracking.
 * Manages time log entries, active timer, and daily summaries.
 */

import { create } from 'zustand'

export interface TimeLog {
  id: number
  startTime: string
  endTime: string
  duration?: number
  category: string
  description?: string
  mission?: { id: number; title: string } | number
  isRetroactive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DailySummary {
  category: string
  totalMinutes: number
  count: number
}

interface TimeLogState {
  logs: TimeLog[]
  todayLogs: TimeLog[]
  isLoading: boolean
  error: string | null
  totalDocs: number

  fetchLogs: (params?: { date?: string; limit?: number; page?: number }) => Promise<void>
  fetchTodayLogs: () => Promise<void>
  createLog: (data: Partial<TimeLog>) => Promise<TimeLog | null>
  updateLog: (id: number, data: Partial<TimeLog>) => Promise<boolean>
  deleteLog: (id: number) => Promise<boolean>
  getDailySummary: () => DailySummary[]
  clearError: () => void
}

export const useTimeLogStore = create<TimeLogState>()((set, get) => ({
  logs: [],
  todayLogs: [],
  isLoading: false,
  error: null,
  totalDocs: 0,

  fetchLogs: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.limit) searchParams.set('limit', String(params.limit))
      if (params.page) searchParams.set('page', String(params.page))
      searchParams.set('sort', '-startTime')
      searchParams.set('depth', '1')

      if (params.date) {
        const dayStart = `${params.date}T00:00:00.000Z`
        const dayEnd = `${params.date}T23:59:59.999Z`
        searchParams.set('where[startTime][greater_than_equal]', dayStart)
        searchParams.set('where[startTime][less_than_equal]', dayEnd)
      }

      const res = await fetch(`/api/time-logs?${searchParams}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch time logs')
      const data = await res.json()
      set({ logs: data.docs, totalDocs: data.totalDocs, isLoading: false })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  fetchTodayLogs: async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const dayStart = `${today}T00:00:00.000Z`
      const dayEnd = `${today}T23:59:59.999Z`
      const params = new URLSearchParams({
        'where[startTime][greater_than_equal]': dayStart,
        'where[startTime][less_than_equal]': dayEnd,
        sort: '-startTime',
        depth: '1',
        limit: '50',
      })

      const res = await fetch(`/api/time-logs?${params}`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      set({ todayLogs: data.docs })
    } catch {
      // Silent fail for background fetch
    }
  },

  createLog: async (data) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    if (!isOnline) {
      const { offlineSave } = await import('@/lib/offlineDB')
      const { useOfflineStore } = await import('@/stores/useOfflineStore')
      const localId = await offlineSave('time-logs', { ...data, _operation: 'create' })
      const tempLog: TimeLog = {
        id: -localId,
        startTime: data.startTime || new Date().toISOString(),
        endTime: data.endTime || new Date().toISOString(),
        category: data.category || 'General',
        createdAt: new Date().toISOString(),
        ...data,
      }
      set((state) => ({
        logs: [tempLog, ...state.logs],
      }))
      await useOfflineStore.getState().refreshPendingCount()
      return tempLog
    }
    // Online: existing logic
    try {
      const res = await fetch('/api/time-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create time log')
      const result = await res.json()
      set((state) => ({
        logs: [result.doc, ...state.logs],
      }))
      get().fetchTodayLogs()
      return result.doc
    } catch (e: any) {
      set({ error: e.message })
      return null
    }
  },

  updateLog: async (id, data) => {
    try {
      const res = await fetch(`/api/time-logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) return false
      const updated = await res.json()
      set((state) => ({
        logs: state.logs.map((l) => (l.id === id ? { ...l, ...updated.doc } : l)),
      }))
      return true
    } catch {
      return false
    }
  },

  deleteLog: async (id) => {
    try {
      const res = await fetch(`/api/time-logs/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) return false
      set((state) => ({
        logs: state.logs.filter((l) => l.id !== id),
        todayLogs: state.todayLogs.filter((l) => l.id !== id),
      }))
      return true
    } catch {
      return false
    }
  },

  getDailySummary: () => {
    const { todayLogs } = get()
    const summary: Record<string, DailySummary> = {}
    for (const log of todayLogs) {
      if (!summary[log.category]) {
        summary[log.category] = { category: log.category, totalMinutes: 0, count: 0 }
      }
      summary[log.category].totalMinutes += log.duration || 0
      summary[log.category].count += 1
    }
    return Object.values(summary)
  },

  clearError: () => set({ error: null }),
}))

