'use client'

/**
 * useNetworkStatus
 * ================
 * Client-side hook that tracks online/offline status and provides
 * helpers to trigger a Redis sync when connectivity is restored.
 *
 * Usage:
 *   const { isOnline, isSyncing, lastSyncAt, triggerSync } = useNetworkStatus()
 */

import { useState, useEffect, useCallback } from 'react'

interface NetworkStatus {
  /** True when the browser detects an active network connection */
  isOnline: boolean
  /** True while a sync cycle is in progress */
  isSyncing: boolean
  /** ISO timestamp of the last successful sync */
  lastSyncAt: string | null
  /** Number of writes pending in the queue (from last status poll) */
  pendingWrites: number
  /** Trigger a manual sync cycle */
  triggerSync: () => Promise<void>
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [pendingWrites, setPendingWrites] = useState(0)

  // -------------------------------------------------------------------------
  // Poll the Redis status endpoint every 30s
  // -------------------------------------------------------------------------
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/redis/status')
      if (res.ok) {
        const data = await res.json()
        setPendingWrites(data.writeQueue?.pending ?? 0)
      }
    } catch {
      // Ignore — polling is best-effort
    }
  }, [])

  useEffect(() => {
    // Initial poll
    void pollStatus()

    const interval = setInterval(pollStatus, 30_000)
    return () => clearInterval(interval)
  }, [pollStatus])

  // -------------------------------------------------------------------------
  // Listen for browser online/offline events
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-trigger sync when connectivity is restored
      void triggerSync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // Manual sync trigger
  // -------------------------------------------------------------------------
  const triggerSync = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)

    try {
      const res = await fetch('/api/redis/status?action=sync', { method: 'POST' })
      if (res.ok) {
        setLastSyncAt(new Date().toISOString())
        // Refresh pending count after sync
        await pollStatus()
      }
    } catch {
      // Network unavailable — sync will auto-run on next online event
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, pollStatus])

  return { isOnline, isSyncing, lastSyncAt, pendingWrites, triggerSync }
}
