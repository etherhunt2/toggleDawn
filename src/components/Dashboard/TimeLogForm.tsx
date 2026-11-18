'use client'

import React, { useState } from 'react'
import { Timer, ListChecks, Send } from 'lucide-react'
import { useTimeLogStore } from '@/stores/useTimeLogStore'

const CATEGORIES = [
  'Study',
  'Revision',
  'Test Practice',
  'Reading',
  'Exercise',
  'Hobby',
  'Rest',
] as const

interface TimeLogFormProps {
  onManageTime?: () => void
  onSubmitLog?: (data: any) => void
}

export const TimeLogForm: React.FC<TimeLogFormProps> = ({ onManageTime, onSubmitLog }) => {
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [category, setCategory] = useState<string>('Study')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const calcDuration = (): number => {
    if (!timeFrom || !timeTo) return 0
    const [fh, fm] = timeFrom.split(':').map(Number)
    const [th, tm] = timeTo.split(':').map(Number)
    let diff = (th * 60 + tm) - (fh * 60 + fm)
    if (diff < 0) diff += 24 * 60 // spans midnight
    return diff
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!timeFrom || !timeTo || !category) return

    setSubmitting(true)
    const duration = calcDuration()
    const payload = {
      category: category.toLowerCase(),
      duration,
      description: description || `${category} session`,
      startTime: timeFrom,
      endTime: timeTo,
    }

    try {
      // Create via Zustand time log store
      await useTimeLogStore.getState().createLog(payload as any)
      onSubmitLog?.(payload)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('time-log-added', { detail: payload }))
      }
      setSuccess(true)
      setTimeFrom('')
      setTimeTo('')
      setDescription('')
      setTimeout(() => setSuccess(false), 2000)
    } catch (_e) {}
    setSubmitting(false)
  }

  const duration = calcDuration()

  return (
    <div className="hud-card corner-brackets p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-amber-400" />
          <h3 className="font-hud text-[10px] sm:text-xs tracking-[2px] text-amber-400 text-glow-amber uppercase">
            New Time Log Entry
          </h3>
        </div>
        <span className="stamp-classified" style={{ position: 'static', color: 'rgba(245,158,11,0.4)', borderColor: 'rgba(245,158,11,0.2)' }}>
          OPS LOG
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-hud text-[7px] tracking-[2px] text-amber-400/50 uppercase block mb-1">Time From *</label>
            <input
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className="hud-input w-full rounded-lg px-3 py-2 text-xs"
              required
            />
          </div>
          <div>
            <label className="font-hud text-[7px] tracking-[2px] text-amber-400/50 uppercase block mb-1">Time To *</label>
            <input
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className="hud-input w-full rounded-lg px-3 py-2 text-xs"
              required
            />
          </div>
        </div>

        {duration > 0 && (
          <div className="font-data text-[11px] text-amber-400/70 text-center">
            Duration: {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        )}

        <div>
          <label className="font-hud text-[7px] tracking-[2px] text-amber-400/50 uppercase block mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="hud-input w-full rounded-lg px-3 py-2 text-xs"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-hud text-[7px] tracking-[2px] text-amber-400/50 uppercase block mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Rotational dynamics chapter review"
            className="hud-input w-full rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }}
        >
          <Send className="w-3 h-3" />
          {success ? '// TIME LOGGED //' : submitting ? '// RECORDING... //' : '// LOG TIME //'}
        </button>
      </form>

      <button
        type="button"
        onClick={onManageTime ?? (() => window.open('/super-master/collections/time-logs', '_blank'))}
        className="hud-btn w-full py-2 rounded-lg text-[9px] tracking-wider flex items-center justify-center gap-2"
      >
        <ListChecks className="w-3 h-3" />
        MANAGE ALL TIME LOGS
      </button>
    </div>
  )
}

