/**
 * useCapturedAssetsStore — Zustand store for device camera-captured assets and intake inbox.
 * Persists captured images and structured metadata in localStorage.
 * Supports quick-save / skip (drafts / needs-structure) and structured completion without duplicates.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CapturedAssetType = 'project' | 'mission' | 'note' | 'flashcard'

export interface CapturedAssetDetails {
  // Database synchronization tracking (prevents duplicate database records)
  syncedNoteId?: number
  syncedFlashCardId?: number

  // Project Toolkit
  projectName?: string
  projectId?: number | string
  toolkitCategory?: string // 'Architecture' | 'Code Snippet' | 'Schematic' | 'Specification' | 'Other'
  projectTags?: string
  projectNotes?: string

  // Mission Resource
  missionName?: string
  missionId?: number | string
  resourceType?: string // 'Proof of Completion' | 'Intel Briefing' | 'Worksheet' | 'Field Photo'
  missionNotes?: string

  // Note
  noteTitle?: string
  subject?: string
  keyTakeaway?: string
  noteContent?: string
  formula?: string
  tags?: string

  // Flash Card
  frontPrompt?: string
  backSolution?: string
  flashCardSubject?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface CapturedAsset {
  id: string
  imageData: string // base64 data URL
  timestamp: string
  type: CapturedAssetType
  status: 'draft' | 'structured' // 'draft' when user skipped the details step!
  title: string
  details: CapturedAssetDetails
}

interface CapturedAssetsState {
  assets: CapturedAsset[]
  activeAsset: CapturedAsset | null

  // Actions
  addAsset: (asset: Omit<CapturedAsset, 'id' | 'timestamp'>) => CapturedAsset
  updateAsset: (id: string, updates: Partial<CapturedAsset>) => void
  deleteAsset: (id: string) => void
  setActiveAsset: (asset: CapturedAsset | null) => void
  getDraftCount: () => number
  markAsStructured: (id: string) => void
  clearAllDrafts: () => void
  deduplicateAssets: () => void
}

// Initial demo items to showcase vault capabilities
const DEMO_ASSETS: CapturedAsset[] = [
  {
    id: 'cap-demo-1',
    imageData:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23060f1e"/><circle cx="300" cy="200" r="100" fill="none" stroke="%2300f0ff" stroke-width="4" stroke-dasharray="8 8"/><circle cx="300" cy="200" r="10" fill="%2300ff9d"/><line x1="300" y1="200" x2="420" y2="120" stroke="%23ef4444" stroke-width="3"/><text x="430" y="125" fill="%23ef4444" font-family="monospace" font-size="14">Torque τ = r × F</text><text x="30" y="50" fill="%2300f0ff" font-family="monospace" font-size="16">[OPTICAL SCAN] ROTATIONAL DYNAMICS SCHEMATIC</text><text x="30" y="80" fill="%2394a3b8" font-family="monospace" font-size="12">Captured via Tactical Optical Sensor // Raw Draft</text></svg>',
    timestamp: '2026-11-10T12:00:00.000Z',
    type: 'note',
    status: 'draft', // Skipped — needs structuring!
    title: '[DRAFT] Rotational Dynamics Vector Scan',
    details: {
      subject: 'Physics',
      noteTitle: 'Rotational Dynamics Vector Scan',
      keyTakeaway: 'Torque cross product relation with moment arm',
    },
  },
  {
    id: 'cap-demo-2',
    imageData:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%230a101f"/><rect x="50" y="80" width="220" height="120" rx="10" fill="%23131c31" stroke="%233b82f6" stroke-width="2"/><text x="70" y="130" fill="%2360a5fa" font-family="monospace" font-size="16">Next.js Client</text><text x="70" y="160" fill="%2394a3b8" font-family="monospace" font-size="12">Zustand Store</text><rect x="330" y="80" width="220" height="120" rx="10" fill="%23131c31" stroke="%2310b981" stroke-width="2"/><text x="350" y="130" fill="%2334d399" font-family="monospace" font-size="16">Payload Core</text><text x="350" y="160" fill="%2394a3b8" font-family="monospace" font-size="12">Postgres Neon DB</text><line x1="270" y1="140" x2="330" y2="140" stroke="%2300f0ff" stroke-width="3" stroke-dasharray="4 4"/><text x="30" y="45" fill="%2300ff9d" font-family="monospace" font-size="16">[PROJECT TOOLKIT] SYSTEM TOPOLOGY</text></svg>',
    timestamp: '2026-11-09T14:00:00.000Z',
    type: 'project',
    status: 'structured',
    title: 'Full-Stack Next.js & Payload Architecture',
    details: {
      projectName: 'Full-Stack Developer Portfolio',
      toolkitCategory: 'Architecture',
      projectTags: 'Next.js 16, Payload CMS 3, Neon Postgres',
      projectNotes: 'Decoupled frontend client state paired with local persistent stores.',
    },
  },
]

// Helper function to deduplicate assets array by imageData
function cleanDuplicateAssets(assets: CapturedAsset[]): CapturedAsset[] {
  const seenImages = new Map<string, CapturedAsset>()
  for (const asset of assets) {
    const existing = seenImages.get(asset.imageData)
    if (!existing) {
      seenImages.set(asset.imageData, asset)
    } else {
      // If one of the duplicates is 'structured' and one is 'draft', favor the structured version
      if (asset.status === 'structured' && existing.status === 'draft') {
        seenImages.set(asset.imageData, {
          ...asset,
          id: existing.id, // preserve older stable id
        })
      } else if (existing.status === 'structured') {
        // Keep existing structured, but merge any newer details
        seenImages.set(asset.imageData, {
          ...existing,
          details: {
            ...asset.details,
            ...existing.details,
          },
        })
      }
    }
  }
  return Array.from(seenImages.values())
}

export const useCapturedAssetsStore = create<CapturedAssetsState>()(
  persist(
    (set, get) => ({
      assets: DEMO_ASSETS,
      activeAsset: null,

      addAsset: (assetData) => {
        // PREVENT DUPLICATES: Check if an asset with this exact image already exists
        const existing = get().assets.find((a) => a.imageData === assetData.imageData)
        if (existing) {
          // If already in vault, update data of the SAME card in place
          const updatedCard: CapturedAsset = {
            ...existing,
            ...assetData,
            status: assetData.status || 'structured',
            details: {
              ...existing.details,
              ...assetData.details,
            },
          }
          set((state) => ({
            assets: cleanDuplicateAssets(
              state.assets.map((a) => (a.id === existing.id ? updatedCard : a)),
            ),
          }))
          return updatedCard
        }

        const newAsset: CapturedAsset = {
          ...assetData,
          id: `cap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({
          assets: cleanDuplicateAssets([newAsset, ...state.assets]),
        }))

        // Also buffer in IndexedDB for sync when offline (imageData is base64 — stored as-is)
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          import('@/lib/offlineDB')
            .then(({ offlineSave }) => {
              return offlineSave('drafts', {
                _operation: 'create',
                assetId: newAsset.id,
                type: newAsset.type,
                title: newAsset.title,
                status: newAsset.status,
                imageData: newAsset.imageData,
                details: JSON.stringify(newAsset.details),
                timestamp: newAsset.timestamp,
              })
            })
            .then(() => {
              return import('@/stores/useOfflineStore')
            })
            .then(({ useOfflineStore }) => {
              useOfflineStore.getState().refreshPendingCount()
            })
            .catch(() => {
              // Silent fail — asset is already in localStorage
            })
        }

        return newAsset
      },

      updateAsset: (id, updates) => {
        set((state) => {
          const updated = state.assets.map((asset) =>
            asset.id === id
              ? {
                  ...asset,
                  ...updates,
                  details: {
                    ...asset.details,
                    ...(updates.details || {}),
                  },
                }
              : asset,
          )
          return {
            assets: cleanDuplicateAssets(updated),
          }
        })
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
          activeAsset: state.activeAsset?.id === id ? null : state.activeAsset,
        }))
      },

      setActiveAsset: (asset) => set({ activeAsset: asset }),

      getDraftCount: () => {
        return get().assets.filter((a) => a.status === 'draft').length
      },

      markAsStructured: (id) => {
        set((state) => ({
          assets: cleanDuplicateAssets(
            state.assets.map((asset) =>
              asset.id === id ? { ...asset, status: 'structured' } : asset,
            ),
          ),
        }))
      },

      clearAllDrafts: () => {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.status !== 'draft'),
        }))
      },

      deduplicateAssets: () => {
        set((state) => ({
          assets: cleanDuplicateAssets(state.assets),
        }))
      },
    }),
    {
      name: 'toggle-dawn-captured-assets',
      onRehydrateStorage: () => (state) => {
        if (state?.assets) {
          // Clean any previous duplicates automatically on browser storage load
          state.assets = cleanDuplicateAssets(state.assets)
        }
      },
    },
  ),
)
