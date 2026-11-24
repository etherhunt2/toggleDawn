'use client'

import { useEffect, useState, useCallback } from 'react'
import { useOfflineStore } from '@/stores/useOfflineStore'
import {
  offlineGetPending,
  OFFLINE_COLLECTIONS,
  type OfflineRecord,
  type OfflineCollection,
} from '@/lib/offlineDB'
import {
  RefreshCw,
  CloudUpload,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Layers,
  BookOpen,
  Zap,
  Target,
  FileText,
  BarChart3,
  Calendar,
  Tag,
  Users,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Collection icon + label map
// ---------------------------------------------------------------------------
const COLLECTION_META: Record<OfflineCollection, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'projects':         { label: 'Projects',          icon: Target,     color: '#00f0ff' },
  'missions':         { label: 'Missions',           icon: Zap,        color: '#f59e0b' },
  'mission-types':    { label: 'Mission Types',      icon: Layers,     color: '#8b5cf6' },
  'mission-planners': { label: 'Mission Planners',   icon: FileText,   color: '#06b6d4' },
  'books':            { label: 'Field Manuals',      icon: BookOpen,   color: '#3b82f6' },
  'chapters':         { label: 'Chapters',           icon: FileText,   color: '#6366f1' },
  'notes':            { label: 'Intel Notes',        icon: FileText,   color: '#10b981' },
  'flash-cards':      { label: 'Flash Cards',        icon: Layers,     color: '#00ff9d' },
  'time-logs':        { label: 'OPS Timer Logs',     icon: Clock,      color: '#f97316' },
  'test-scores':      { label: 'Test Scores',        icon: BarChart3,  color: '#ec4899' },
  'habits':           { label: 'Habit Tracker',      icon: CheckCircle2, color: '#14b8a6' },
  'schedules':        { label: 'Schedules',          icon: Calendar,   color: '#a855f7' },
  'categories':       { label: 'Categories',         icon: Tag,        color: '#64748b' },
  'drafts':           { label: 'Captured Drafts',    icon: Users,      color: '#f59e0b' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SyncPageClient() {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncAt,
    syncProgress,
    syncErrors,
    syncAll,
    refreshPendingCount,
  } = useOfflineStore()

  const [pendingRecords, setPendingRecords] = useState<OfflineRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null)

  const loadPending = useCallback(async () => {
    setLoading(true)
    try {
      const records = await offlineGetPending()
      setPendingRecords(records)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPending()
    void refreshPendingCount()
  }, [loadPending, refreshPendingCount])

  const handleSyncAll = async () => {
    const result = await syncAll()
    setSyncResult(result)
    // Reload pending list after sync
    await loadPending()
  }

  // Group pending by collection
  const grouped = pendingRecords.reduce<Record<string, OfflineRecord[]>>((acc, rec) => {
    const key = rec._collection
    if (!acc[key]) acc[key] = []
    acc[key]!.push(rec)
    return acc
  }, {})

  const formatTS = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  return (
    <main className="min-h-screen hud-bg relative py-8 px-4 md:px-8">
      <div className="scanline-overlay" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-hud text-xl font-black tracking-widest text-white uppercase">
                Data Sync // Control
              </h1>
              <p className="font-data text-xs text-[#00f0ff]/70 tracking-wider">
                Offline write queue → Neon PostgreSQL reconciliation
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4 p-3 rounded-xl bg-black/40 border border-white/5">
            {/* Network */}
            <div className={`flex items-center gap-1.5 font-data text-xs font-semibold tracking-wider px-2.5 py-1 rounded-lg border ${
              isOnline
                ? 'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30'
                : 'text-red-400 bg-red-500/10 border-red-500/30 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>

            {/* Pending count */}
            <div className={`flex items-center gap-1.5 font-data text-xs tracking-wider px-2.5 py-1 rounded-lg border ${
              pendingCount > 0
                ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                : 'text-slate-400 bg-white/5 border-white/5'
            }`}>
              <CloudUpload className="w-3.5 h-3.5" />
              {pendingCount} PENDING
            </div>

            {/* Last sync */}
            {lastSyncAt && (
              <div className="flex items-center gap-1.5 font-data text-xs text-slate-400 tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Last sync: {formatTS(lastSyncAt)}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Refresh */}
            <button
              onClick={() => void loadPending()}
              disabled={loading || isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-data text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Sync Result Toast ── */}
        {syncResult && (
          <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 font-data text-sm ${
            syncResult.failed === 0
              ? 'bg-[#00ff9d]/10 border-[#00ff9d]/30 text-[#00ff9d]'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {syncResult.failed === 0
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertTriangle className="w-4 h-4 shrink-0" />
            }
            <span>
              Sync complete — <strong>{syncResult.synced}</strong> uploaded
              {syncResult.failed > 0 && <>, <strong>{syncResult.failed}</strong> failed</>}
            </span>
            <button
              onClick={() => setSyncResult(null)}
              className="ml-auto text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Sync Errors ── */}
        {syncErrors.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10">
            <p className="font-hud text-xs text-red-400 tracking-wider mb-2">SYNC ERRORS</p>
            {syncErrors.map((err, i) => (
              <p key={i} className="font-data text-xs text-red-300">{err}</p>
            ))}
          </div>
        )}

        {/* ── Sync Progress ── */}
        {isSyncing && syncProgress && (
          <div className="mb-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-hud text-xs text-[#00f0ff] tracking-wider">
                SYNCING {COLLECTION_META[syncProgress.collection]?.label?.toUpperCase() ?? syncProgress.collection.toUpperCase()}…
              </span>
              <span className="font-data text-xs text-slate-400">
                {syncProgress.done} / {syncProgress.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-black/40 border border-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff9d] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((syncProgress.done / syncProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Sync All CTA ── */}
        <div className="mb-6">
          <button
            onClick={() => void handleSyncAll()}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-hud text-sm font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
              bg-gradient-to-r from-[#00f0ff]/20 to-[#00ff9d]/20 border border-[#00f0ff]/50 text-[#00f0ff]
              hover:from-[#00f0ff]/30 hover:to-[#00ff9d]/30 hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]
              active:scale-[0.98]"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing to Neon…
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                {pendingCount > 0 ? `Sync All (${pendingCount} Records)` : 'All Data Synced'}
              </>
            )}
          </button>

          {!isOnline && (
            <p className="text-center font-data text-xs text-red-400/70 mt-2 tracking-wider">
              You are offline — sync will auto-trigger when connectivity is restored
            </p>
          )}
        </div>

        {/* ── Pending Records by Collection ── */}
        {loading ? (
          <div className="hud-card p-8 text-center">
            <RefreshCw className="w-6 h-6 text-[#00f0ff] animate-spin mx-auto mb-2" />
            <p className="font-data text-xs text-slate-400 tracking-wider">Loading offline queue…</p>
          </div>
        ) : pendingRecords.length === 0 ? (
          <div className="hud-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-[#00ff9d]" />
            </div>
            <h3 className="font-hud text-sm text-white tracking-wider mb-1">ALL DATA SYNCED</h3>
            <p className="font-data text-xs text-slate-400">
              No pending offline records. All your data is live on Neon PostgreSQL.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([collection, records]) => {
              const meta = COLLECTION_META[collection as OfflineCollection]
              if (!meta) return null
              const Icon = meta.icon

              return (
                <div key={collection} className="hud-card overflow-hidden">
                  {/* Collection header */}
                  <div className="flex items-center gap-3 p-4 border-b border-white/5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ background: `${meta.color}18`, borderColor: `${meta.color}44`, color: meta.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="font-hud text-xs font-bold text-white tracking-wider">
                        {meta.label.toUpperCase()}
                      </span>
                      <span className="ml-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {records.length} PENDING
                      </span>
                    </div>
                  </div>

                  {/* Records list */}
                  <div className="divide-y divide-white/[0.04]">
                    {records.map((rec) => {
                      const title =
                        rec.title || rec.name || rec.question || rec.front || rec.subject || `Record #${rec._localId}`
                      return (
                        <div key={rec._localId} className="flex items-start gap-3 px-4 py-3">
                          {/* Pending dot */}
                          <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="font-data text-xs text-slate-200 truncate">
                              {String(title)}
                            </p>
                            <p className="font-data text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              Created {formatTS(rec._createdAt)}
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                NOT SYNCED
                              </span>
                              {rec._operation && rec._operation !== 'create' && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                  rec._operation === 'update'
                                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                                    : 'bg-red-500/15 text-red-400 border-red-500/20'
                                }`}>
                                  {String(rec._operation).toUpperCase()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Info footer ── */}
        <div className="mt-8 p-4 rounded-xl bg-black/30 border border-white/5">
          <p className="font-data text-[11px] text-slate-500 leading-relaxed">
            <span className="text-[#00f0ff]">How it works:</span>{' '}
            When you create, edit, or delete data offline (notes, flash cards, timer logs, test scores, drafts, etc.),
            it&apos;s saved instantly to your device&apos;s local IndexedDB.
            All pending records appear here with their creation timestamp and operation type (CREATE / UPDATE / DELETE).
            When you&apos;re back online, hit <strong className="text-white">Sync All</strong> or
            it auto-syncs, pushing records to Neon in chronological order.
            For Notes and Flash Cards, only the <em>latest edit</em> per record is synced.
            Profile settings require an internet connection.
          </p>
        </div>
      </div>
    </main>
  )
}
