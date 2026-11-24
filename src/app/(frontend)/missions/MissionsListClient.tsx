'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  Clock,
  CalendarClock,
  ChevronRight,
  Filter,
  Search,
  Flame,
  Crosshair,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface MissionTypeData {
  id: number
  name: string
  presetIcon: string | null
}

interface ProjectData {
  id: number
  title: string
  slug?: string | null
  color: string | null
}

interface TargetConfigData {
  mode: string
  totalTargetHours?: number | null
  dailyTargetHours?: number | null
  weeklyActiveDays?: string[] | null
  hoursPerActiveDay?: number | null
  weeklyTotalTarget?: number | null
}

interface StreakDataData {
  currentStreak: number
  longestStreak: number
  totalFollowed: number
  totalMissed: number
}

interface MissionData {
  id: number
  title: string
  slug?: string | null
  type: string | null
  missionType: MissionTypeData | null
  status: string
  adminStatus: string
  computedProgress: number
  priority: string
  deadline: string | null
  startDate: string | null
  description: string | null
  targetHours: number
  targetConfig: TargetConfigData | null
  streakData: StreakDataData | null
  project: ProjectData | null
  updatedAt: string
  createdAt: string
}

interface TimeLogData {
  id: number
  duration: number
  startTime: string
  mission: number | null
}

interface Props {
  data: {
    missions: MissionData[]
    timeLogs: TimeLogData[]
  }
}

// ─── Constants ────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  planning: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  paused: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'on-hold': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  completed: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  terminated: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'admin-completed': 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
}

const STATUS_TABS = ['all', 'active', 'paused', 'planning', 'completed', 'archived'] as const
const PRIORITY_TABS = ['all', 'critical', 'high', 'medium', 'low'] as const

const PRIORITY_EMOJI: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
}

const PRESET_ICON_EMOJI: Record<string, string> = {
  study: '📚',
  habit: '🏋️',
  hobby: '🎨',
  coding: '💻',
  'lead-gen': '📞',
  writing: '✍️',
  music: '🎵',
  meditation: '🧘',
  communication: '🗣️',
  research: '🔬',
  analytics: '📊',
  general: '🎯',
}

// ─── Helpers ──────────────────────────────────────────────────

