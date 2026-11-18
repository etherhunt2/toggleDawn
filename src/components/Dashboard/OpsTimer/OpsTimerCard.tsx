'use client'

import React, { useEffect, useState } from 'react'
import {
  Play,
  Pause,
  Sliders,
  LogOut,
  Trash2,
} from 'lucide-react'
import { useOpsTimerStore } from '@/stores/useOpsTimerStore'
import { triggerHaptic } from '@/utilities/timerAudio'

interface OpsTimerCardProps {
  onOpenManage: () => void
}

export const OpsTimerCard: React.FC<OpsTimerCardProps> = ({ onOpenManage }) => {
  const [isMounted, setIsMounted] = useState(false)

  const {
    session,
    lastPausedSession,
    tick,
    pauseSession,
    resumeSession,
    terminateSession,
    quitSession,
    isSyncing,
    initFromStorage,
  } = useOpsTimerStore()

  useEffect(() => {
    setIsMounted(true)
    initFromStorage()
  }, [initFromStorage])

  // Main ticker effect: runs every 1 second when active
  useEffect(() => {
    if (!isMounted) return
    const isTicking = session?.status === 'running' || session?.status === 'break'
    if (!isTicking) return

    const timer = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(timer)
  }, [isMounted, session?.status, tick])

  // Active session or last paused session (evaluated after mount to match SSR initial render)
  const activeSession = isMounted ? session : null
  const isRunning = Boolean(isMounted && activeSession?.status === 'running')
  const isBreak = Boolean(isMounted && activeSession?.status === 'break')
  const isPaused = Boolean(isMounted && (activeSession?.status === 'paused' || (!activeSession && lastPausedSession?.status === 'paused')))
  const displaySession = isMounted ? (activeSession || lastPausedSession) : null

  // Active session condition: running, in break, or paused with a loaded target
  const hasActiveSession = Boolean(displaySession && (isRunning || isBreak || isPaused))

  // Format MM:SS for block remaining time
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60)
    const secs = Math.max(0, totalSec) % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calculate progress percentage of current block
  const blockTotal = displaySession?.blockTotalSeconds || 1500
  const blockRemaining = displaySession?.blockRemainingSeconds || 1500
  const blockProgressPercent = Math.min(
    100,
    Math.max(0, Math.round(((blockTotal - blockRemaining) / blockTotal) * 100)),
  )

  // Overall goal progress
  const totalTargetSec = displaySession?.targetDurationSeconds || 3600
  const totalElapsedSec = displaySession?.totalElapsedSeconds || 0
  const overallProgressPercent = Math.min(
    100,
    Math.max(0, Math.round((totalElapsedSec / totalTargetSec) * 100)),
  )

  return (
    <div className="hud-card relative flex flex-col justify-between p-3.5 sm:p-4 transition-all duration-300">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)] hud-pulse'
                : isBreak
                ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)] hud-pulse'
                : isPaused
                ? 'bg-amber-400'
                : 'bg-slate-600'
            }`}
          />
          <span className="font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] text-slate-300 font-bold truncate">
            {isRunning
              ? 'OPS TIMER // FOCUS'
              : isBreak
              ? 'OPS TIMER // BREAK'
              : isPaused
              ? 'OPS TIMER // PAUSED'
              : 'OPS TIMER'}
          </span>
        </div>

        {/* Sync Telemetry Badge */}
        {isSyncing ? (
          <span className="font-data text-[8px] text-[#00f0ff] uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" /> DB SYNC...
          </span>
        ) : displaySession?.currentCycle && hasActiveSession ? (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
            Cycle {displaySession.currentCycle}
          </span>
        ) : null}
      </div>

      {/* ── TARGET OBJECTIVE PILL ── */}
      {displaySession && hasActiveSession ? (
        <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between gap-2 min-w-0">
          <div className="truncate">
            <span className="font-hud text-[10px] font-bold text-slate-200 block truncate">
              🎯 {displaySession.target.title}
            </span>
            <span className="font-data text-[8px] text-slate-400 block truncate">
              Target: {Math.round(displaySession.targetDurationSeconds / 60)}m ({Math.round(displaySession.totalElapsedSeconds / 60)}m elapsed)
            </span>
          </div>
          <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 uppercase shrink-0">
            {displaySession.target.type}
          </span>
        </div>
      ) : null}

      {/* ── TIMER DIGITAL HUD DISPLAY ── */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 my-1">
        {/* Play / Pause / Resume Button */}
        {isRunning || isBreak ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20)
              pauseSession()
            }}
            className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#f59e0b]/50 bg-[#f59e0b]/15 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all active:scale-95"
            title="Pause Session (Persists to Database)"
          >
            <Pause className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
          </button>
        ) : isPaused ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20)
              resumeSession(displaySession)
            }}
            className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-emerald-500/50 bg-emerald-500/20 shadow-[0_0_16px_rgba(16,185,129,0.3)] hover:shadow-[0_0_24px_rgba(16,185,129,0.45)] transition-all active:scale-95"
            title="Resume Session"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20)
              onOpenManage()
            }}
            className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 shadow-[0_0_14px_rgba(0,240,255,0.2)] hover:shadow-[0_0_22px_rgba(0,240,255,0.35)] transition-all active:scale-95"
            title="Configure & Start Timer"
          >
            <Play className="w-4 h-4 text-[#00f0ff] fill-[#00f0ff] ml-0.5" />
          </button>
        )}

        {/* Time Value + Mode Status */}
        <div className="flex flex-col items-start">
          <span
            className={`font-data text-2xl sm:text-3xl tracking-wider transition-colors duration-300 font-bold ${
              isRunning
                ? 'text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : isBreak
                ? 'text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                : isPaused
                ? 'text-amber-300'
                : 'text-[#00f0ff] text-glow-cyan'
            }`}
          >
            {formatTime(displaySession?.blockRemainingSeconds ?? 1500)}
          </span>
          <span className="font-data text-[8px] uppercase tracking-[2px] text-slate-500">
            {isRunning
              ? 'Focus Sprint (25m)'
              : isBreak
              ? 'Tactical Break (5m)'
              : isPaused
              ? 'Paused In Cache/DB'
              : 'Standby'}
          </span>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      {displaySession && hasActiveSession ? (
        <div className="my-2 space-y-1">
          <div className="w-full h-1.5 rounded-full bg-black/60 border border-white/5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isBreak
                  ? 'bg-gradient-to-r from-emerald-500 to-[#10b981]'
                  : 'bg-gradient-to-r from-[#00f0ff] to-[#f59e0b]'
              }`}
              style={{ width: `${blockProgressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[8px] text-slate-500">
            <span>Block: {blockProgressPercent}%</span>
            <span>Goal: {overallProgressPercent}%</span>
          </div>
        </div>
      ) : null}

      {/* ── CONTROL BUTTONS ── */}
      {hasActiveSession ? (
        /* Active session: Hide Manage button; show Pause/Resume, Quit, and Terminate */
        <div className="flex flex-col gap-2 mt-2">
          {/* Main Action: Pause or Resume */}
          {isRunning || isBreak ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20)
                pauseSession()
              }}
              className="w-full py-1.5 sm:py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] transition-all flex items-center justify-center gap-1.5 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)] active:scale-[0.98]"
              title="Pause current session and update database"
            >
              <Pause className="w-3.5 h-3.5 fill-amber-300" />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20)
                resumeSession(displaySession)
              }}
              className="w-full py-1.5 sm:py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] transition-all flex items-center justify-center gap-1.5 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-[0.98]"
              title="Resume paused session"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              Resume
            </button>
          )}

          {/* Secondary Actions: Quit (Save) & Terminate (Destroy) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                triggerHaptic(20)
                await quitSession()
              }}
              className="py-1.5 sm:py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:text-amber-200 hover:border-amber-500/40 hover:bg-amber-500/20 font-hud text-[9px] sm:text-[10px] uppercase tracking-[1.5px] transition-all flex items-center justify-center gap-1.5 active:scale-95 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              title="Quit early: stops timer immediately and saves all data with start & end timestamps"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              Quit (Save)
            </button>

            <button
              type="button"
              onClick={async () => {
                triggerHaptic(20)
                await terminateSession()
              }}
              className="py-1.5 sm:py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:text-rose-200 hover:border-rose-500/40 hover:bg-rose-500/20 font-hud text-[9px] sm:text-[10px] uppercase tracking-[1.5px] transition-all flex items-center justify-center gap-1.5 active:scale-95 font-bold shadow-[0_0_10px_rgba(244,63,94,0.15)]"
              title="Terminate goal: stops timer immediately and destroys current all logs & related data"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Terminate (Destroy)
            </button>
          </div>
        </div>
      ) : (
        /* Standby / No Active Session: Manage & Start buttons VISIBLE */
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={onOpenManage}
            className="hud-btn py-1.5 sm:py-2 font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3 h-3 text-[#00f0ff]" />
            Manage
          </button>

          <button
            type="button"
            onClick={onOpenManage}
            className="hud-btn py-1.5 sm:py-2 font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3 text-[#00f0ff]" />
            Start
          </button>
        </div>
      )}
    </div>
  )
}

