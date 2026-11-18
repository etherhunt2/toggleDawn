'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { OpsTimerCard } from './OpsTimer/OpsTimerCard'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
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

      {/* ── OPS TIMER (POMODORO AUTOMATION & GOAL TRACKING) ── */}
      <OpsTimerCard onOpenManage={onManageTime} />
    </div>
  )
}
