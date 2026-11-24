/**
 * useOpsTimerStore.ts — Zustand store for OPS Pomodoro Timer.
 *
 * Implements:
 * 1. Strategic goal selection (Habits, Missions, Projects, Books, Chapters, Custom).
 * 2. In-memory / cache duration hold until timer termination or timeout (no premature DB write).
 * 3. Automatic Pomodoro cycling (25m Focus -> 5m Break with bell chime & emoji feedback).
 * 4. Safe persistence to database on Pause, Terminate, Quit, or Goal Timeout.
 * 5. Hydration of last paused session on mount/login for persistent state across devices.
 */

import { create } from 'zustand'
import { playBellChime } from '@/utilities/timerAudio'
import { useAuthStore } from './useAuthStore'
import { triggerHUDToast } from './useToastStore'

export type OpsTimerTargetType = 'habit' | 'mission' | 'project' | 'book' | 'chapter' | 'custom'

export interface OpsTimerTarget {
  id?: string | number
  type: OpsTimerTargetType
  title: string
  subtitle?: string
  category?: string
}

export type PomodoroRatingScore = 1 | 2 | 3 | 4 | 5
export type PomodoroRatingEmoji = '😭' | '🙁' | '😐' | '😊' | '🥳'
export type PomodoroRatingLabel = 'very-sad' | 'sad' | 'good' | 'happy' | 'hurray'

export interface PomodoroRating {
  pomodoroIndex: number
  emoji: PomodoroRatingEmoji
  label: PomodoroRatingLabel
  score: PomodoroRatingScore
  timestamp: string
}

export type OpsTimerStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed' | 'terminated' | 'quit'

export interface OpsTimerSession {
  sessionId: string
  databaseId?: number | null
  status: OpsTimerStatus
  target: OpsTimerTarget

  // Total targeted duration in seconds (held temporarily in cache/state until end of session)
  targetDurationSeconds: number

  // Current block (Focus: 1500s = 25m, Break: 300s = 5m)
  currentMode: 'focus' | 'break'
  blockRemainingSeconds: number
  blockTotalSeconds: number

  // Total accumulated focus seconds
  totalElapsedSeconds: number

  // Pomodoro tracking
  currentCycle: number
  pomodorosCompleted: number
  ratings: PomodoroRating[]

  startTime: string
  lastPauseTime?: string
  lastActiveTimestamp: number
}

interface OpsTimerState {
  session: OpsTimerSession | null
  lastPausedSession: OpsTimerSession | null
  pendingRatingPrompt: boolean
  isManageModalOpen: boolean
  manageModalInitialStep: 1 | 2
  isSyncing: boolean

  // Actions
  openManageModal: (step?: 1 | 2) => void
  closeManageModal: () => void
  configureSession: (target: OpsTimerTarget, durationMinutes: number) => void
  startTimer: () => void
  tick: () => void
  rateLastPomodoro: (emoji: PomodoroRatingEmoji, label: PomodoroRatingLabel, score: PomodoroRatingScore) => void
  dismissRatingPrompt: () => void
  pauseSession: () => Promise<void>
  resumeSession: (sessionToResume?: OpsTimerSession | null) => void
  terminateSession: () => Promise<void>
  quitSession: () => Promise<void>
  completeSession: () => Promise<void>
  changePausedSessionStatus: (newStatus: 'running' | 'quit' | 'terminated' | 'completed') => Promise<void>
  syncWithDatabase: () => Promise<void>
  clearActiveSession: () => void
  initFromStorage: () => void
}

const STORAGE_KEY = 'toggledawn_ops_timer_session'
const PAUSED_STORAGE_KEY = 'toggledawn_ops_timer_paused'

const DEFAULT_FOCUS_SECONDS = 25 * 60 // 25 minutes
const DEFAULT_BREAK_SECONDS = 5 * 60 // 5 minutes

function readCachedSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCachedSession(key: string, data: unknown): void {
  if (typeof window === 'undefined') return
  try {
    if (data === null) {
      window.localStorage.removeItem(key)
    } else {
      window.localStorage.setItem(key, JSON.stringify(data))
    }
  } catch {
    // LocalStorage quota or blocked
  }
}

/**
 * Persists session telemetry to the Payload CMS `time-logs` collection via /api/ops-timer.
 * GUARANTEE: Exactly 1 row per target in the database.
 * If a row already exists for this target, it is PATCHed/updated in place.
 * The original startTime (when timer began) is preserved; updatedAt reflects the latest update.
 *
 * When offline, buffers the record in IndexedDB under the 'time-logs' collection.
 */
async function persistToDatabase(
  session: OpsTimerSession,
  actionStatus: 'paused' | 'terminated' | 'quit' | 'completed',
): Promise<number | null> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  if (!isOnline) {
    // Buffer in IndexedDB under 'time-logs' collection
    const { offlineSave } = await import('@/lib/offlineDB')
    await offlineSave('time-logs', {
      _operation: 'create',
      sessionId: session.sessionId,
      targetTitle: session.target.title,
      targetType: session.target.type,
      targetId: session.target.id,
      totalElapsedSeconds: session.totalElapsedSeconds,
      targetDurationMinutes: Math.round(session.targetDurationSeconds / 60),
      ratings: JSON.stringify(session.ratings),
      currentCycle: session.currentCycle,
      pomodorosCompleted: session.pomodorosCompleted,
      status: actionStatus,
      startTime: session.startTime,
      endTime: new Date().toISOString(),
      description: `[OPS_TIMER] ${JSON.stringify({ sessionId: session.sessionId, status: actionStatus, targetTitle: session.target.title, elapsedSeconds: session.totalElapsedSeconds })}`,
    })
    // Refresh pending count
    const { useOfflineStore } = await import('@/stores/useOfflineStore')
    useOfflineStore.getState().refreshPendingCount()
    return null // No DB id when offline
  }

  // Online: existing fetch logic
  try {
    const currentUser = useAuthStore.getState().user

    const res = await fetch('/api/ops-timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session,
        actionStatus,
        target: session.target,
        totalElapsedSeconds: session.totalElapsedSeconds,
        targetDurationMinutes: Math.round(session.targetDurationSeconds / 60),
        ratings: session.ratings,
        currentCycle: session.currentCycle,
        currentMode: session.currentMode,
        pomodorosCompleted: session.pomodorosCompleted,
        owner: currentUser?.id || null,
        userId: currentUser?.id || null,
      }),
      credentials: 'include',
    })

    if (res.ok) {
      const data = await res.json()
      if (data.startTime && session.startTime !== data.startTime) {
        session.startTime = data.startTime
      }
      return data.docId || null
    }
  } catch (error) {
    console.error('[OpsTimer] Failed to persist session to database:', error)
  }
  return null
}