function getDeadlineLabel(deadline: string | null | undefined): string | null {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days <= 7) return `${days}d left`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatHours(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getTargetLabel(config: TargetConfigData | null, targetHours: number): string | null {
  if (!config) {
    return targetHours > 0 ? `${targetHours}h total` : null
  }
  switch (config.mode) {
    case 'daily':
      return config.dailyTargetHours ? `${config.dailyTargetHours}h/day` : null
    case 'weekly': {
      const days = config.weeklyActiveDays?.length || 0
      const perDay = config.hoursPerActiveDay || 0
      return days > 0 && perDay > 0 ? `${perDay}h × ${days}d/wk` : null
    }
    case 'time-slots':
      return 'Time-slot schedule'
    case 'total':
      return config.totalTargetHours ? `${config.totalTargetHours}h total` : null
    case 'custom':
      return 'Custom target'
    default:
      return null
  }
}

function getMissionTypeLabel(mission: MissionData): string {
  if (mission.missionType?.name) return mission.missionType.name
  if (mission.type) return mission.type.charAt(0).toUpperCase() + mission.type.slice(1)
  return 'General'
}

function getMissionTypeIcon(mission: MissionData): string {
  if (mission.missionType?.presetIcon && PRESET_ICON_EMOJI[mission.missionType.presetIcon]) {
    return PRESET_ICON_EMOJI[mission.missionType.presetIcon]
  }
  if (mission.type && PRESET_ICON_EMOJI[mission.type]) {
    return PRESET_ICON_EMOJI[mission.type]
  }
  return '🎯'
}

// ─── Component ────────────────────────────────────────────────

export const MissionsListClient: React.FC<Props> = ({ data }) => {
  const { missions, timeLogs } = data
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_TABS)[number]>('all')
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_TABS)[number]>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Enrich missions with time-log data
  const enrichedMissions = useMemo(() => {
    return missions.map((m) => {
      let minutesLogged = 0
      for (const tl of timeLogs) {
        if (tl.mission && String(tl.mission) === String(m.id)) {
          minutesLogged += tl.duration || 0
        }
      }
      return { ...m, minutesLogged }
    })
  }, [missions, timeLogs])

  // Filter
  const filteredMissions = useMemo(() => {
    let list = enrichedMissions
    if (statusFilter !== 'all') {
      list = list.filter((m) => m.status === statusFilter)
    }
    if (priorityFilter !== 'all') {
      list = list.filter((m) => m.priority === priorityFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)),
      )
    }
    return list
  }, [enrichedMissions, statusFilter, priorityFilter, searchQuery])

  // Stats
  const totalMissions = missions.length
  const activeCount = missions.filter((m) => m.status === 'active').length
  const totalMinutesLogged = enrichedMissions.reduce((sum, m) => sum + m.minutesLogged, 0)

  return (
    <div className="hud-bg min-h-screen text-slate-100 font-body">
      <div className="scanline-overlay" />

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-32">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f0ff]/30 hover:bg-white/10 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#00f0ff] transition-colors" />
          <span className="font-hud text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-[#00f0ff] transition-colors">
            Back to Operations
          </span>
        </Link>

        {/* ═══════════════════════════════════ */}
        {/* PAGE HEADER                         */}
        {/* ═══════════════════════════════════ */}
        <div className="hud-card relative overflow-hidden p-5 sm:p-6 mb-6">
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]/40 rounded-tl pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]/40 rounded-br pointer-events-none" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div>
              <h1 className="font-hud text-lg sm:text-xl font-bold text-slate-100 uppercase tracking-wider">
                All Missions
              </h1>
              <span className="font-data text-[9px] text-slate-500 uppercase tracking-wider">
                Mission Control Registry
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <span className="font-data text-lg font-bold text-[#00f0ff] block">
                {totalMissions}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Total Missions
              </span>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <span className="font-data text-lg font-bold text-emerald-300 block">
                {activeCount}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <span className="font-data text-lg font-bold text-amber-300 block">
                {formatHours(totalMinutesLogged)}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Logged (30d)
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* FILTERS + SEARCH                    */}
        {/* ═══════════════════════════════════ */}
        <div className="hud-card p-3.5 sm:p-4 mb-4 space-y-3">
          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-1 overflow-x-auto hud-scroll flex-1">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`font-hud text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40 font-bold'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search missions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-[#00f0ff]/40 font-data text-[11px] text-slate-200 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 overflow-x-auto hud-scroll">
            <Target className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
            {PRIORITY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPriorityFilter(tab)}
                className={`font-hud text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  priorityFilter === tab
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab === 'all' ? 'all priorities' : `${PRIORITY_EMOJI[tab] || ''} ${tab}`}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* MISSION LIST                        */}
        {/* ═══════════════════════════════════ */}
        <div className="space-y-3">
          {filteredMissions.length === 0 ? (
            <div className="hud-card p-8 text-center">
              <Crosshair className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-hud text-[11px] text-slate-400 uppercase tracking-wider">
                {searchQuery
                  ? 'No missions match your search'
                  : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}missions yet`}
              </p>
            </div>
          ) : (
            filteredMissions.map((m) => {
              const deadlineLabel = getDeadlineLabel(m.deadline)
              const isOverdue = m.deadline && new Date(m.deadline).getTime() < Date.now()
              const targetLabel = getTargetLabel(m.targetConfig, m.targetHours)
              const projectColor = m.project?.color || '#00f0ff'

              return (
                <Link key={m.id} href={`/missions/${m.slug || m.id}`} className="group block">
                  <div
                    className="hud-card relative overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.12)] hover:border-[#00f0ff]/40"
                    style={{
                      borderLeftColor: projectColor,
                      borderLeftWidth: '3px',
                    }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-base"
                          style={{
                            backgroundColor: `${projectColor}15`,
                            borderColor: `${projectColor}40`,
                          }}
                        >
                          {getMissionTypeIcon(m)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-hud text-sm sm:text-base font-bold text-slate-100 truncate group-hover:text-[#00f0ff] transition-colors">
                            {m.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {/* Mission type badge */}
                            <span className="font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider bg-purple-500/15 text-purple-300 border-purple-500/30">
                              {getMissionTypeLabel(m)}
                            </span>

                            {/* Status badge */}
                            <span
                              className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[m.status] || STATUS_COLORS.active}`}
                            >
                              {m.status}
                            </span>

                            {/* Admin status badge */}
                            {m.adminStatus && m.adminStatus !== 'none' && (
                              <span
                                className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[m.adminStatus] || STATUS_COLORS.active}`}
                              >
                                {m.adminStatus === 'terminated'
                                  ? '🛑 Terminated'
                                  : '✅ Admin Verified'}
                              </span>
                            )}

                            {/* Priority badge */}
                            <span className="font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider bg-white/5 border-white/10 text-slate-400">
                              {PRIORITY_EMOJI[m.priority] || '🟡'} {m.priority}
                            </span>

                            <span className="font-data text-[8px] text-slate-500">
                              Updated {getRelativeTime(m.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00f0ff] transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Description */}
                    {m.description && (
                      <p className="font-body text-[10px] sm:text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-1">
                        {m.description}
                      </p>
                    )}

                    {/* Metrics row */}
                    <div className="flex items-center gap-4 sm:gap-5 flex-wrap mb-1">
                      {/* Time logged */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#00f0ff]/60" />
                        <span className="font-data text-[10px] text-slate-300 font-bold">
                          {formatHours(m.minutesLogged)}
                        </span>
                        <span className="font-data text-[8px] text-slate-500">logged</span>
                      </div>

                      {/* Target info */}
                      {targetLabel && (
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3 h-3 text-amber-400/60" />
                          <span className="font-data text-[10px] text-amber-300 font-bold">
                            {targetLabel}
                          </span>
                        </div>
                      )}

                      {/* Streak */}
                      {m.streakData && m.streakData.currentStreak > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400/80" />
                          <span className="font-data text-[10px] text-orange-300 font-bold">
                            {m.streakData.currentStreak}
                          </span>
                          <span className="font-data text-[8px] text-slate-500">days</span>
                        </div>
                      )}

                      {/* Deadline */}
                      {deadlineLabel && (
                        <div className="flex items-center gap-1.5">
                          <CalendarClock
                            className={`w-3 h-3 ${isOverdue ? 'text-rose-400/60' : 'text-amber-400/60'}`}
                          />
                          <span
                            className={`font-data text-[10px] font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}
                          >
                            {deadlineLabel}
                          </span>
                        </div>
                      )}

                      {/* Project link */}
                      {m.project && (
                        <Link
                          href={`/projects/${m.project.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: m.project.color || '#00f0ff' }}
                          />
                          <span className="font-hud text-[8px] uppercase tracking-wider text-slate-400 hover:text-[#00f0ff] transition-colors">
                            {m.project.title}
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Progress bar */}
                    {m.computedProgress > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, m.computedProgress)}%`,
                              backgroundColor: projectColor,
                              boxShadow: `0 0 6px ${projectColor}60`,
                            }}
                          />
                        </div>
                        <span className="font-data text-[8px] text-slate-500 w-8 text-right shrink-0">
                          {Math.round(m.computedProgress)}%
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Count footer */}
        <div className="mt-4 text-center">
          <span className="font-data text-[9px] text-slate-500 uppercase tracking-wider">
            Showing {filteredMissions.length} of {totalMissions} missions
          </span>
        </div>
      </div>
    </div>
  )
}
