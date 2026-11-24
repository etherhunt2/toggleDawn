/**
 * Redis Client Singleton
 * ======================
 * Provides a lazy-initialized, reconnection-aware Redis client using ioredis.
 * Falls back gracefully when REDIS_URL is not set or Redis is unavailable —
 * the app always continues to work against PostgreSQL directly.
 */

import Redis from 'ioredis'

let redisClient: Redis | null = null
let connectionFailed = false
let lastFailTime = 0
const RETRY_BACKOFF_MS = 30_000 // retry connection every 30s after failure

/**
 * Returns the shared Redis client instance, or null if Redis is unavailable.
 * Safe to call repeatedly — creates the client once and caches it.
 */
export function getRedisClient(): Redis | null {
  const url = process.env.REDIS_URL

  if (!url) {
    // No Redis configured — silent no-op
    return null
  }

  // If a previous connection attempt failed recently, don't retry too fast
  if (connectionFailed && Date.now() - lastFailTime < RETRY_BACKOFF_MS) {
    return null
  }

  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        // Exponential backoff: 200ms, 400ms, 800ms, ... up to 10s
        const delay = Math.min(times * 200, 10_000)
        return delay
      },
      reconnectOnError(err: Error) {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT']
        return targetErrors.some((e) => err.message.includes(e))
      },
      lazyConnect: false,
      connectTimeout: 5000,
      // Key prefix for ToggleDawn namespace isolation
      keyPrefix: 'td:',
    })

    redisClient.on('error', (err: Error) => {
      console.warn('[Redis] Connection error:', err.message)
      connectionFailed = true
      lastFailTime = Date.now()
    })

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully')
      connectionFailed = false
    })

    redisClient.on('close', () => {
      console.log('[Redis] Connection closed')
    })

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...')
    })

    return redisClient
  } catch (err) {
    console.warn('[Redis] Failed to create client:', err)
    connectionFailed = true
    lastFailTime = Date.now()
    redisClient = null
    return null
  }
}

/**
 * Check if Redis is currently connected and responsive.
 */
export async function isRedisHealthy(): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    const pong = await client.ping()
    return pong === 'PONG'
  } catch {
    return false
  }
}

/**
 * Gracefully disconnect Redis (for clean shutdown).
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    connectionFailed = false
  }
}
