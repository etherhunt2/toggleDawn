/**
 * Write-Behind Queue
 * ==================
 * Buffers write operations in Redis when PostgreSQL (Neon) is slow or
 * unreachable. Writes are stored as a Redis List ("td:__writeQueue") and
 * flushed to the database by the sync service.
 *
 * Each entry is a JSON object describing the intended Payload CMS operation:
 *   { op, collection, id?, data, createdAt, retries, lastError? }
 *
 * Flow:
 *   1. Payload hook detects DB write failure (timeout / network error)
 *   2. Hook calls `enqueueWrite()` to push the operation into Redis
 *   3. SyncService periodically calls `dequeueWrites()` and replays them
 *   4. Failed replays are re-enqueued with incremented retry counter
 */

import { getRedisClient } from './redis'
import { TTL } from './cache'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WriteOp = 'create' | 'update' | 'delete'

export interface QueuedWrite {
  /** Payload operation */
  op: WriteOp
  /** Payload collection slug */
  collection: string
  /** Document ID (required for update/delete) */
  id?: string | number
  /** Document data (not needed for delete) */
  data?: Record<string, unknown>
  /** ISO timestamp when the write was first enqueued */
  createdAt: string
  /** How many times we've tried to replay this write */
  retries: number
  /** Last error message on failed replay */
  lastError?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUEUE_KEY = '__writeQueue'
const DEAD_LETTER_KEY = '__writeQueue:dead'
const MAX_RETRIES = 5

// ---------------------------------------------------------------------------
// Enqueue
// ---------------------------------------------------------------------------

/**
 * Push a write operation onto the queue.
 * Returns true if enqueued successfully, false if Redis is unavailable.
 */
export async function enqueueWrite(
  op: WriteOp,
  collection: string,
  data?: Record<string, unknown>,
  id?: string | number,
): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  const entry: QueuedWrite = {
    op,
    collection,
    id,
    data,
    createdAt: new Date().toISOString(),
    retries: 0,
  }

  try {
    await client.rpush(QUEUE_KEY, JSON.stringify(entry))
    // Safety expiry so orphaned queues don't grow forever
    await client.expire(QUEUE_KEY, TTL.WRITE_QUEUE)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Dequeue
// ---------------------------------------------------------------------------

/**
 * Pop up to `batchSize` entries from the front of the queue.
 * Uses LPOP to guarantee FIFO ordering.
 */
export async function dequeueWrites(batchSize: number = 10): Promise<QueuedWrite[]> {
  const client = getRedisClient()
  if (!client) return []

  const entries: QueuedWrite[] = []
  try {
    for (let i = 0; i < batchSize; i++) {
      const raw = await client.lpop(QUEUE_KEY)
      if (!raw) break
      entries.push(JSON.parse(raw) as QueuedWrite)
    }
  } catch {
    // partial results are fine
  }
  return entries
}

// ---------------------------------------------------------------------------
// Re-enqueue failed writes
// ---------------------------------------------------------------------------

/**
 * Push a failed write back onto the queue with incremented retry counter.
 * If the write has exceeded MAX_RETRIES, move it to the dead-letter queue.
 */
export async function reEnqueueWrite(entry: QueuedWrite, error: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  entry.retries += 1
  entry.lastError = error

  try {
    if (entry.retries >= MAX_RETRIES) {
      // Dead-letter: preserved for manual inspection
      await client.rpush(DEAD_LETTER_KEY, JSON.stringify(entry))
      console.error(
        `[WriteQueue] Dead-lettered after ${MAX_RETRIES} retries:`,
        entry.collection,
        entry.op,
        entry.id,
      )
    } else {
      // Re-enqueue for next sync cycle
      await client.rpush(QUEUE_KEY, JSON.stringify(entry))
    }
  } catch {
    console.error('[WriteQueue] Failed to re-enqueue:', entry)
  }
}

// ---------------------------------------------------------------------------
// Inspection helpers
// ---------------------------------------------------------------------------

/**
 * Returns the current length of the write queue.
 */
export async function getQueueLength(): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0

  try {
    return await client.llen(QUEUE_KEY)
  } catch {
    return 0
  }
}

/**
 * Returns the current length of the dead-letter queue.
 */
export async function getDeadLetterLength(): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0

  try {
    return await client.llen(DEAD_LETTER_KEY)
  } catch {
    return 0
  }
}

/**
 * Peek at the dead-letter queue without removing entries.
 */
export async function peekDeadLetters(count: number = 20): Promise<QueuedWrite[]> {
  const client = getRedisClient()
  if (!client) return []

  try {
    const raw = await client.lrange(DEAD_LETTER_KEY, 0, count - 1)
    return raw.map((r) => JSON.parse(r) as QueuedWrite)
  } catch {
    return []
  }
}