export const useOpsTimerStore = create<OpsTimerState>()((set, get) => {
  return {
    session: null,
    lastPausedSession: null,
    pendingRatingPrompt: false,
    isManageModalOpen: false,
    manageModalInitialStep: 1,
    isSyncing: false,

    initFromStorage: () => {
      const cachedActive = readCachedSession<OpsTimerSession>(STORAGE_KEY)
      const cachedPaused = readCachedSession<OpsTimerSession>(PAUSED_STORAGE_KEY)

      const validActive =
        cachedActive &&
        cachedActive.status !== 'completed' &&
        cachedActive.status !== 'terminated' &&
        cachedActive.status !== 'quit'
          ? cachedActive
          : null

      const validPaused = cachedPaused || (cachedActive?.status === 'paused' ? cachedActive : null)

      set({
        session: validActive,
        lastPausedSession: validPaused,
      })
    },

    openManageModal: (step = 1) => {
      set({ isManageModalOpen: true, manageModalInitialStep: step })
    },

    closeManageModal: () => {
      set({ isManageModalOpen: false })
    },

    // Step 2 finish: Hold duration in cache/useState, DO NOT store in database yet!
    configureSession: (target: OpsTimerTarget, durationMinutes: number) => {
      const totalSeconds = Math.max(60, durationMinutes * 60)
      const firstBlockSeconds = Math.min(DEFAULT_FOCUS_SECONDS, totalSeconds)

      const lastPaused = get().lastPausedSession
      const active = get().session
      const candidate =
        (lastPaused?.target.title?.toLowerCase()?.trim() === target.title.toLowerCase().trim() && lastPaused) ||
        (active?.target.title?.toLowerCase()?.trim() === target.title.toLowerCase().trim() && active) ||
        null

      const newSession: OpsTimerSession = {
        sessionId: candidate?.sessionId || `ops-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        databaseId: candidate?.databaseId || null,
        status: 'idle',
        target,
        targetDurationSeconds: totalSeconds,
        currentMode: 'focus',
        blockRemainingSeconds: firstBlockSeconds,
        blockTotalSeconds: firstBlockSeconds,
        totalElapsedSeconds: candidate?.totalElapsedSeconds || 0,
        currentCycle: candidate?.currentCycle || 1,
        pomodorosCompleted: candidate?.pomodorosCompleted || 0,
        ratings: candidate?.ratings || [],
        startTime: candidate?.startTime || new Date().toISOString(),
        lastActiveTimestamp: Date.now(),
      }

      writeCachedSession(STORAGE_KEY, newSession)
      set({
        session: newSession,
        pendingRatingPrompt: false,
        isManageModalOpen: false,
      })
    },

    startTimer: () => {
      const { session } = get()
      if (!session) return

      const updated: OpsTimerSession = {
        ...session,
        status: session.currentMode === 'break' ? 'break' : 'running',
        lastActiveTimestamp: Date.now(),
      }

      writeCachedSession(STORAGE_KEY, updated)
      set({ session: updated })
      playBellChime('focus')

      triggerHUDToast({
        type: 'resume',
        title: 'OPS TIMER STARTED',
        message: `Focus block initiated for "${session.target.title}" (${Math.round(session.targetDurationSeconds / 60)}m committed).`,
        duration: 3500,
      })
    },

    // Clock ticker — executes every second
    tick: () => {
      const { session } = get()
      if (!session) return
      if (session.status !== 'running' && session.status !== 'break') return

      const now = Date.now()
      // Compensate for background tab lag / throttling
      const deltaSec = Math.max(1, Math.min(10, Math.floor((now - session.lastActiveTimestamp) / 1000)))
      const newBlockRemaining = Math.max(0, session.blockRemainingSeconds - deltaSec)

      // Only increment elapsed focus time during 'focus' mode
      const isFocus = session.currentMode === 'focus'
      const newElapsed = isFocus ? session.totalElapsedSeconds + deltaSec : session.totalElapsedSeconds

      // Check if entire targeted duration is complete
      if (newElapsed >= session.targetDurationSeconds) {
        get().completeSession()
        return
      }

      // Check if current block finished (focus -> break OR break -> focus)
      if (newBlockRemaining <= 0) {
        if (isFocus) {
          // Focus finished -> Transition automatically to Break!
          playBellChime('break')
          const completedCount = session.pomodorosCompleted + 1
          const remainingGoalSec = session.targetDurationSeconds - newElapsed
          const nextBreakSec = Math.min(DEFAULT_BREAK_SECONDS, remainingGoalSec)

          const updated: OpsTimerSession = {
            ...session,
            currentMode: 'break',
            status: 'break',
            blockRemainingSeconds: nextBreakSec,
            blockTotalSeconds: nextBreakSec,
            totalElapsedSeconds: newElapsed,
            pomodorosCompleted: completedCount,
            lastActiveTimestamp: now,
          }

          writeCachedSession(STORAGE_KEY, updated)
          // Open rating prompt for past 25-minute focus session
          set({
            session: updated,
            pendingRatingPrompt: true,
          })
        } else {
          // Break finished -> Ring bell to start next 25-min Pomodoro!
          playBellChime('focus')
          const nextCycle = session.currentCycle + 1
          const remainingGoalSec = session.targetDurationSeconds - newElapsed
          const nextFocusSec = Math.min(DEFAULT_FOCUS_SECONDS, remainingGoalSec)

          const updated: OpsTimerSession = {
            ...session,
            currentMode: 'focus',
            status: 'running',
            currentCycle: nextCycle,
            blockRemainingSeconds: nextFocusSec,
            blockTotalSeconds: nextFocusSec,
            totalElapsedSeconds: newElapsed,
            lastActiveTimestamp: now,
          }

          writeCachedSession(STORAGE_KEY, updated)
          set({
            session: updated,
            pendingRatingPrompt: false,
          })
        }
        return
      }

      // Normal second tick
      const updated: OpsTimerSession = {
        ...session,
        blockRemainingSeconds: newBlockRemaining,
        totalElapsedSeconds: newElapsed,
        lastActiveTimestamp: now,
      }

      writeCachedSession(STORAGE_KEY, updated)
      set({ session: updated })
    },

    rateLastPomodoro: (emoji, label, score) => {
      const { session } = get()
      if (!session) return

      const rating: PomodoroRating = {
        pomodoroIndex: session.pomodorosCompleted,
        emoji,
        label,
        score,
        timestamp: new Date().toISOString(),
      }

      const updated: OpsTimerSession = {
        ...session,
        ratings: [...session.ratings, rating],
      }

      writeCachedSession(STORAGE_KEY, updated)
      set({
        session: updated,
        pendingRatingPrompt: false,
      })
    },

    dismissRatingPrompt: () => {
      set({ pendingRatingPrompt: false })
    },

    // Pause: Temporarily stops timer and updates database with status: 'paused'
    pauseSession: async () => {
      const { session } = get()
      if (!session) return

      const pausedSession: OpsTimerSession = {
        ...session,
        status: 'paused',
        lastPauseTime: new Date().toISOString(),
      }

      // 1. Immediately freeze countdown in UI and cache!
      set({ session: pausedSession, lastPausedSession: pausedSession, isSyncing: true })
      writeCachedSession(STORAGE_KEY, pausedSession)
      writeCachedSession(PAUSED_STORAGE_KEY, pausedSession)

      const elapsedMins = Math.max(1, Math.round(pausedSession.totalElapsedSeconds / 60))
      const remainingMins = Math.max(
        0,
        Math.round((pausedSession.targetDurationSeconds - pausedSession.totalElapsedSeconds) / 60),
      )

      triggerHUDToast({
        type: 'sync',
        title: 'SYNCING PAUSED STATE...',
        message: `Saving paused focus block for "${pausedSession.target.title}" to database.`,
        duration: 2000,
      })

      try {
        const dbId = await persistToDatabase(pausedSession, 'paused')
        if (dbId) {
          pausedSession.databaseId = dbId
          writeCachedSession(STORAGE_KEY, pausedSession)
          writeCachedSession(PAUSED_STORAGE_KEY, pausedSession)
          set({ session: pausedSession, lastPausedSession: pausedSession })
        }
        set({ isSyncing: false })
        triggerHUDToast({
          type: 'pause',
          title: 'DATABASE SYNCED // STATUS: PAUSED',
          message: `Paused at ${elapsedMins}m (${remainingMins}m remaining). Preserved in database.`,
          detail: `TimeLogs record #${dbId || 'saved'}. Next login will automatically load this paused session.`,
          duration: 5000,
        })
      } catch (_e) {
        set({ isSyncing: false })
        triggerHUDToast({
          type: 'error',
          title: 'DATABASE ERROR',
          message: `Failed to sync paused state to database.`,
          duration: 4000,
        })
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('time-log-added'))
      }
    },

    // Resume from paused state
    resumeSession: (sessionToResume) => {
      const active = sessionToResume || get().session || get().lastPausedSession
      if (!active) return

      const resumed: OpsTimerSession = {
        ...active,
        status: active.currentMode === 'break' ? 'break' : 'running',
        lastActiveTimestamp: Date.now(),
      }

      writeCachedSession(STORAGE_KEY, resumed)
      set({ session: resumed, isManageModalOpen: false })
      playBellChime('focus')

      triggerHUDToast({
        type: 'resume',
        title: 'OPS TIMER RESUMED',
        message: `Continuing focus block for "${active.target.title}". Countdown active.`,
        duration: 3500,
      })
    },

    // Terminate: destroys current timer session.
    // Logic:
    // 1. Immediately reset Zustand store and cache so countdown stops on this frame.
    // 2. Fetch database first (/api/ops-timer) to match ID of running timer (databaseId or sessionId).
    // 3. If matching entry found: destroy ONLY current timer session related data from database via DELETE, then Toast "DATABASE PURGED".
    // 4. If NO entries found in database related to current timer session ID: simply keep store reset, then Toast "TIMER TERMINATED // STORE RESET".
    terminateSession: async () => {
      const { session, lastPausedSession } = get()
      const targetSession = session || lastPausedSession
      if (!targetSession) return

      const runningSessionId = targetSession.sessionId
      const runningDatabaseId = targetSession.databaseId ? Number(targetSession.databaseId) : null
      const targetTitle = targetSession.target.title

      // 1. Immediately halt and reset timer in UI, Zustand store, and localStorage
      writeCachedSession(STORAGE_KEY, null)
      writeCachedSession(PAUSED_STORAGE_KEY, null)

      set({
        session: null,
        lastPausedSession: null,
        pendingRatingPrompt: false,
        isManageModalOpen: false,
        isSyncing: true,
      })

      // Immediate notification that terminate action was registered
      triggerHUDToast({
        type: 'sync',
        title: 'CHECKING TELEMETRY RECORDS...',
        message: `Verifying database entries for "${targetTitle}".`,
        duration: 2000,
      })

      // 2. Query database first to check if any entry exists matching the running timer ID
      let matchedDocId: number | null = null

      try {
        const res = await fetch('/api/ops-timer', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        })

        if (res.ok) {
          const data = await res.json()
          const docs: Array<{ id: number; description?: string }> = data?.docs || []

          for (const doc of docs) {
            // Check direct databaseId match
            if (runningDatabaseId && doc.id === runningDatabaseId) {
              matchedDocId = doc.id
              break
            }

            // Check sessionId inside [OPS_TIMER] metadata description
            if (doc.description?.startsWith('[OPS_TIMER]')) {
              try {
                const rawJson = doc.description.replace(/^\[OPS_TIMER\]\s*/, '')
                const parsed = JSON.parse(rawJson)
                if (parsed?.sessionId && parsed.sessionId === runningSessionId) {
                  matchedDocId = doc.id
                  break
                }
              } catch {
                // Ignore parse errors for corrupt descriptions
              }
            }
          }
        }
      } catch (checkErr) {
        console.warn('[OpsTimer] Failed to query database before terminate:', checkErr)
      }

      // 3. Conditional DB purge vs Local store reset
      if (matchedDocId !== null) {
        // Matching entry found in database -> destroy ONLY current timer session related data
        try {
          await fetch('/api/ops-timer', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              databaseId: matchedDocId,
              sessionId: runningSessionId,
            }),
            credentials: 'include',
          })

          set({ isSyncing: false })
          triggerHUDToast({
            type: 'terminate',
            title: 'DATABASE PURGED // DATA DESTROYED',
            message: `Current session data for "${targetTitle}" destroyed from database (Record #${matchedDocId}).`,
            detail: `Session ID: ${runningSessionId} • Database cleaned.`,
            duration: 5000,
          })
        } catch (_delErr) {
          set({ isSyncing: false })
          triggerHUDToast({
            type: 'error',
            title: 'DATABASE ERROR',
            message: `Failed to destroy database record #${matchedDocId} for "${targetTitle}". Store reset to standby.`,
            duration: 5000,
          })
        }
      } else {
        // No entries found related to current timer session ID in database
        // Simply reset Zustand store (already reset) and notify user
        set({ isSyncing: false })
        triggerHUDToast({
          type: 'terminate',
          title: 'TIMER TERMINATED // STORE RESET',
          message: `Timer for "${targetTitle}" terminated. No database record existed; store reset to standby.`,
          detail: `Session ID: ${runningSessionId} • Ready for new task.`,
          duration: 5000,
        })
      }

      // 4. Dispatch browser events for UI synchronisation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('time-log-added'))
        window.dispatchEvent(
          new CustomEvent('toggledawn:session-terminated', {
            detail: {
              targetTitle,
              sessionId: runningSessionId,
              matchedDocId,
            },
          }),
        )
      }
    },

    // Quit session: user gave up before committed duration; saves all data with begin & end timestamps
    quitSession: async () => {
      const { session, lastPausedSession } = get()
      const targetSession = session || lastPausedSession
      if (!targetSession) return

      // 1. Immediately halt and save timer in UI and localStorage so countdown stops on this frame!
      writeCachedSession(STORAGE_KEY, null)
      writeCachedSession(PAUSED_STORAGE_KEY, null)

      const elapsedMins = Math.max(1, Math.round(targetSession.totalElapsedSeconds / 60))
      const targetMins = Math.round(targetSession.targetDurationSeconds / 60)
      const beginTimeStr = new Date(targetSession.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      const endTimeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      set({
        session: null,
        lastPausedSession: null,
        pendingRatingPrompt: false,
        isManageModalOpen: false,
        isSyncing: true,
      })

      triggerHUDToast({
        type: 'sync',
        title: 'SAVING QUIT TELEMETRY...',
        message: `Saving ${elapsedMins}m focus time for "${targetSession.target.title}" to database.`,
        duration: 2000,
      })

      const quitSessionData: OpsTimerSession = {
        ...targetSession,
        status: 'quit',
      }

      try {
        const docId = await persistToDatabase(quitSessionData, 'quit')
        set({ isSyncing: false })
        triggerHUDToast({
          type: 'quit',
          title: 'DATABASE COMMITTED // QUIT EARLY',
          message: `Saved ${elapsedMins}m focus time to database (TimeLogs ID: #${docId || 'OK'}).`,
          detail: `Began: ${beginTimeStr} → Ended: ${endTimeStr} • Committed: ${targetMins}m • Target: ${targetSession.target.title}`,
          duration: 5000,
        })
      } catch (_e) {
        set({ isSyncing: false })
        triggerHUDToast({
          type: 'error',
          title: 'DATABASE ERROR',
          message: `Failed to save quit records to database.`,
          duration: 4000,
        })
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('time-log-added'))
        window.dispatchEvent(
          new CustomEvent('toggledawn:session-quit', {
            detail: {
              targetTitle: targetSession.target.title,
              elapsedMinutes: elapsedMins,
              targetDurationMinutes: targetMins,
            },
          }),
        )
      }
    },

    // Change status of last paused timer directly
    changePausedSessionStatus: async (newStatus: 'running' | 'quit' | 'terminated' | 'completed') => {
      if (newStatus === 'running') {
        get().resumeSession()
      } else if (newStatus === 'quit') {
        await get().quitSession()
      } else if (newStatus === 'terminated') {
        await get().terminateSession()
      } else if (newStatus === 'completed') {
        await get().completeSession()
      }
    },

    // Target Duration Reached: automatically updates database with status: 'completed'
    completeSession: async () => {
      const { session } = get()
      if (!session) return

      playBellChime('complete')
      set({ isSyncing: true })

      const completedSession: OpsTimerSession = {
        ...session,
        status: 'completed',
        totalElapsedSeconds: session.targetDurationSeconds,
      }

      await persistToDatabase(completedSession, 'completed')
      writeCachedSession(STORAGE_KEY, null)
      writeCachedSession(PAUSED_STORAGE_KEY, null)

      set({
        session: null,
        lastPausedSession: null,
        pendingRatingPrompt: false,
        isManageModalOpen: false,
        isSyncing: false,
      })

      // Emit global custom event so dopamine toast & graphs can react
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toggledawn:session-complete', {
            detail: {
              targetTitle: session.target.title,
              durationMinutes: Math.round(session.targetDurationSeconds / 60),
            },
          }),
        )
      }
    },

    // Sync with database on mount/login to retrieve the last paused session
    syncWithDatabase: async () => {
      try {
        const res = await fetch('/api/ops-timer', { credentials: 'include' })
        if (!res.ok) return

        const data = await res.json()
        const docs = data?.docs || []

        let foundPaused: OpsTimerSession | null = null

        for (const doc of docs) {
          if (!doc.description?.startsWith('[OPS_TIMER]')) continue
          try {
            const rawJson = doc.description.replace(/^\[OPS_TIMER\]\s*/, '')
            const parsed = JSON.parse(rawJson)

            if (parsed?.status === 'paused') {
              foundPaused = {
                sessionId: parsed.sessionId || `session-${doc.id}`,
                databaseId: doc.id,
                status: 'paused',
                target: {
                  id: parsed.targetId,
                  type: parsed.targetType || 'custom',
                  title: parsed.targetTitle || 'Strategic Focus Block',
                  subtitle: parsed.targetSubtitle,
                  category: doc.category,
                },
                targetDurationSeconds: (parsed.targetDurationMinutes || 60) * 60,
                currentMode: parsed.currentMode || 'focus',
                blockRemainingSeconds:
                  typeof parsed.blockRemainingSeconds === 'number'
                    ? parsed.blockRemainingSeconds
                    : parsed.currentMode === 'break'
                    ? 300
                    : Math.max(60, 1500 - (parsed.elapsedSeconds % 1500)),
                blockTotalSeconds:
                  typeof parsed.blockTotalSeconds === 'number'
                    ? parsed.blockTotalSeconds
                    : parsed.currentMode === 'break'
                    ? 300
                    : 1500,
                totalElapsedSeconds: parsed.elapsedSeconds || (doc.duration ? doc.duration * 60 : 0),
                currentCycle: parsed.currentCycle || 1,
                pomodorosCompleted: parsed.pomodorosCompleted || 0,
                ratings: parsed.ratings || [],
                startTime: doc.startTime || new Date().toISOString(),
                lastActiveTimestamp: Date.now(),
              }
              break
            }
          } catch {
            // Bad JSON string
          }
        }

        const currentSession = get().session
        const isCurrentlyTicking = currentSession?.status === 'running' || currentSession?.status === 'break'

        if (foundPaused) {
          writeCachedSession(PAUSED_STORAGE_KEY, foundPaused)
          if (!isCurrentlyTicking) {
            writeCachedSession(STORAGE_KEY, foundPaused)
            set({ lastPausedSession: foundPaused, session: foundPaused })
          } else {
            set({ lastPausedSession: foundPaused })
          }
        } else {
          // No paused session in database for this user
          if (!isCurrentlyTicking) {
            writeCachedSession(PAUSED_STORAGE_KEY, null)
            set({ lastPausedSession: null })
          }
        }
      } catch {
        // Backend unavailable or offline
      }
    },

    clearActiveSession: () => {
      writeCachedSession(STORAGE_KEY, null)
      set({ session: null })
    },
  }
})

