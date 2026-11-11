/**
 * useFlashCardStore — Zustand store for flash card state.
 * Manages deck loading, study progress, and CRUD operations.
 */

import { create } from 'zustand'

export interface FlashCard {
  id: number
  title: string
  contentType: 'text' | 'image' | 'pdf'
  textContent?: any
  image?: { url: string; alt?: string; filename?: string } | number
  pdf?: { url: string; filename?: string } | number
  book?: { id: number; title: string } | number
  chapter?: { id: number; title: string } | number
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

interface FlashCardState {
  cards: FlashCard[]
  currentIndex: number
  isLoading: boolean
  error: string | null
  totalDocs: number
  studyMode: 'serial' | 'jumbled'
  filterBook: string
  filterChapter: string
  searchQuery: string

  fetchCards: (params?: {
    book?: string
    chapter?: string
    search?: string
    sort?: 'serial' | 'random'
  }) => Promise<void>
  setCurrentIndex: (index: number) => void
  nextCard: () => void
  prevCard: () => void
  setStudyMode: (mode: 'serial' | 'jumbled') => void
  setFilterBook: (book: string) => void
  setFilterChapter: (chapter: string) => void
  setSearchQuery: (query: string) => void
  createCard: (data: Partial<FlashCard>) => Promise<FlashCard | null>
  updateCard: (id: number, data: Partial<FlashCard>) => Promise<boolean>
  deleteCard: (id: number) => Promise<boolean>
  clearError: () => void
  reset: () => void
}

export const useFlashCardStore = create<FlashCardState>()((set, get) => ({
  cards: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  totalDocs: 0,
  studyMode: 'serial',
  filterBook: '',
  filterChapter: '',
  searchQuery: '',

  fetchCards: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      // 1. If search is requested, query Elasticsearch index for fuzzy BM25 matching
      if (params.search && params.search.trim()) {
        try {
          const esRes = await fetch(
            `/api/search/elasticsearch?q=${encodeURIComponent(
              params.search.trim()
            )}&index=toggledawn_flashcards&size=50`
          )
          if (esRes.ok) {
            const esData = await esRes.json()
            const hits = esData.hits?.hits || []
            if (hits.length > 0) {
              const matchedCards: FlashCard[] = hits.map((h: any) => ({
                id: typeof h._id === 'number' ? h._id : parseInt(String(h._id).replace(/\D/g, '') || '1', 10),
                title: h._source.title || h._source.frontPrompt,
                contentType: (h._source.imageData ? 'image' : 'text') as 'image' | 'text',
                image: h._source.imageData ? { url: h._source.imageData, alt: h._source.title } : undefined,
                textContent: h._source.backSolution
                  ? {
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
                            children: [{ type: 'text', text: h._source.backSolution }],
                          },
                        ],
                      },
                    }
                  : undefined,
              }))

              set({
                cards: matchedCards,
                totalDocs: matchedCards.length,
                isLoading: false,
                currentIndex: 0,
              })
              return
            }
          }
        } catch (_esErr) {
          // Fallback to standard Payload API if Elasticsearch is offline
        }
      }

      // 2. Standard API query
      const searchParams = new URLSearchParams()
      if (params.book) searchParams.set('book', params.book)
      if (params.chapter) searchParams.set('chapter', params.chapter)
      if (params.search) searchParams.set('search', params.search)
      if (params.sort) searchParams.set('sort', params.sort)

      const res = await fetch(`/api/flash-cards?${searchParams}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch flash cards')
      const data = await res.json()
      set({
        cards: data.docs,
        totalDocs: data.totalDocs,
        isLoading: false,
        currentIndex: 0,
      })
    } catch (e: any) {
      set({ isLoading: false, error: e.message })
    }
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),

  nextCard: () => {
    const { cards, currentIndex } = get()
    if (currentIndex < cards.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  prevCard: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },

  setStudyMode: (mode) => set({ studyMode: mode }),
  setFilterBook: (book) => set({ filterBook: book }),
  setFilterChapter: (chapter) => set({ filterChapter: chapter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  createCard: async (data) => {
    try {
      const res = await fetch('/api/flash-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create flash card')
      const result = await res.json()
      set((state) => ({ cards: [...state.cards, result.doc] }))
      return result.doc
    } catch (e: any) {
      set({ error: e.message })
      return null
    }
  },

  updateCard: async (id, data) => {
    try {
      const res = await fetch(`/api/flash-cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) return false
      const result = await res.json()
      set((state) => ({
        cards: state.cards.map((c) => (c.id === id ? { ...c, ...result.doc } : c)),
      }))
      return true
    } catch {
      return false
    }
  },

  deleteCard: async (id) => {
    try {
      const res = await fetch(`/api/flash-cards/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) return false
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
        currentIndex: Math.min(state.currentIndex, Math.max(0, state.cards.length - 2)),
      }))
      return true
    } catch {
      return false
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      cards: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
      totalDocs: 0,
      studyMode: 'serial',
      filterBook: '',
      filterChapter: '',
      searchQuery: '',
    }),
}))

