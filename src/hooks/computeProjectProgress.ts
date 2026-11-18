import type { CollectionBeforeChangeHook } from 'payload'

/**
 * computeProjectProgress — beforeChange hook for the Projects collection.
 *
 * Computes the `computedProgress` field (0–100) based on:
 *   - Total target hours across all linked missions
 *   - Total logged minutes across all time-logs linked to those missions
 *
 * This runs server-side before every save, keeping the value always fresh.
 * Admins can still override via `adminForcedProgress`.
 */
export const computeProjectProgress: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  // If admin has set a forced override value, use it directly (skip computation)
  if (typeof data.adminForcedProgress === 'number' && data.adminForcedProgress >= 0) {
    data.computedProgress = Math.min(100, Math.max(0, data.adminForcedProgress))
    return data
  }

  // Preserve existing computedProgress if no missions yet
  const projectId = originalDoc?.id || data?.id
  if (!projectId || !req?.payload) return data

  try {
    // 1. Fetch all missions for this project
    const missionsRes = await req.payload.find({
      collection: 'missions',
      where: { project: { equals: projectId } },
      limit: 200,
      depth: 0,
    })

    const missions = missionsRes.docs || []
    if (missions.length === 0) {
      data.computedProgress = 0
      return data
    }

    const missionIds = missions.map((m: any) => m.id)
    const totalTargetMinutes = missions.reduce(
      (sum: number, m: any) => sum + (m.targetHours || 0) * 60,
      0,
    )

    if (totalTargetMinutes === 0) {
      // No target hours set — compute based on completed missions instead
      const completedCount = missions.filter((m: any) => m.status === 'completed').length
      data.computedProgress = Math.round((completedCount / missions.length) * 100)
      return data
    }

    // 2. Sum all time logs linked to these missions
    const timeLogsRes = await req.payload.find({
      collection: 'time-logs',
      where: { mission: { in: missionIds } },
      limit: 2000,
      depth: 0,
    })

    const totalLoggedMinutes = (timeLogsRes.docs || []).reduce(
      (sum: number, tl: any) => sum + (tl.duration || 0),
      0,
    )

    // 3. Calculate percentage
    const pct = Math.round((totalLoggedMinutes / totalTargetMinutes) * 100)
    data.computedProgress = Math.min(100, Math.max(0, pct))
  } catch (err) {
    console.warn('[ToggleDawn] computeProjectProgress hook error:', err)
    // Preserve the last known value on error
  }

  return data
}
