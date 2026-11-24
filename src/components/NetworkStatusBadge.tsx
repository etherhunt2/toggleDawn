'use client'

/**
 * NetworkStatusBadge
 * ==================
 * Cyberpunk HUD indicator showing:
 *   - Online/Offline status
 *   - Pending write-queue depth (writes buffered in Redis)
 *   - Sync in-progress spinner
 *
 * Displays only when there's something notable to show (offline, or pending > 0).
 */

import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function NetworkStatusBadge() {
  const { isOnline, isSyncing, pendingWrites, triggerSync } = useNetworkStatus()

  // If fully online and nothing pending, stay hidden
  if (isOnline && pendingWrites === 0 && !isSyncing) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded border text-xs font-data uppercase tracking-widest transition-all ${
        !isOnline
          ? 'bg-black border-red-500 text-red-400'
          : pendingWrites > 0
            ? 'bg-black border-amber-500 text-amber-400'
            : 'bg-black border-cyan-500 text-cyan-400'
      }`}
    >
      {/* Status dot */}
      <span
        className={`w-2 h-2 rounded-full ${
          !isOnline
            ? 'bg-red-500 animate-pulse'
            : isSyncing
              ? 'bg-cyan-400 animate-ping'
              : 'bg-amber-500 animate-pulse'
        }`}
      />

      {/* Label */}
      {!isOnline && <span>Offline — writes queued</span>}
      {isOnline && isSyncing && <span>Syncing…</span>}
      {isOnline && !isSyncing && pendingWrites > 0 && (
        <span>{pendingWrites} pending sync</span>
      )}

      {/* Manual sync button */}
      {isOnline && !isSyncing && pendingWrites > 0 && (
        <button
          onClick={() => void triggerSync()}
          className="ml-1 border border-cyan-700 px-1.5 py-0.5 rounded text-cyan-400 hover:border-cyan-400 hover:text-cyan-200 transition-colors"
        >
          Sync now
        </button>
      )}
    </div>
  )
}
