'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Plus, AlertCircle, CheckCircle2, ShieldCheck, Flame, CalendarCheck } from 'lucide-react'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useTimeLogStore } from '@/stores/useTimeLogStore'

interface TimeBlock {
  hour: number
  label: string
  category?: 'study' | 'habit' | 'exercise' | 'hobby' | 'rest' | 'work' | null
  title?: string
  duration?: number
}

interface ScheduleViewProps {
  onBackToHome: () => void
  onOpenLogTimeModal: () => void
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onBackToHome,
  onOpenLogTimeModal,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  const [missingHoursAlert, setMissingHoursAlert] = useState(true)

  const { events, fetchEvents, toggleComplete } = useScheduleStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Initialize 24-hour day schedule with fallback defaults
  const [blocks, setBlocks] = useState<TimeBlock[]>(() => {
    const list: TimeBlock[] = []
    for (let i = 0; i < 24; i++) {
      const hStr = `${i.toString().padStart(2, '0')}:00`
      let category: TimeBlock['category'] = null
      let title: string | undefined = undefined

      if (i >= 0 && i < 7) {
        category = 'rest'
        title = 'Sleep & Rest'
      } else if (i === 8 || i === 9) {
        category = 'study'
        title = 'Rotational Dynamics Mastery'
      } else if (i === 11) {
        category = 'habit'
        title = 'Daily Problem Practice'
      } else if (i === 15) {
        category = 'exercise'
        title = 'Cardio & Reset'
      }

      list.push({ hour: i, label: hStr, category, title })
    }
    return list
  })

  // Overlay real events from useScheduleStore onto the 24-hour blocks
  useEffect(() => {
    if (events.length === 0) return

    setBlocks((prev) => {
      const updated = [...prev]
      events.forEach((ev) => {
        if (!ev.startTime) return
        const hour = parseInt(ev.startTime.split(':')[0], 10)
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          updated[hour] = {
            hour,
            label: `${hour.toString().padStart(2, '0')}:00`,
            category: (ev.category as any) || 'study',
            title: ev.title,
          }
        }
      })
      return updated
    })
  }, [events])

  const getCategoryColor = (cat?: TimeBlock['category']) => {
    switch (cat) {
      case 'study':
        return 'border-amber-500/30 bg-amber-500/5 text-amber-300'
      case 'habit':
        return 'border-purple-500/30 bg-purple-500/5 text-purple-300'
      case 'exercise':
        return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
      case 'hobby':
        return 'border-sky-500/30 bg-sky-500/5 text-sky-300'
      case 'rest':
        return 'border-slate-700/50 bg-slate-900/30 text-slate-500'
      default:
        return 'border-[#00f0ff]/5 bg-transparent text-slate-600 hover:border-[#00f0ff]/15 hover:bg-[#00f0ff]/3'
    }
  }

  const handleRetroactiveFill = (hour: number) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.hour === hour
          ? {
              ...b,
              category: 'study',
              title: 'Retroactive Focus Block',
            }
          : b,
      ),
    )
    // Send API log in background using Zustand time log store
    useTimeLogStore.getState().createLog({
      category: 'study',
      duration: 60,
      description: `Retroactive fill for ${hour}:00`,
      isRetroactive: true,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
    })
  }

  const filledCount = blocks.filter((b) => b.category && b.category !== 'rest').length
  const untrackedCount = 24 - blocks.filter((b) => b.category).length

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="hud-card corner-brackets p-4 flex items-center justify-between">
        <div>
          <h2 className="font-hud text-xs sm:text-sm tracking-wider text-[#00f0ff] text-glow-cyan uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            24H OPS TRACKER
          </h2>
          <p className="font-data text-[10px] text-slate-500 mt-0.5">
            One-tap active logging with penalty-free retroactive fill
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="hud-btn px-4 py-1.5 rounded-lg text-[9px] tracking-wider"
        >
          BACK
        </button>
      </div>

      {/* Missing-hour Alert */}
      {missingHoursAlert && untrackedCount > 0 && (
        <div className="hud-card p-3.5 flex items-start justify-between gap-3" style={{ borderColor: 'rgba(245, 158, 11, 0.25)' }}>
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-hud text-[9px] tracking-[2px] text-amber-400 block uppercase">
                {untrackedCount} Missing Hours Detected
              </span>
              <span className="font-body text-[11px] text-slate-400 leading-tight">
                No penalty! Tap any gray slot below for one-touch retroactive fill.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMissingHoursAlert(false)}
            className="font-data text-[10px] text-slate-500 hover:text-[#00f0ff] px-2 py-0.5 rounded-md hover:bg-[#00f0ff]/5 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Streak & Forgiveness Buffer */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="hud-card p-3 flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <span className="font-hud text-[8px] tracking-[2px] text-slate-500 block uppercase">Study Streak</span>
            <span className="font-data text-sm text-amber-400">7 Days Active</span>
          </div>
        </div>

        <div className="hud-card p-3 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <span className="font-hud text-[8px] tracking-[2px] text-slate-500 block uppercase">Forgiveness Buffer</span>
            <span className="font-data text-sm text-emerald-400">1 Buffer Ready</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Timeline */}
      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 hud-scroll">
        {blocks.map((block) => (
          <div
            key={block.hour}
            onClick={() => {
              if (!block.category) {
                handleRetroactiveFill(block.hour)
              }
            }}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${getCategoryColor(block.category)}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-data text-[11px] opacity-60 w-11">{block.label}</span>
              <div>
                <span className="font-body font-medium">
                  {block.title || 'Tap to fill hour block'}
                </span>
                {block.category && (
                  <span className="font-hud text-[7px] tracking-[2px] opacity-60 block uppercase mt-0.5">
                    {block.category}
                  </span>
                )}
              </div>
            </div>

            {block.category ? (
              <CheckCircle2 className="w-4 h-4 opacity-60" />
            ) : (
              <span className="p-1 rounded-md bg-[#00f0ff]/5 text-[#00f0ff]/30 hover:text-[#00f0ff]/60">
                <Plus className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="h-10 sm:h-14" aria-hidden="true" />
    </div>
  )
}
