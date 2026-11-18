import type { CollectionBeforeChangeHook } from 'payload'

/**
 * computeMissionProgress — beforeChange hook for the Missions collection.
 *
 * Flexible scoring engine that:
 * 1. Reads the linked MissionType to discover measurement dimensions
 * 2. For each dimension, queries the relevant data:
 *    - timer-hours     → sum time-logs linked to this mission
 *    - streak-tracking → read streakData from the mission doc
 *    - note-tracking   → count notes read/created/edited
 *    - task-completion  → (future) count completed tasks
 *    - time-slot-tracking → check time-logs against slot windows
 * 3. Computes a weighted score across all dimensions
 * 4. Sets `computedProgress` (0–100)
 *
 * Also auto-computes `targetHours` from `targetConfig` for backward compatibility.
 */
export const computeMissionProgress: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  // ── 1. Admin forced override ──
  if (typeof data.adminForcedProgress === 'number' && data.adminForcedProgress >= 0) {
    data.computedProgress = Math.min(100, Math.max(0, data.adminForcedProgress))
    return data
  }

  // ── 2. Auto-compute targetHours from targetConfig for backward compatibility ──
  const config = data.targetConfig || originalDoc?.targetConfig
  if (config) {
    switch (config.mode) {
      case 'daily': {
        const dailyH = config.dailyTargetHours || 0
        // Estimate total as 30 days * daily hours if no flat total is set
        if (!data.targetHours || data.targetHours === 0) {
          data.targetHours = dailyH * 30
        }
        break
      }
      case 'weekly': {
        const daysCount = config.weeklyActiveDays?.length || 5
        const perDay = config.hoursPerActiveDay || 0
        const weeklyTotal = config.weeklyTotalTarget || daysCount * perDay
        // Estimate ~4.3 weeks per month
        if (!data.targetHours || data.targetHours === 0) {
          data.targetHours = Math.round(weeklyTotal * 4.3)
        }
        break
      }
      case 'time-slots': {
        const slots = config.timeSlots || []
        const dailyMinutes = slots.reduce(
          (sum: number, s: any) => sum + (s.targetMinutes || 0),
          0,
        )
        if (!data.targetHours || data.targetHours === 0) {
          data.targetHours = Math.round((dailyMinutes / 60) * 30)
        }
        break
      }
      case 'total': {
        if (config.totalTargetHours) {
          data.targetHours = config.totalTargetHours
        }
        break
      }
      // 'custom' — leave targetHours as-is
    }
  }

  // ── 3. Compute progress ──
  const missionId = originalDoc?.id || data?.id
  if (!missionId || !req?.payload) return data

  try {
    // Resolve the mission type to get measurement dimensions
    let dimensions: any[] = []
    const missionTypeId = data.missionType || originalDoc?.missionType
    if (missionTypeId) {
      const resolvedTypeId =
        typeof missionTypeId === 'object' ? missionTypeId.id : missionTypeId
      if (resolvedTypeId) {
        const missionType = await req.payload.findByID({
          collection: 'mission-types',
          id: resolvedTypeId,
          depth: 0,
        })
        dimensions = missionType?.measurementDimensions || []
      }
    }

    // If no measurement dimensions configured, fall back to simple timer-hours calculation
    if (dimensions.length === 0) {
      const totalTarget = data.targetHours || originalDoc?.targetHours || 0
      if (totalTarget <= 0) {
        data.computedProgress = 0
        return data
      }

      const timeLogsRes = await req.payload.find({
        collection: 'time-logs',
        where: { mission: { equals: missionId } },
        limit: 2000,
        depth: 0,
      })
      const totalLoggedMinutes = (timeLogsRes.docs || []).reduce(
        (sum: number, tl: any) => sum + (tl.duration || 0),
        0,
      )
      const pct = Math.round((totalLoggedMinutes / 60 / totalTarget) * 100)
      data.computedProgress = Math.min(100, Math.max(0, pct))
      return data
    }

    // ── Compute each dimension's score ──
    const totalWeight = dimensions.reduce((sum: number, d: any) => sum + (d.weight || 0), 0)
    if (totalWeight === 0) {
      data.computedProgress = 0
      return data
    }

    let weightedScore = 0

    for (const dim of dimensions) {
      const weight = dim.weight || 0
      if (weight === 0) continue

      let dimensionScore = 0

      switch (dim.blockType) {
        // ─── TIMER HOURS ───
        case 'timer-hours': {
          const totalTarget = data.targetHours || originalDoc?.targetHours || 0
          if (totalTarget > 0) {
            const timeLogsRes = await req.payload.find({
              collection: 'time-logs',
              where: { mission: { equals: missionId } },
              limit: 2000,
              depth: 0,
            })
            const totalLoggedMinutes = (timeLogsRes.docs || []).reduce(
              (sum: number, tl: any) => sum + (tl.duration || 0),
              0,
            )
            dimensionScore = Math.min(100, (totalLoggedMinutes / 60 / totalTarget) * 100)
          }
          break
        }

        // ─── STREAK TRACKING ───
        case 'streak-tracking': {
          const streak = data.streakData || originalDoc?.streakData || {}
          const followed = streak.totalFollowed || 0
          const missed = streak.totalMissed || 0
          const total = followed + missed
          if (total > 0) {
            dimensionScore = (followed / total) * 100
          }
          break
        }

        // ─── NOTE TRACKING ───
        case 'note-tracking': {
          // Count notes that are related to books/chapters linked to this mission
          // For now, use a simple count of completed notes vs total notes in the system
          // This will be refined once Notes get a direct mission FK
          try {
            const allNotes = await req.payload.find({
              collection: 'notes',
              limit: 500,
              depth: 0,
            })
            const totalNotes = allNotes.docs?.length || 0
            const completedNotes = (allNotes.docs || []).filter(
              (n: any) => n.isCompleted,
            ).length

            if (totalNotes > 0) {
              let noteScore = 0
              let noteMetrics = 0

              if (dim.trackRead) {
                noteScore += (completedNotes / totalNotes) * 100
                noteMetrics++
              }
              if (dim.trackCreated && totalNotes > 0) {
                // Simple: having notes is progress. Scale to target.
                noteScore += Math.min(100, totalNotes * 10) // 10 notes = 100%
                noteMetrics++
              }
              if (dim.trackEdited) {
                // Count recently edited notes (updated in last 7 days)
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                const recentlyEdited = (allNotes.docs || []).filter(
                  (n: any) => new Date(n.updatedAt) >= sevenDaysAgo,
                ).length
                noteScore += Math.min(100, (recentlyEdited / Math.max(totalNotes, 1)) * 100)
                noteMetrics++
              }

              dimensionScore = noteMetrics > 0 ? noteScore / noteMetrics : 0
            }
          } catch {
            // Notes collection might not be available
          }
          break
        }

        // ─── TASK COMPLETION ───
        case 'task-completion': {
          // Future: When Tasks collection is created, query completed vs total tasks.
          // For now, placeholder: use 0% until Tasks system is implemented.
          dimensionScore = 0
          break
        }

        // ─── TIME-SLOT TRACKING ───
        case 'time-slot-tracking': {
          const slots = dim.slots || []
          if (slots.length > 0) {
            // Check today's time-logs against the defined slots
            const today = new Date()
            const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

            const todayLogsRes = await req.payload.find({
              collection: 'time-logs',
              where: {
                mission: { equals: missionId },
                startTime: { greater_than: dayStart.toISOString() },
                endTime: { less_than: dayEnd.toISOString() },
              },
              limit: 100,
              depth: 0,
            })
            const todayLogs = todayLogsRes.docs || []

            let slotsMetCount = 0
            const slotHourMap: Record<string, { start: number; end: number }> = {
              morning: { start: 6, end: 12 },
              afternoon: { start: 12, end: 17 },
              evening: { start: 17, end: 21 },
              night: { start: 21, end: 24 },
            }

            for (const slot of slots) {
              const targetMin = slot.targetMinutes || 60
              const slotRange =
                slot.slotName === 'custom'
                  ? { start: slot.startHour || 0, end: slot.endHour || 23 }
                  : slotHourMap[slot.slotName] || { start: 0, end: 24 }

              // Sum time-logs that fall within this slot's hour range
              const slotMinutes = todayLogs
                .filter((tl: any) => {
                  const logHour = new Date(tl.startTime).getHours()
                  return logHour >= slotRange.start && logHour < slotRange.end
                })
                .reduce((sum: number, tl: any) => sum + (tl.duration || 0), 0)

              if (slotMinutes >= targetMin) {
                slotsMetCount++
              }
            }

            dimensionScore = (slotsMetCount / slots.length) * 100
          }
          break
        }
      }

      // Add weighted contribution
      weightedScore += (dimensionScore * weight) / totalWeight
    }

    data.computedProgress = Math.min(100, Math.max(0, Math.round(weightedScore)))
  } catch (err) {
    console.warn('[ToggleDawn] computeMissionProgress hook error:', err)
  }

  return data
}
