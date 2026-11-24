/**
 * useTestScoreStore — Zustand store for test/exam score tracking.
 */

import { create } from 'zustand'

export interface TestScore {
  id: number
  examName: string
  subject: string
  scoreObtained: number
  totalScore: number
  percentage?: number
  examDate: string
  examType: string
  notes?: string
  mission?: { id: number; title: string } | number
  createdAt?: string
  updatedAt?: string
}

interface TestScoreState {
  scores: TestScore[]
  isLoading: boolean
  error: string | null
  totalDocs: number

  fetchScores: (params?: { subject?: string; limit?: number; page?: number }) => Promise<void>
  createScore: (data: Partial<TestScore>) => Promise<TestScore | null>
  deleteScore: (id: number) => Promise<boolean>
  getAverageBySubject: () => Record<string, number>
  clearError: () => void
}

export const useTestScoreStore = create<TestScoreState>()((set, get) => ({
  scores: [],
  isLoading: false,
  error: null,
  totalDocs: 0,

  fetchScores: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const sp = new URLSearchParams()
      if (params.subject) sp.set('where[subject][equals]', params.subject)
      if (params.limit) sp.set('limit', String(params.limit))
      if (params.page) sp.set('page', String(params.page))
      sp.set('sort', '-examDate')
      sp.set('depth', '1')

      const res = await fetch(`/api/test-scores?${sp}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch test scores')
      const data = await res.json()
      set({ scores: data.docs, totalDocs: data.totalDocs, isLoading: false })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  createScore: async (data) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    if (!isOnline) {
      const { offlineSave } = await import('@/lib/offlineDB')
      const { useOfflineStore } = await import('@/stores/useOfflineStore')
      const localId = await offlineSave('test-scores', { ...data, _operation: 'create' })
      const tempScore: TestScore = {
        id: -localId,
        examName: data.examName || 'Untitled Exam',
        subject: data.subject || 'General',
        scoreObtained: data.scoreObtained || 0,
        totalScore: data.totalScore || 100,
        examDate: data.examDate || new Date().toISOString(),
        examType: data.examType || 'practice',
        createdAt: new Date().toISOString(),
        ...data,
      }
      set((state) => ({ scores: [tempScore, ...state.scores] }))
      await useOfflineStore.getState().refreshPendingCount()
      return tempScore
    }
    // Online: existing logic
    try {
      const res = await fetch('/api/test-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create test score')
      const result = await res.json()
      set((state) => ({ scores: [result.doc, ...state.scores] }))
      return result.doc
    } catch (e: any) {
      set({ error: e.message })
      return null
    }
  },

  deleteScore: async (id) => {
    try {
      const res = await fetch(`/api/test-scores/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) return false
      set((state) => ({ scores: state.scores.filter((s) => s.id !== id) }))
      return true
    } catch {
      return false
    }
  },

  getAverageBySubject: () => {
    const { scores } = get()
    const groups: Record<string, { total: number; count: number }> = {}
    for (const s of scores) {
      if (!groups[s.subject]) groups[s.subject] = { total: 0, count: 0 }
      if (s.percentage != null) {
        groups[s.subject].total += s.percentage
        groups[s.subject].count += 1
      }
    }
    const result: Record<string, number> = {}
    for (const [subject, { total, count }] of Object.entries(groups)) {
      result[subject] = count > 0 ? Math.round(total / count) : 0
    }
    return result
  },

  clearError: () => set({ error: null }),
}))

