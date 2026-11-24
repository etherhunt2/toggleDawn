'use client'

/**
 * OfflineProvider
 * ===============
 * Root-level provider that:
 *   1. Tracks online/offline status and updates the store
 *   2. Hydrates IndexedDB from server on first authenticated online load
 *   3. Refreshes pending count on mount
 *   4. Auto-syncs when connectivity is restored
 *
 * Place inside the authenticated layout (after auth check).
 */

import { useEffect, useRef } from 'react'
import { useOfflineStore } from '@/stores/useOfflineStore'
import { useAuthStore } from '@/stores/useAuthStore'

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const { setOnline, hydrateFromServer, refreshPendingCount } = useOfflineStore()
  const hydratedRef = useRef(false)

  // -------------------------------------------------------------------------
  // 1. Network status listeners
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    setOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // -------------------------------------------------------------------------
  // 2. Hydrate IndexedDB on first authenticated load while online
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || hydratedRef.current) return
    if (!navigator.onLine) return

    hydratedRef.current = true
    void hydrateFromServer()
  }, [isAuthenticated, hydrateFromServer])

  // -------------------------------------------------------------------------
  // 3. Refresh pending count on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    void refreshPendingCount()
  }, [refreshPendingCount])

  return <>{children}</>
}
