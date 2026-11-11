'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, Check } from 'lucide-react'

export interface QuickInputRowProps {
  onSaveQuickNote: (note: string) => void
  onManageTime: () => void
}

export const QuickInputRow: React.FC<QuickInputRowProps> = ({
  onSaveQuickNote,
  onManageTime,
}) => {
  const [quickNote, setQuickNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(1440) // 24m default
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (quickNote.trim()) {
        onSaveQuickNote(quickNote.trim())
        setQuickNote('')
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* ── INTEL CAPTURE ── */}
      <div className="hud-card relative flex flex-col justify-between p-3.5 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.6)] hud-pulse" />
            <span className="font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] text-slate-400">
              Intel Capture
            </span>
          </div>
          {isSaved && (
            <span className="flex items-center gap-1 text-[10px] font-data text-[#10b981] tracking-wider">
              <Check className="w-3 h-3" />
              <span className="uppercase">Logged</span>
            </span>
          )}
        </div>

        {/* Terminal input */}
        <div className="relative">
          {/* Terminal cursor blink line */}
          <div className="absolute top-2.5 left-2.5 w-[2px] h-3 bg-[#10b981]/60 animate-pulse pointer-events-none z-10" />
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// enter intel..."
            className="hud-input w-full h-14 sm:h-16 pl-5 pr-2.5 py-2.5 font-data text-xs text-slate-200 placeholder-slate-600 resize-none"
          />
        </div>

        {/* Footer hint */}
        <div className="flex justify-end mt-1.5">
          <span className="font-data text-[8px] text-slate-600 uppercase tracking-wider">
            ↵ Enter to log
          </span>
        </div>
      </div>

      {/* ── OPS TIMER ── */}
      <div className="hud-card relative flex flex-col justify-between p-3.5 sm:p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isTimerRunning
                ? 'bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.6)] hud-pulse'
                : 'bg-slate-600'
            }`}
          />
          <span className="font-hud text-[9px] sm:text-[10px] uppercase tracking-[2px] text-slate-400">
            Ops Timer
          </span>
        </div>

        {/* Timer display */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Play/Pause button */}
          <button
            type="button"
            onClick={() => setIsTimerRunning((r) => !r)}
            className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all duration-300 ${
              isTimerRunning
                ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 shadow-[0_0_16px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'border-[#00f0ff]/30 bg-[#00f0ff]/5 shadow-[0_0_12px_rgba(0,240,255,0.1)] hover:shadow-[0_0_18px_rgba(0,240,255,0.25)]'
            }`}
            title={isTimerRunning ? 'Pause timer' : 'Start timer'}
          >
            {isTimerRunning ? (
              <Pause className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
            ) : (
              <Play className="w-4 h-4 text-[#00f0ff] fill-[#00f0ff] ml-0.5" />
            )}
          </button>

          {/* Time value */}
          <div className="flex flex-col items-start">
            <span
              className={`font-data text-2xl sm:text-3xl tracking-wider transition-colors duration-300 ${
                isTimerRunning
                  ? 'text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'text-[#00f0ff] text-glow-cyan'
              }`}
            >
              {formatTime(timerSeconds)}
            </span>
            <span className="font-data text-[8px] uppercase tracking-[3px] text-slate-600">
              {isTimerRunning ? 'running' : 'standby'}
            </span>
          </div>
        </div>

        {/* Manage button */}
        <button
          type="button"
          onClick={onManageTime}
          className="hud-btn w-full py-2 sm:py-2.5 font-hud text-[10px] sm:text-xs uppercase tracking-[3px]"
        >
          Manage
        </button>
      </div>
    </div>
  )
}
