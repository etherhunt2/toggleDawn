/**
 * useOfflineStore — Zustand Store for Offline/Sync State
 * =======================================================
 * Tracks:
 *   - Network online/offline status
 *   - Number of pending (unsynced) records
 *   - Whether a sync is in progress
 *   - Last successful sync timestamp
 *   - Per-collection sync progress during a sync cycle
 *
 * Also exposes:
 *   - syncAll()  — push all pending offline records to Neon via API
 *   - hydrate()  — populate IndexedDB cache from server on first load
 */

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  offlineGetPending,
  offlinePendingCount,
  offlineMarkSynced,
  offlineCacheFromServer,
  deduplicateByRemoteId,
  OFFLINE_COLLECTIONS,
  type OfflineCollection,
  type OfflineRecord,
} from '@/lib/offlineDB'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SyncProgress {
  collection: OfflineCollection
  total: number
  done: number
}

interface OfflineState {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  lastSyncAt: string | null
  syncProgress: SyncProgress | null
  syncErrors: string[]

  // Actions
  setOnline: (online: boolean) => void
  refreshPendingCount: () => Promise<void>
  syncAll: () => Promise<{ synced: number; failed: number }>
  hydrateFromServer: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: 0,
      isSyncing: false,
      lastSyncAt: null,
      syncProgress: null,
      syncErrors: [],

      setOnline: (online: boolean) => {
        set({ isOnline: online })
        if (online && !get().isSyncing) {
          // Auto-trigger sync when coming back online
          void get().syncAll()
        }
      },

      refreshPendingCount: async () => {
        if (typeof window === 'undefined') return
        try {
          const count = await offlinePendingCount()
          set({ pendingCount: count })
        } catch {
          // IDB not available (SSR)
        }
      },

      // -----------------------------------------------------------------------
      // syncAll — push all pending records to Neon via REST API
      // -----------------------------------------------------------------------
      syncAll: async () => {
        if (typeof window === 'undefined') return { synced: 0, failed: 0 }
        if (!get().isOnline) return { synced: 0, failed: 0 }
        if (get().isSyncing) return { synced: 0, failed: 0 }

        set({ isSyncing: true, syncErrors: [] })

        let synced = 0
        let failed = 0
        const errors: string[] = []

        try {
          const pending = await offlineGetPending()

          // Group by collection for progress reporting
          const byCollection = new Map<OfflineCollection, OfflineRecord[]>()
          for (const rec of pending) {
            const list = byCollection.get(rec._collection) ?? []
            list.push(rec)
            byCollection.set(rec._collection, list)
          }

          for (const [collection, rawRecords] of byCollection) {
            // For notes and flash-cards, deduplicate by remote id before syncing
            const records =
              collection === 'notes' || collection === 'flash-cards'
                ? deduplicateByRemoteId(rawRecords)
                : rawRecords

            set({
              syncProgress: { collection, total: records.length, done: 0 },
            })

            for (let i = 0; i < records.length; i++) {
              const rec = records[i]!
              try {
                const result = await pushRecordToServer(collection, rec)
                if (result.ok && rec._localId !== undefined) {
                  await offlineMarkSynced(collection, rec._localId, result.remoteId)
                  synced++
                } else {
                  failed++
                  errors.push(`${collection}: ${result.error ?? 'unknown error'}`)
                }
              } catch (err) {
                failed++
                errors.push(`${collection}: ${err instanceof Error ? err.message : String(err)}`)
              }

              set({
                syncProgress: { collection, total: records.length, done: i + 1 },
              })
            }
          }
        } finally {
          const newPendingCount = await offlinePendingCount()
          set({
            isSyncing: false,
            syncProgress: null,
            pendingCount: newPendingCount,
            lastSyncAt: synced > 0 ? new Date().toISOString() : get().lastSyncAt,
            syncErrors: errors,
          })
        }

        return { synced, failed }
      },

      // -----------------------------------------------------------------------
      // hydrateFromServer — download server data into IndexedDB (read cache)
      // Called once on first authenticated load while online
      // -----------------------------------------------------------------------
      hydrateFromServer: async () => {
        if (typeof window === 'undefined') return
        if (!get().isOnline) return

        try {
        // 'drafts' is a local-only collection (no server endpoint)
          // Fetch all collections in parallel (text fields only)
          await Promise.allSettled(
            OFFLINE_COLLECTIONS.filter((c) => c !== 'drafts').map(async (collection) => {
              try {
                const res = await fetch(
                  `/api/${collection}?limit=500&depth=0`,
                  { credentials: 'include' },
                )
                if (!res.ok) return

                const data = await res.json()
                const docs = data?.docs ?? []
                if (docs.length > 0) {
                  await offlineCacheFromServer(collection, docs)
                }
              } catch {
                // Per-collection fail is non-fatal
              }
            }),
          )

          await get().refreshPendingCount()
        } catch {
          // Hydration fail is non-fatal — app still works online
        }
      },
    }),
    {
      name: 'td-offline-store',
      // Only persist metadata, not the full data (IDB holds the data)
      partialize: (state) => ({
        lastSyncAt: state.lastSyncAt,
        pendingCount: state.pendingCount,
      }),
    },
  ),
)

// ---------------------------------------------------------------------------
// Push one offline record to Neon via Payload REST API
// Handles create (POST), update (PATCH) and delete (DELETE) operations.
// ---------------------------------------------------------------------------
async function pushRecordToServer(
  collection: OfflineCollection,
  rec: OfflineRecord,
): Promise<{ ok: boolean; remoteId: string | number; error?: string }> {
  // Strip internal offline fields before sending to server
  const {
    _localId: _l,
    _collection: _c,
    _syncStatus: _s,
    _createdAt: _ca,
    _syncedAt: _sa,
    _remoteId: _ri,
    _operation,
    _operationAt: _oa,
    _targetRemoteId,
    ...payload
  } = rec

  // Determine effective operation (default to 'create' for backward compat)
  const operation = _operation ?? 'create'

  try {
    // ---- DELETE tombstone ----
    if (operation === 'delete') {
      if (_targetRemoteId == null) {
        return { ok: false, remoteId: 0, error: 'delete op missing _targetRemoteId' }
      }
      const res = await fetch(`/api/${collection}/${_targetRemoteId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        return {
          ok: false,
          remoteId: 0,
          error: errData?.errors?.[0]?.message ?? `HTTP ${res.status}`,
        }
      }
      // For deletes, return the target remote id as the "remoteId" for markSynced
      return { ok: true, remoteId: _targetRemoteId }
    }

    // ---- UPDATE (PATCH) ----
    if (operation === 'update') {
      if (_targetRemoteId == null) {
        return { ok: false, remoteId: 0, error: 'update op missing _targetRemoteId' }
      }
      const res = await fetch(`/api/${collection}/${_targetRemoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        return {
          ok: false,
          remoteId: 0,
          error: errData?.errors?.[0]?.message ?? `HTTP ${res.status}`,
        }
      }
      const data = await res.json()
      return { ok: true, remoteId: data?.doc?.id ?? data?.id ?? _targetRemoteId }
    }

    // ---- CREATE (POST) — default ----
    const res = await fetch(`/api/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        // Preserve original creation timestamp from offline record
        createdAt: _ca,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return {
        ok: false,
        remoteId: 0,
        error: errData?.errors?.[0]?.message ?? `HTTP ${res.status}`,
      }
    }

    const data = await res.json()
    return { ok: true, remoteId: data?.doc?.id ?? data?.id ?? 0 }
  } catch (err) {
    return {
      ok: false,
      remoteId: 0,
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}
