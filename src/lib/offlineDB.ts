/**
 * offlineDB.ts — IndexedDB Client-Side Offline Database
 * =====================================================
 * Uses the `idb` library to provide a typed, promise-based IndexedDB
 * for offline-first data storage in the browser.
 *
 * Database name: toggledawn-offline-v1
 * Object stores (one per collection, text/JSON only — no media):
 *   projects | missions | mission-types | mission-planners
 *   books | chapters | notes | flash-cards
 *   time-logs | test-scores | habits | schedules | categories | drafts
 *
 * Each record shape:
 *   { _localId, _collection, _syncStatus, _createdAt, _syncedAt, ...data }
 *
 * _syncStatus values:
 *   'synced'   — exists in Neon, local copy is up-to-date (read cache)
 *   'pending'  — created offline, NOT yet in Neon
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

// ---------------------------------------------------------------------------
// All collection slugs we cache offline
// ---------------------------------------------------------------------------
export const OFFLINE_COLLECTIONS = [
  'projects',
  'missions',
  'mission-types',
  'mission-planners',
  'books',
  'chapters',
  'notes',
  'flash-cards',
  'time-logs',
  'test-scores',
  'habits',
  'schedules',
  'categories',
  'drafts',
] as const

export type OfflineCollection = (typeof OFFLINE_COLLECTIONS)[number]

// ---------------------------------------------------------------------------
// Record shape stored in IndexedDB
// ---------------------------------------------------------------------------
export interface OfflineRecord {
  /** Local auto-incremented key (IDB keyPath) */
  _localId?: number
  /** Payload CMS document id (null if pending — not yet synced) */
  _remoteId?: string | number | null
  /** Which collection this belongs to */
  _collection: OfflineCollection
  /** 'synced' = from server | 'pending' = created offline */
  _syncStatus: 'synced' | 'pending'
  /** ISO timestamp when this record was created locally */
  _createdAt: string
  /** ISO timestamp when last synced to Neon (null if never) */
  _syncedAt: string | null
  /** Operation type — defaults to 'create' for backward compat */
  _operation: 'create' | 'update' | 'delete'
  /** ISO timestamp of THIS specific operation (for "latest wins" dedup) */
  _operationAt: string
  /** For update/delete: the Neon remote id being modified */
  _targetRemoteId?: string | number | null
  /** The actual document data (all text fields, no File/Blob) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// ---------------------------------------------------------------------------
// IDB Schema
// ---------------------------------------------------------------------------
type StoreEntry = { key: number; value: OfflineRecord; indexes: { '_remoteId': string | number; '_syncStatus': string } }

interface ToggleDawnOfflineDB extends DBSchema {
  'projects': StoreEntry
  'missions': StoreEntry
  'mission-types': StoreEntry
  'mission-planners': StoreEntry
  'books': StoreEntry
  'chapters': StoreEntry
  'notes': StoreEntry
  'flash-cards': StoreEntry
  'time-logs': StoreEntry
  'test-scores': StoreEntry
  'habits': StoreEntry
  'schedules': StoreEntry
  'categories': StoreEntry
  'drafts': StoreEntry
}

const DB_NAME = 'toggledawn-offline-v1'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<ToggleDawnOfflineDB>> | null = null

function getDB(): Promise<IDBPDatabase<ToggleDawnOfflineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ToggleDawnOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const col of OFFLINE_COLLECTIONS) {
          if (!db.objectStoreNames.contains(col)) {
            const store = db.createObjectStore(col, {
              keyPath: '_localId',
              autoIncrement: true,
            })
            store.createIndex('_remoteId', '_remoteId', { unique: false })
            store.createIndex('_syncStatus', '_syncStatus', { unique: false })
          }
        }
      },
    })
  }
  return dbPromise
}

// ---------------------------------------------------------------------------
// WRITE — save a new locally-created record (pending sync)
// ---------------------------------------------------------------------------
export async function offlineSave(
  collection: OfflineCollection,
  data: Record<string, unknown>,
): Promise<number> {
  const db = await getDB()
  const now = new Date().toISOString()
  const record: OfflineRecord = {
    ...data,
    _collection: collection,
    _syncStatus: 'pending',
    _createdAt: now,
    _syncedAt: null,
    _remoteId: null,
    _operation: 'create',
    _operationAt: now,
  }
  const localId = await db.add(collection, record as never)
  return localId as number
}

// ---------------------------------------------------------------------------
// WRITE — save an UPDATE operation offline (for Notes, FlashCards)
// ---------------------------------------------------------------------------
export async function offlineUpdate(
  collection: OfflineCollection,
  targetRemoteId: string | number,
  data: Record<string, unknown>,
): Promise<number> {
  const db = await getDB()
  const now = new Date().toISOString()
  const record: OfflineRecord = {
    ...data,
    _collection: collection,
    _syncStatus: 'pending',
    _createdAt: now,
    _syncedAt: null,
    _remoteId: null,
    _operation: 'update',
    _operationAt: now,
    _targetRemoteId: targetRemoteId,
  }
  const localId = await db.add(collection, record as never)
  return localId as number
}

// ---------------------------------------------------------------------------
// WRITE — save a DELETE tombstone offline
// ---------------------------------------------------------------------------
export async function offlineDeleteOp(
  collection: OfflineCollection,
  targetRemoteId: string | number,
): Promise<number> {
  const db = await getDB()
  const now = new Date().toISOString()
  const record: OfflineRecord = {
    _collection: collection,
    _syncStatus: 'pending',
    _createdAt: now,
    _syncedAt: null,
    _remoteId: null,
    _operation: 'delete',
    _operationAt: now,
    _targetRemoteId: targetRemoteId,
  }
  const localId = await db.add(collection, record as never)
  return localId as number
}

// ---------------------------------------------------------------------------
// WRITE — populate cache with server data (synced records)
// ---------------------------------------------------------------------------
export async function offlineCacheFromServer(
  collection: OfflineCollection,
  docs: Record<string, unknown>[],
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(collection, 'readwrite')

  for (const doc of docs) {
    // Check if we already have this remoteId cached
    const remoteId = doc.id as string | number
    const existing = await tx.store.index('_remoteId').getAll(remoteId as never)

    const now = new Date().toISOString()
    const record: OfflineRecord = {
      ...stripMediaFields(doc),
      _collection: collection,
      _syncStatus: 'synced',
      _createdAt: (doc.createdAt as string) || now,
      _syncedAt: now,
      _remoteId: remoteId,
      _operation: 'create',
      _operationAt: (doc.createdAt as string) || now,
    }

    if (existing.length > 0 && existing[0]._localId !== undefined) {
      // Update existing cache record
      await tx.store.put({ ...record, _localId: existing[0]._localId } as never)
    } else {
      await tx.store.add(record as never)
    }
  }

  await tx.done
}

// ---------------------------------------------------------------------------
// READ — all records for a collection
// ---------------------------------------------------------------------------
export async function offlineGetAll(collection: OfflineCollection): Promise<OfflineRecord[]> {
  const db = await getDB()
  return db.getAll(collection) as Promise<OfflineRecord[]>
}

// ---------------------------------------------------------------------------
// READ — only pending (not yet synced) records
// ---------------------------------------------------------------------------
export async function offlineGetPending(collection?: OfflineCollection): Promise<OfflineRecord[]> {
  const db = await getDB()
  const cols = collection ? [collection] : OFFLINE_COLLECTIONS
  const results: OfflineRecord[] = []

  for (const col of cols) {
    const pending = await (db.getAllFromIndex(col, '_syncStatus', 'pending') as Promise<OfflineRecord[]>)
    results.push(...pending)
  }

  return results.sort((a, b) => a._createdAt.localeCompare(b._createdAt))
}

// ---------------------------------------------------------------------------
// READ — only pending records for one specific collection
// ---------------------------------------------------------------------------
export async function offlineGetPendingForCollection(
  collection: OfflineCollection,
): Promise<OfflineRecord[]> {
  const db = await getDB()
  const pending = await (db.getAllFromIndex(collection, '_syncStatus', 'pending') as Promise<OfflineRecord[]>)
  return pending.sort((a, b) => a._createdAt.localeCompare(b._createdAt))
}

// ---------------------------------------------------------------------------
// DEDUP — for records sharing same (_collection, _targetRemoteId),
// keep only the one with the latest _operationAt. Used before syncing.
// Records without a _targetRemoteId (pure creates) are always kept as-is.
// ---------------------------------------------------------------------------
export function deduplicateByRemoteId(records: OfflineRecord[]): OfflineRecord[] {
  const latestByTarget = new Map<string, OfflineRecord>()
  const noTarget: OfflineRecord[] = []

  for (const rec of records) {
    if (rec._targetRemoteId == null) {
      // Plain create with no target remote id — keep all
      noTarget.push(rec)
      continue
    }
    // Key = collection + targetRemoteId to avoid cross-collection conflicts
    const key = `${rec._collection}::${rec._targetRemoteId}`
    const existing = latestByTarget.get(key)
    if (!existing || rec._operationAt > existing._operationAt) {
      latestByTarget.set(key, rec)
    }
  }

  return [...noTarget, ...latestByTarget.values()]
}

// ---------------------------------------------------------------------------
// UPDATE — mark a pending record as synced after upload
// ---------------------------------------------------------------------------
export async function offlineMarkSynced(
  collection: OfflineCollection,
  localId: number,
  remoteId: string | number,
): Promise<void> {
  const db = await getDB()
  const record = await db.get(collection, localId) as OfflineRecord | undefined
  if (!record) return
  record._syncStatus = 'synced'
  record._remoteId = remoteId
  record._syncedAt = new Date().toISOString()
  await db.put(collection, record as never)
}

// ---------------------------------------------------------------------------
// DELETE — remove a cached record (after full sync or cache expiry)
// ---------------------------------------------------------------------------
export async function offlineDelete(collection: OfflineCollection, localId: number): Promise<void> {
  const db = await getDB()
  await db.delete(collection, localId)
}

// ---------------------------------------------------------------------------
// CLEAR — wipe all synced (not pending) records for a collection
// (keeps pending so we don't lose unsent data)
// ---------------------------------------------------------------------------
export async function offlineClearSynced(collection: OfflineCollection): Promise<void> {
  const db = await getDB()
  const all = await db.getAll(collection) as OfflineRecord[]
  const tx = db.transaction(collection, 'readwrite')
  for (const rec of all) {
    if (rec._syncStatus === 'synced' && rec._localId !== undefined) {
      await tx.store.delete(rec._localId)
    }
  }
  await tx.done
}

// ---------------------------------------------------------------------------
// PENDING COUNT — total unsent records across all collections
// ---------------------------------------------------------------------------
export async function offlinePendingCount(): Promise<number> {
  const pending = await offlineGetPending()
  return pending.length
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Remove any fields that are media/File objects — only store text/JSON.
 * Images are replaced with their alt text if available.
 */
function stripMediaFields(doc: Record<string, unknown>): Record<string, unknown> {
  const stripped: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(doc)) {
    if (val === null || val === undefined) {
      stripped[key] = val
    } else if (val instanceof Blob || val instanceof File) {
      // Skip binary data entirely
      continue
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      const obj = val as Record<string, unknown>
      // If it looks like a media object (has url + mimeType), replace with alt text
      if (obj.url && obj.mimeType) {
        stripped[key] = obj.alt || obj.filename || '[media]'
      } else {
        stripped[key] = stripMediaFields(obj)
      }
    } else if (Array.isArray(val)) {
      stripped[key] = val.map((item) =>
        typeof item === 'object' && item !== null ? stripMediaFields(item as Record<string, unknown>) : item
      )
    } else {
      stripped[key] = val
    }
  }
  return stripped
}
