/**
 * Cache Service
 * =============
 * High-level read/write cache layer backed by Redis.
 * Provides typed get/set/invalidation with TTL and collection-aware
 * key namespacing.
 *
 * Key format:  td:{collection}:{identifier}
 * List key:    td:{collection}:__list:{hash}
 *
 * All operations are fire-and-forget safe — if Redis is down, every
 * function returns null / resolves silently so the app falls through
 * to PostgreSQL.
 */

import { getRedisClient } from './redis'

// Default TTLs in seconds
export const TTL = {
  /** Single document cache: 5 minutes */
  DOCUMENT: 300,
  /** List / query result cache: 2 minutes */
  LIST: 120,
  /** Dashboard aggregate: 1 minute */
  DASHBOARD: 60,
  /** Long-lived reference data (mission types, categories): 30 minutes */
  REFERENCE: 1800,
  /** Write queue entries: 24 hours (safety expiry) */
  WRITE_QUEUE: 86_400,
} as const

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

function docKey(collection: string, idOrSlug: string | number): string {
  return `${collection}:${idOrSlug}`
}

function listKey(collection: string, queryHash: string): string {
  return `${collection}:__list:${queryHash}`
}

/**
 * Deterministic hash of a query object for list caching.
 * Uses JSON.stringify with sorted keys for consistency.
 */
export function hashQuery(query: Record<string, unknown>): string {
  const sorted = JSON.stringify(query, Object.keys(query).sort())
  // Simple FNV-1a 32-bit hash
  let hash = 0x811c9dc5
  for (let i = 0; i < sorted.length; i++) {
    hash ^= sorted.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
  }
  return hash.toString(36)
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

/**
 * Get a cached document by collection + identifier.
 * Returns parsed JSON or null if miss / Redis unavailable.
 */
export async function cacheGet<T = unknown>(
  collection: string,
  idOrSlug: string | number,
): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const raw = await client.get(docKey(collection, idOrSlug))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/**
 * Get a cached list/query result.
 */
export async function cacheGetList<T = unknown>(
  collection: string,
  query: Record<string, unknown>,
): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const raw = await client.get(listKey(collection, hashQuery(query)))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// SET
// ---------------------------------------------------------------------------

/**
 * Cache a single document.
 */
export async function cacheSet(
  collection: string,
  idOrSlug: string | number,
  data: unknown,
  ttl: number = TTL.DOCUMENT,
): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.set(docKey(collection, idOrSlug), JSON.stringify(data), 'EX', ttl)
  } catch {
    // silent — PostgreSQL is the source of truth
  }
}

/**
 * Cache a list / query result.
 */
export async function cacheSetList(
  collection: string,
  query: Record<string, unknown>,
  data: unknown,
  ttl: number = TTL.LIST,
): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.set(listKey(collection, hashQuery(query)), JSON.stringify(data), 'EX', ttl)
  } catch {
    // silent
  }
}

// ---------------------------------------------------------------------------
// INVALIDATION
// ---------------------------------------------------------------------------

/**
 * Invalidate cache for a specific document (by id AND slug if provided).
 */
export async function cacheInvalidateDoc(
  collection: string,
  id: string | number,
  slug?: string | null,
): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    const keys = [docKey(collection, id)]
    if (slug) {
      keys.push(docKey(collection, slug))
    }
    await client.del(...keys)
  } catch {
    // silent
  }
}

/**
 * Invalidate ALL cached data for a collection (documents + list queries).
 * Uses SCAN to avoid blocking.
 */
export async function cacheInvalidateCollection(collection: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    // The keyPrefix `td:` is auto-prepended by ioredis, so we scan for
    // the collection segment only.
    const pattern = `${collection}:*`
    let cursor = '0'
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = nextCursor
      if (keys.length > 0) {
        // Keys returned by SCAN already include the prefix added by ioredis;
        // since ioredis strips the prefix before sending DEL, pass raw keys
        await client.del(...keys)
      }
    } while (cursor !== '0')
  } catch {
    // silent
  }
}

/**
 * Flush the entire ToggleDawn cache namespace.
 * Use sparingly — e.g., after a full re-seed.
 */
export async function cacheFlushAll(): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', '*', 'COUNT', 200)
      cursor = nextCursor
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } while (cursor !== '0')
  } catch {
    // silent
  }
}
