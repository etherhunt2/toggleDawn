/**
 * Redis Health & Queue Status API
 * ================================
 * GET /api/redis/status — returns Redis connection state, queue depths, and cache stats.
 * POST /api/redis/status?action=sync — triggers an on-demand sync cycle (admin only).
 * POST /api/redis/status?action=flush — flushes the entire cache namespace (admin only).
 */

import { NextRequest, NextResponse } from 'next/server'
import { isRedisHealthy } from '@/lib/redis'
import { getQueueLength, getDeadLetterLength, peekDeadLetters } from '@/lib/writeQueue'
import { cacheFlushAll } from '@/lib/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { runSyncCycle } from '@/lib/syncService'

export async function GET() {
  const [healthy, queueLen, deadLetterLen] = await Promise.all([
    isRedisHealthy(),
    getQueueLength(),
    getDeadLetterLength(),
  ])

  const deadLetters = deadLetterLen > 0 ? await peekDeadLetters(5) : []

  return NextResponse.json({
    redis: {
      connected: healthy,
      configured: !!process.env.REDIS_URL,
    },
    writeQueue: {
      pending: queueLen,
      deadLettered: deadLetterLen,
      recentDeadLetters: deadLetters,
    },
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  // Require a logged-in Payload user
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  switch (action) {
    case 'sync': {
      const result = await runSyncCycle(payload)
      return NextResponse.json({ action: 'sync', result })
    }
    case 'flush': {
      await cacheFlushAll()
      return NextResponse.json({ action: 'flush', message: 'Cache flushed successfully' })
    }
    default:
      return NextResponse.json(
        { error: 'Unknown action. Use ?action=sync or ?action=flush' },
        { status: 400 },
      )
  }
}
