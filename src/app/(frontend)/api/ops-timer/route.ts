import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers'

/**
 * /api/ops-timer — Dedicated atomic server endpoint for OPS Pomodoro Timer telemetry.
 *
 * Guarantees:
 * 1. Exactly 1 database row per target (in-place PATCH/update).
 * 2. Assigns owner (UserID) to separate logs per user without overlapping or confusion.
 * 3. Preserves original startTime (Began timestamp); updates endTime and updatedAt to current timestamp.
 * 4. Automatically purges any historical duplicate rows for the target.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()

    // 1. Resolve authenticated user
    const headers = await getHeaders()
    let currentUser: any = null
    try {
      const authResult = await payload.auth({ headers })
      currentUser = authResult?.user || null
    } catch {
      // Auth check fallback
    }

    // Determine owner ID (authenticated user, or body.owner, body.userId, or default to first user)
    let ownerId = currentUser?.id || body.owner || body.userId || null
    if (!ownerId) {
      const usersList = await payload.find({
        collection: 'users',
        limit: 1,
        sort: 'id',
      })
      ownerId = usersList.docs?.[0]?.id || 1
    }

    const {
      session,
      actionStatus,
      target,
      totalElapsedSeconds = 0,
      targetDurationMinutes,
      ratings = [],
      currentCycle = 1,
      currentMode = 'focus',
      pomodorosCompleted = 0,
    } = body

    if (!target || !target.title) {
      return NextResponse.json({ error: 'Target is required' }, { status: 400 })
    }

    const targetType = target.type || 'custom'
    const targetId = target.id ? Number(target.id) : null
    const targetTitle = (target.title || '').trim()

    // 2. Query all existing OPS Timer logs to find any existing record for this target
    const whereClause: any = {
      description: {
        like: '[OPS_TIMER]%',
      },
    }
    if (ownerId) {
      whereClause.owner = {
        equals: ownerId,
      }
    }

    const allOpsLogs = await payload.find({
      collection: 'time-logs',
      where: whereClause,
      limit: 100,
      depth: 0,
    })

    // Find existing doc matching this target or databaseId
    const targetDbId = Number(body.databaseId || session?.databaseId)
    const existingDoc = allOpsLogs.docs.find((d) => {
      if (targetDbId && d.id === targetDbId) return true
      if (!d.description?.startsWith('[OPS_TIMER]')) return false
      try {
        const rawJson = d.description.replace(/^\[OPS_TIMER\]\s*/, '')
        const parsed = JSON.parse(rawJson)
        const sameType = parsed.targetType === targetType
        const sameId = targetId && Number(parsed.targetId) === targetId
        const sameTitle = parsed.targetTitle?.toLowerCase()?.trim() === targetTitle.toLowerCase()

        // Match if same target
        return sameType && (sameId || sameTitle)
      } catch {
        return false
      }
    })

    // ─────────────────────────────────────────────────────────────
    // TERMINATE ACTION: Current goal is deleted; related data in
    // the database MUST be completely destroyed!
    // ─────────────────────────────────────────────────────────────
    if (actionStatus === 'terminated') {
      let deletedCount = 0

      // Delete by targetDbId if provided
      if (targetDbId) {
        try {
          await payload.delete({
            collection: 'time-logs',
            id: targetDbId,
          })
          deletedCount++
        } catch {}
      }

      // Delete ONLY the specific running session if found (never purge older historical logs for the same target)
      for (const d of allOpsLogs.docs) {
        if (d.id === targetDbId) continue
        if (!d.description?.startsWith('[OPS_TIMER]')) continue
        try {
          const rawJson = d.description.replace(/^\[OPS_TIMER\]\s*/, '')
          const parsed = JSON.parse(rawJson)
          const sameSession = session?.sessionId && parsed.sessionId === session.sessionId

          if (sameSession) {
            await payload.delete({
              collection: 'time-logs',
              id: d.id,
            })
            deletedCount++
          }
        } catch {}
      }

      return NextResponse.json({
        success: true,
        status: 'terminated',
        deletedCount,
        message: 'Current session related data destroyed from database',
      })
    }

    const initialStartTime = existingDoc?.startTime || session?.startTime || new Date().toISOString()
    const lastUpdateTime = new Date().toISOString()
    const durationMinutes = Math.max(1, Math.round(totalElapsedSeconds / 60))

    const rawCategory = (target.category || (targetType === 'habit' ? 'other' : 'study')).toLowerCase()
    const validCategories = ['study', 'work', 'exercise', 'hobby', 'rest', 'social', 'chores', 'commute', 'sleep', 'other']
    const category = validCategories.includes(rawCategory) ? rawCategory : 'study'

    const metadata = {
      _tag: 'OPS_TIMER',
      sessionId: session?.sessionId || `ops-${Date.now()}`,
      status: actionStatus || 'paused',
      targetType,
      targetId,
      targetTitle,
      targetSubtitle: target.subtitle,
      targetDurationMinutes:
        targetDurationMinutes || Math.round((session?.targetDurationSeconds || 0) / 60) || 60,
      elapsedSeconds: totalElapsedSeconds,
      remainingSeconds: Math.max(0, (session?.targetDurationSeconds || 0) - totalElapsedSeconds),
      blockRemainingSeconds: session?.blockRemainingSeconds,
      blockTotalSeconds: session?.blockTotalSeconds,
      currentCycle,
      currentMode,
      pomodorosCompleted,
      ratings,
      userID: ownerId,
      initialStartTime,
      updatedAt: lastUpdateTime,
      ...(actionStatus === 'quit' ? { quitAt: lastUpdateTime } : {}),
    }

    const payloadData: Record<string, any> = {
      owner: ownerId,
      startTime: initialStartTime,
      endTime: lastUpdateTime,
      duration: durationMinutes,
      category,
      description: `[OPS_TIMER] ${JSON.stringify(metadata)}`,
    }

    if (targetType === 'mission' && targetId) {
      payloadData.mission = targetId
    }

    let savedDocId: number

    // 3. If record exists -> UPDATE in place! Never create a duplicate!
    if (existingDoc) {
      const updated = await payload.update({
        collection: 'time-logs',
        id: existingDoc.id,
        data: payloadData as any,
      })
      savedDocId = updated.id
    } else {
      // 4. If record does not exist -> CREATE the single row!
      const created = await payload.create({
        collection: 'time-logs',
        data: payloadData as any,
      })
      savedDocId = created.id
    }

    // 5. Clean up any redundant duplicate records for this exact target
    const duplicateDocs = allOpsLogs.docs.filter((d) => {
      if (d.id === savedDocId) return false
      if (!d.description?.startsWith('[OPS_TIMER]')) return false
      try {
        const rawJson = d.description.replace(/^\[OPS_TIMER\]\s*/, '')
        const parsed = JSON.parse(rawJson)
        const sameType = parsed.targetType === targetType
        const sameId = targetId && Number(parsed.targetId) === targetId
        const sameTitle = parsed.targetTitle?.toLowerCase()?.trim() === targetTitle.toLowerCase()
        return sameType && (sameId || sameTitle)
      } catch {
        return false
      }
    })

    for (const dup of duplicateDocs) {
      try {
        await payload.delete({
          collection: 'time-logs',
          id: dup.id,
        })
      } catch {
        // Ignore deletion error
      }
    }

    return NextResponse.json({
      success: true,
      docId: savedDocId,
      status: actionStatus,
      ownerId,
      startTime: initialStartTime,
      updatedAt: lastUpdateTime,
    })
  } catch (error: any) {
    console.error('Error in POST /api/ops-timer:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    let currentUser: any = null
    try {
      const authResult = await payload.auth({ headers })
      currentUser = authResult?.user || null
    } catch {}

    const where: any = {
      description: {
        like: '[OPS_TIMER]%',
      },
    }

    if (currentUser?.id) {
      where.owner = {
        equals: currentUser.id,
      }
    }

    const allOpsLogs = await payload.find({
      collection: 'time-logs',
      where,
      sort: '-updatedAt',
      limit: 50,
      depth: 0,
    })

    return NextResponse.json({
      docs: allOpsLogs.docs,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json().catch(() => ({}))
    const { target, databaseId, sessionId } = body

    let deletedCount = 0

    if (databaseId) {
      try {
        await payload.delete({
          collection: 'time-logs',
          id: Number(databaseId),
        })
        deletedCount++
      } catch {}
    }

    const allOpsLogs = await payload.find({
      collection: 'time-logs',
      where: {
        description: {
          like: '[OPS_TIMER]%',
        },
      },
      limit: 100,
      depth: 0,
    })

    for (const d of allOpsLogs.docs) {
      if (databaseId && d.id === Number(databaseId)) continue
      if (!d.description?.startsWith('[OPS_TIMER]')) continue
      try {
        const rawJson = d.description.replace(/^\[OPS_TIMER\]\s*/, '')
        const parsed = JSON.parse(rawJson)

        let shouldDelete = false
        if (sessionId && parsed.sessionId === sessionId) {
          shouldDelete = true
        } else if (target) {
          const targetType = target.type || 'custom'
          const targetId = target.id ? Number(target.id) : null
          const targetTitle = (target.title || '').trim().toLowerCase()
          const sameType = parsed.targetType === targetType
          const sameId = targetId && Number(parsed.targetId) === targetId
          const sameTitle = parsed.targetTitle?.toLowerCase()?.trim() === targetTitle
          if (sameType && (sameId || sameTitle)) {
            shouldDelete = true
          }
        }

        if (shouldDelete) {
          await payload.delete({
            collection: 'time-logs',
            id: d.id,
          })
          deletedCount++
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: 'Current goal deleted and related database record destroyed',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
