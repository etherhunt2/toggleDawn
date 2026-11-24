/**
 * Payload Cache Hooks
 * ===================
 * Drop-in Payload CMS collection hooks that integrate the Redis cache layer.
 *
 * Usage in a collection config:
 *   import { withCacheHooks } from '@/lib/payloadCacheHooks'
 *
 *   const MyCollection: CollectionConfig = {
 *     slug: 'my-collection',
 *     hooks: withCacheHooks('my-collection', {
 *       // your existing hooks here
 *       beforeChange: [myCustomHook],
 *     }),
 *     ...
 *   }
 *
 * What it does:
 *   - afterRead: populates cache with the returned document
 *   - afterChange: invalidates the doc + collection list caches
 *   - afterDelete: invalidates the doc + collection list caches
 */

import type { CollectionConfig } from 'payload'
import { cacheSet, cacheInvalidateDoc, cacheInvalidateCollection, TTL } from './cache'

type Hooks = CollectionConfig['hooks']

/**
 * Wraps existing hooks with cache read/write/invalidation logic.
 * Existing hooks are preserved — cache hooks are appended.
 *
 * @param collectionSlug - The Payload collection slug
 * @param existingHooks - Any hooks already defined on the collection
 * @param ttl - Cache TTL in seconds (default: TTL.DOCUMENT)
 */
export function withCacheHooks(
  collectionSlug: string,
  existingHooks: Hooks = {},
  ttl: number = TTL.DOCUMENT,
): Hooks {
  const afterRead = [...(existingHooks?.afterRead || [])]
  const afterChange = [...(existingHooks?.afterChange || [])]
  const afterDelete = [...(existingHooks?.afterDelete || [])]

  // -------------------------------------------------------------------------
  // afterRead — cache the document
  // -------------------------------------------------------------------------
  afterRead.push(async ({ doc }) => {
    if (doc?.id) {
      // Fire-and-forget: don't block the response
      void cacheSet(collectionSlug, doc.id, doc, ttl)

      // Also cache by slug if present
      if (doc.slug) {
        void cacheSet(collectionSlug, doc.slug, doc, ttl)
      }
    }
    return doc
  })

  // -------------------------------------------------------------------------
  // afterChange — invalidate on create/update
  // -------------------------------------------------------------------------
  afterChange.push(async ({ doc, previousDoc }) => {
    if (doc?.id) {
      // Invalidate old slug if it changed
      const oldSlug = previousDoc?.slug
      const newSlug = doc.slug

      await cacheInvalidateDoc(collectionSlug, doc.id, oldSlug || newSlug)
      if (newSlug && newSlug !== oldSlug) {
        await cacheInvalidateDoc(collectionSlug, doc.id, newSlug)
      }

      // Invalidate list caches for this collection
      await cacheInvalidateCollection(collectionSlug)
    }
    return doc
  })

  // -------------------------------------------------------------------------
  // afterDelete — invalidate on delete
  // -------------------------------------------------------------------------
  afterDelete.push(async ({ doc }) => {
    if (doc?.id) {
      await cacheInvalidateDoc(collectionSlug, doc.id, doc.slug)
      await cacheInvalidateCollection(collectionSlug)
    }
    return doc
  })

  return {
    ...existingHooks,
    afterRead,
    afterChange,
    afterDelete,
  }
}

/**
 * Pre-configured TTL presets for different collection types.
 */
export const CacheTTL = {
  /** Fast-changing data: projects, missions, time-logs */
  ACTIVE: TTL.DOCUMENT,
  /** Slow-changing reference data: mission types, categories */
  REFERENCE: TTL.REFERENCE,
  /** Dashboard aggregates */
  DASHBOARD: TTL.DASHBOARD,
} as const
