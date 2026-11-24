/**
 * Sync Service
 * ============
 * Reconciles queued writes from Redis back to PostgreSQL via Payload CMS.
 *
 * The service runs as:
 *   - A periodic Payload Jobs task that calls `runSyncCycle()`
 *   - Or on-demand via the /api/redis/status?action=sync endpoint
 *
 * Each cycle:
 *   1. Dequeues a batch of writes from Redis
 *   2. Replays each write through Payload's Local API
 *   3. Failed writes are re-enqueued with backoff
 *   4. Successful writes invalidate the relevant cache keys
 */

import type { BasePayload, PayloadRequest } from 'payload'
import { dequeueWrites, reEnqueueWrite, getQueueLength, type QueuedWrite } from './writeQueue'
import { cacheInvalidateDoc, cacheInvalidateCollection } from './cache'
import { isRedisHealthy } from './redis'

// ---------------------------------------------------------------------------
// Sync cycle
// ---------------------------------------------------------------------------

export interface SyncResult {
  processed: number
  succeeded: number
  failed: number
  remaining: number
}

/**
 * Run one sync cycle: dequeue writes and replay them through Payload.
 *
 * @param payload - The Payload (BasePayload) instance
 * @param batchSize - Max writes to process per cycle (default 10)
 */
export async function runSyncCycle(
  payload: BasePayload,
  batchSize: number = 10,
): Promise<SyncResult> {
  const healthy = await isRedisHealthy()
  if (!healthy) {
    return { processed: 0, succeeded: 0, failed: 0, remaining: 0 }
  }

  const writes = await dequeueWrites(batchSize)
  let succeeded = 0
  let failed = 0

  for (const entry of writes) {
    try {
      await replayWrite(payload, entry)
      succeeded++

      // Invalidate cache after successful DB write
      if (entry.id) {
        await cacheInvalidateDoc(entry.collection, entry.id)
      } else {
        await cacheInvalidateCollection(entry.collection)
      }
    } catch (err) {
      failed++
      const errorMsg = err instanceof Error ? err.message : String(err)
      await reEnqueueWrite(entry, errorMsg)
    }
  }

  const remaining = await getQueueLength()

  if (writes.length > 0) {
    console.log(
      `[SyncService] Cycle complete: ${succeeded} succeeded, ${failed} failed, ${remaining} remaining`,
    )
  }

  return { processed: writes.length, succeeded, failed, remaining }
}

// ---------------------------------------------------------------------------
// Replay a single write
// ---------------------------------------------------------------------------

async function replayWrite(payload: BasePayload, entry: QueuedWrite): Promise<void> {
  switch (entry.op) {
    case 'create':
      await payload.create({
        collection: entry.collection as never,
        data: (entry.data || {}) as never,
      })
      break

    case 'update':
      if (!entry.id) throw new Error('Update requires an id')
      await payload.update({
        collection: entry.collection as never,
        id: entry.id,
        data: (entry.data || {}) as never,
      })
      break

    case 'delete':
      if (!entry.id) throw new Error('Delete requires an id')
      await payload.delete({
        collection: entry.collection as never,
        id: entry.id,
      })
      break

    default:
      throw new Error(`Unknown write operation: ${entry.op}`)
  }
}

// ---------------------------------------------------------------------------
// Payload Jobs task configuration
// ---------------------------------------------------------------------------

/**
 * Creates the Payload Jobs task configuration for periodic Redis sync.
 * Register this in payload.config.ts → jobs.tasks
 *
 * The task runs via Payload's job queue — trigger it by queuing a job
 * with slug 'redis-sync', or schedule it via the jobs autorun config.
 */
export function createSyncTask() {
  return {
    slug: 'redis-sync',
    label: 'Redis Write-Behind Sync',
    handler: async ({ req }: { req: PayloadRequest }) => {
      const result = await runSyncCycle(req.payload)
      return {
        output: {
          processed: result.processed,
          succeeded: result.succeeded,
          failed: result.failed,
          remaining: result.remaining,
        },
        state: 'succeeded' as const,
      }
    },
    outputSchema: [
      { name: 'processed', type: 'number' as const },
      { name: 'succeeded', type: 'number' as const },
      { name: 'failed', type: 'number' as const },
      { name: 'remaining', type: 'number' as const },
    ],
  }
}

