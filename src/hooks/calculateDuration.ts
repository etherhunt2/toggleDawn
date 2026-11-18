import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Calculates `duration` in minutes from `startTime` and `endTime` fields.
 * Fires on both create and update operations for TimeLogs.
 */
export const calculateDuration: CollectionBeforeChangeHook = ({ data }) => {
  // If this is an OPS_TIMER entry with an explicitly calculated focused duration,
  // preserve it instead of recalculating from wall-clock (which includes hours of paused time).
  if (
    data?.description?.startsWith('[OPS_TIMER]') &&
    typeof data?.duration === 'number' &&
    data.duration > 0
  ) {
    return data
  }

  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime).getTime()
    const end = new Date(data.endTime).getTime()

    if (end > start) {
      // Duration in minutes, rounded to nearest integer
      data.duration = Math.round((end - start) / (1000 * 60))
    }
  }
  return data
}
