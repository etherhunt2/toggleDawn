/**
 * src/lib — ToggleDawn Server-Side Utilities
 * ===========================================
 * Barrel export for the Redis / cache / sync infrastructure.
 *
 * Import from '@/lib' or specific modules as needed.
 */

// Redis client singleton
export { getRedisClient, isRedisHealthy, disconnectRedis } from './redis'

// Cache service (get / set / invalidate)
export {
  cacheGet,
  cacheGetList,
  cacheSet,
  cacheSetList,
  cacheInvalidateDoc,
  cacheInvalidateCollection,
  cacheFlushAll,
  hashQuery,
  TTL,
} from './cache'

// Write-behind queue
export {
  enqueueWrite,
  dequeueWrites,
  reEnqueueWrite,
  getQueueLength,
  getDeadLetterLength,
  peekDeadLetters,
} from './writeQueue'

// Sync service
export { runSyncCycle, createSyncTask } from './syncService'

// Payload collection hook wrappers
export { withCacheHooks, CacheTTL } from './payloadCacheHooks'
