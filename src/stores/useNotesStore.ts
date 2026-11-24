/**
 * useNotesStore — Zustand store for notes management.
 * Fetches from Payload REST API and caches client-side.
 * Supports full offline CRUD with "latest timestamp wins" sync.
 */

import { create } from 'zustand'
import { offlineSave, offlineUpdate, offlineDeleteOp } from '@/lib/offlineDB'

// Use a lazy getter to avoid circular dependency with useOfflineStore
function getOfflineStore() {
  return import('@/stores/useOfflineStore').then((m) => m.useOfflineStore)
}

export interface Note {
  id: number
  title: string
  slug?: string
  noteType: 'note' | 'flashcard' | 'summary' | 'formula'
  chapter?: { id: number; title: string; slug?: string } | number
  content?: any
  isCompleted?: boolean
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

interface NotesState {
  notes: Note[]
  activeNote: Note | null
  isLoading: boolean
  error: string | null
  totalDocs: number

  fetchNotes: (params?: { chapter?: number; limit?: number; page?: number }) => Promise<void>
  fetchNoteById: (id: number) => Promise<Note | null>
  setActiveNote: (note: Note | null) => void
  createNote: (data: Partial<Note>) => Promise<Note | null>
  updateNote: (id: number, data: Partial<Note>) => Promise<boolean>
  deleteNote: (id: number) => Promise<boolean>
  clearError: () => void
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  activeNote: null,
  isLoading: false,
  error: null,
  totalDocs: 0,

  fetchNotes: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.chapter) searchParams.set('where[chapter][equals]', String(params.chapter))
      if (params.limit) searchParams.set('limit', String(params.limit))
      if (params.page) searchParams.set('page', String(params.page))
      searchParams.set('sort', '-updatedAt')
      searchParams.set('depth', '1')

      const res = await fetch(`/api/notes?${searchParams}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch notes')
      const data = await res.json()
      set({ notes: data.docs, totalDocs: data.totalDocs, isLoading: false })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  fetchNoteById: async (id: number) => {
    try {
      const res = await fetch(`/api/notes/${id}?depth=1`, { credentials: 'include' })
      if (!res.ok) return null
      const note = await res.json()
      set({ activeNote: note })
      return note
    } catch {
      return null
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  createNote: async (data) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    // Build normalized payload (slug + lexical content normalization)
    const payloadData: any = { ...data }
    if (!payloadData.slug && payloadData.title) {
      payloadData.slug =
        payloadData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `note-${Date.now()}`
    }
    if (typeof payloadData.content === 'string' || !payloadData.content?.root) {
      const text =
        typeof payloadData.content === 'string' ? payloadData.content : payloadData.title || ''
      payloadData.content = {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text,
                  version: 1,
                },
              ],
            },
          ],
        },
      }
    }

    if (!isOnline) {
      try {
        const localId = await offlineSave('notes', { ...payloadData, _operation: 'create' })
        const tempNote: Note = {
          id: -localId,
          title: payloadData.title ?? '',
          noteType: payloadData.noteType ?? 'note',
          ...payloadData,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ notes: [tempNote, ...state.notes] }))
        const store = await getOfflineStore()
        await store.getState().refreshPendingCount()
        return tempNote
      } catch (e: any) {
        set({ error: e.message })
        return null
      }
    }

    // Online path
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create note')
      const note = await res.json()
      set((state) => ({ notes: [note.doc, ...state.notes] }))
      return note.doc
    } catch (e: any) {
      set({ error: e.message })
      return null
    }
  },

  updateNote: async (id, data) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    if (!isOnline) {
      try {
        await offlineUpdate('notes', id, data)
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n,
          ),
          activeNote:
            state.activeNote?.id === id
              ? { ...state.activeNote, ...data, updatedAt: new Date().toISOString() }
              : state.activeNote,
        }))
        const store = await getOfflineStore()
        await store.getState().refreshPendingCount()
        return true
      } catch {
        return false
      }
    }

    // Online path
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) return false
      const updated = await res.json()
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updated.doc } : n)),
        activeNote:
          state.activeNote?.id === id
            ? { ...state.activeNote, ...updated.doc }
            : state.activeNote,
      }))
      return true
    } catch {
      return false
    }
  },

  deleteNote: async (id) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    if (!isOnline) {
      try {
        // Only queue a delete op for real server records (positive ids)
        if (id > 0) await offlineDeleteOp('notes', id)
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          activeNote: state.activeNote?.id === id ? null : state.activeNote,
        }))
        const store = await getOfflineStore()
        await store.getState().refreshPendingCount()
        return true
      } catch {
        return false
      }
    }

    // Online path
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) return false
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
      }))
      return true
    } catch {
      return false
    }
  },

  clearError: () => set({ error: null }),
}))
