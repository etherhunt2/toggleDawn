'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { PieChart as PieIcon, Calendar } from 'lucide-react'
import { useTimeLogStore } from '@/stores/useTimeLogStore'

interface TimeLogEntry {
  category?: string | null
  duration?: number | null
  startTime?: string | null
  endTime?: string | null
}

interface PieChartProps {
  timeLogs?: TimeLogEntry[]
}

const CATEGORY_COLORS: Record<string, { fill: string; label: string }> = {
  study:          { fill: '#f59e0b', label: 'Study' },
  revision:       { fill: '#00f0ff', label: 'Revision' },
  'test practice':{ fill: '#a855f7', label: 'Test Practice' },
  reading:        { fill: '#10b981', label: 'Reading' },
  exercise:       { fill: '#22c55e', label: 'Exercise' },
  hobby:          { fill: '#0ea5e9', label: 'Hobby' },
  rest:           { fill: '#64748b', label: 'Rest' },
  work:           { fill: '#ef4444', label: 'Work' },
}

function getColor(cat: string): { fill: string; label: string } {
  const key = cat.toLowerCase()
  return CATEGORY_COLORS[key] || { fill: '#94a3b8', label: cat }
}

const getTodayDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const PieChartComponent: React.FC<PieChartProps> = ({ timeLogs: propLogs }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString)
  const [fetchedLogs, setFetchedLogs] = useState<TimeLogEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const storeLogs = useTimeLogStore((s) => s.logs)

  const fetchLogsForDate = useCallback(async (date: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/time-logs?date=${date}`)
      const data = await res.json()
      if (data.docs) {
        setFetchedLogs(data.docs)
      }
    } catch (_e) {
      setFetchedLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Listen for time-log-added events across the dashboard
  useEffect(() => {
    const handleLogAdded = () => {
      fetchLogsForDate(selectedDate)
    }
    window.addEventListener('time-log-added', handleLogAdded)
    return () => {
      window.removeEventListener('time-log-added', handleLogAdded)
    }
  }, [selectedDate, fetchLogsForDate])

  // When date changes or store logs change, refresh logs for that date
  useEffect(() => {
    fetchLogsForDate(selectedDate)
  }, [selectedDate, storeLogs.length, fetchLogsForDate])

  // Determine active logs: prefer fetched logs for selectedDate; fallback to storeLogs or propLogs
  const activeLogs = useMemo(() => {
    if (fetchedLogs !== null && fetchedLogs.length > 0) {
      return fetchedLogs
    }
    // Filter storeLogs by selectedDate
    const fromStore = storeLogs.filter((log) => {
      if (!log.startTime) return false
      return log.startTime.startsWith(selectedDate)
    })
    if (fromStore.length > 0) return fromStore

    if (!propLogs || propLogs.length === 0) return fetchedLogs || []
    const filtered = propLogs.filter((log) => {
      if (!log.startTime) return true
      return log.startTime.startsWith(selectedDate)
    })
    return filtered.length > 0 ? filtered : propLogs
  }, [fetchedLogs, storeLogs, propLogs, selectedDate])

  // Aggregate by category
  const segments = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of activeLogs) {
      const cat = (log.category || 'other').toLowerCase()
      const dur = log.duration || 0
      map.set(cat, (map.get(cat) || 0) + dur)
    }
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0)
    if (total === 0) return []

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, dur]) => ({
        category: cat,
        duration: dur,
        percentage: Math.round((dur / total) * 100),
        ...getColor(cat),
      }))
  }, [activeLogs])

  const total = useMemo(() => segments.reduce((a, b) => a + b.duration, 0), [segments])

  // Build SVG pie paths or circle
  const renderPieVisual = () => {
    if (segments.length === 0) return null

    const cx = 80
    const cy = 80
    const r = 70

    // Single segment: SVG elliptical arc start==end causes browsers not to draw; use circle instead
    if (segments.length === 1) {
      const seg = segments[0]
      return (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={seg.fill}
          opacity={0.85}
          stroke="rgba(3,7,18,0.5)"
          strokeWidth={1.5}
        >
          <title>{`${seg.label}: 100%`}</title>
        </circle>
      )
    }

    let cumAngle = -90 // start from top

    return segments.map((seg, i) => {
      const angle = (seg.duration / total) * 360
      const startAngle = cumAngle
      const endAngle = cumAngle + angle
      cumAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = cx + r * Math.cos(startRad)
      const y1 = cy + r * Math.sin(startRad)
      const x2 = cx + r * Math.cos(endRad)
      const y2 = cy + r * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

      return (
        <path
          key={i}
          d={d}
          fill={seg.fill}
          opacity={0.85}
          stroke="rgba(3,7,18,0.5)"
          strokeWidth={1.5}
        >
          <title>{`${seg.label}: ${seg.percentage}%`}</title>
        </path>
      )
    })
  }

  return (
    <div className="hud-card corner-brackets p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-[#00f0ff]" />
          <h3 className="font-hud text-[10px] sm:text-xs tracking-[2px] text-[#00f0ff] text-glow-cyan uppercase">
            Time Distribution
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#00f0ff]/40" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            suppressHydrationWarning
            className="hud-input rounded-lg px-2.5 py-1 text-[10px] font-data w-[130px]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="font-data text-xs text-[#00f0ff]/40 animate-pulse">{'// LOADING DATA... //'}</span>
        </div>
      ) : segments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <PieIcon className="w-8 h-8 text-slate-700 mb-2" />
          <span className="font-data text-xs text-slate-500">No time logs for this date</span>
          <span className="font-body text-[10px] text-slate-600 mt-0.5">Log some time to see your distribution</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* SVG Pie */}
          <div className="relative shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-[0_0_12px_rgba(0,240,255,0.1)]">
              {renderPieVisual()}
              {/* Center hole for donut effect */}
              <circle cx="80" cy="80" r="35" fill="rgba(3,7,18,0.9)" stroke="rgba(0,240,255,0.08)" strokeWidth="1" />
              <text x="80" y="76" textAnchor="middle" className="font-data" fill="#00f0ff" fontSize="14" opacity="0.9">
                {Math.round(total / 60)}h
              </text>
              <text x="80" y="92" textAnchor="middle" className="font-hud" fill="rgba(148,163,184,0.5)" fontSize="6" letterSpacing="1.5">
                TOTAL
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 w-full">
            {segments.map((seg) => (
              <div key={seg.category} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: seg.fill, boxShadow: `0 0 6px ${seg.fill}40` }}
                />
                <div className="min-w-0">
                  <span className="font-body text-[11px] text-slate-300 block truncate">{seg.label}</span>
                  <span className="font-data text-[10px] text-slate-500">
                    {Math.round(seg.duration / 60)}h {seg.duration % 60}m — {seg.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
