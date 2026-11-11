/**
 * useMissionStore — Zustand store for missions & projects.
 */

import { create } from 'zustand'

export interface Project {
  id: number
  title: string
  description?: string
  status: string
  deadline?: string
  color?: string
  createdAt?: string
}

export interface Mission {
  id: number
  title: string
  type: 'study' | 'habit' | 'hobby'
  description?: string
  targetHours?: number
  status: string
  project?: Project | number
  createdAt?: string
  updatedAt?: string
}

interface MissionState {
  missions: Mission[]
  projects: Project[]
  isLoading: boolean
  error: string | null

  fetchMissions: () => Promise<void>
  fetchProjects: () => Promise<void>
  updateMissionStatus: (id: number, status: string) => Promise<boolean>
  clearError: () => void
}

export const useMissionStore = create<MissionState>()((set) => ({
  missions: [],
  projects: [],
  isLoading: false,
  error: null,

  fetchMissions: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/missions?sort=-updatedAt&depth=1&limit=50', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch missions')
      const data = await res.json()
      set({ missions: data.docs, isLoading: false })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  fetchProjects: async () => {
    try {
      const res = await fetch('/api/projects?sort=-updatedAt&depth=0&limit=50', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      set({ projects: data.docs })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  updateMissionStatus: async (id, status) => {
    try {
      const res = await fetch(`/api/missions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      })
      if (!res.ok) return false
      const updated = await res.json()
      set((state) => ({
        missions: state.missions.map((m) => (m.id === id ? { ...m, ...updated.doc } : m)),
      }))
      return true
    } catch {
      return false
    }
  },

  clearError: () => set({ error: null }),
}))

