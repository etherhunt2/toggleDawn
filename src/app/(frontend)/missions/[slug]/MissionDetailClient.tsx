'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  Clock,
  TrendingUp,
  CalendarClock,
  Layers,
  FileText,
  Zap,
  CheckCircle2,
  Pause,
  ShieldAlert,
  Flame,
  Calendar,
  ListChecks,
  Network,
  AlignLeft,
  Edit3,
  FolderKanban,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Crosshair,
} from 'lucide-react'

// ─── Interfaces ────────────────────────────────────────────────

interface MissionDetailData {
  mission: {
    id: number
    title: string
    slug?: string | null
    description?: string | null
    type?: string | null
    missionType?: {
      id: number
      name: string | null
      presetIcon?: string | null
      description?: string | null
    } | null
    status: string
    adminStatus?: string | null
    computedProgress?: number | null
    adminForcedProgress?: number | null
    priority?: string | null
    deadline?: string | null
    startDate?: string | null
    notes?: string | null
    targetHours?: number | null
    targetConfig?: {
      mode: string
      totalTargetHours?: number | null
      dailyTargetHours?: number | null
      weeklyActiveDays?: string[] | null
      hoursPerActiveDay?: number | null
      weeklyTotalTarget?: number | null
      timeSlots?: Array<{
        slotName: string
        customSlotLabel?: string | null
        targetMinutes: number
        startHour?: number | null
        endHour?: number | null
      }> | null
      customTargetDescription?: string | null
    } | null
    streakData?: {
      currentStreak?: number | null
      longestStreak?: number | null
      totalFollowed?: number | null
      totalMissed?: number | null
      streakHistory?: any[] | null
    } | null
    project?: {
      id: number
      title: string | null
      slug?: string | null
      color: string | null
    } | null
    createdAt: string
    updatedAt: string
  }
  timeLogs: Array<{
    id: number
    category: string
    duration: number
    startTime: string
    endTime?: string | null
    description?: string | null
    mission: number | null
  }>
  planners: Array<{
    id: number
    title: string
    description?: string | null
    planType: string
    status: string
    color: string
    sortOrder: number
  }>
  recentNotes: Array<{
    id: number
    title: string
    updatedAt: string
  }>
  recentFlashCards: Array<{
    id: number
    title: string
    updatedAt: string
  }>
}

interface Props {
  data: MissionDetailData
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

const PLANNER_TYPE_ICONS: Record<string, React.ReactNode> = {
  checklist: <ListChecks className="w-3.5 h-3.5 text-emerald-400" />,
  outline: <AlignLeft className="w-3.5 h-3.5 text-blue-400" />,
  mindmap: <Network className="w-3.5 h-3.5 text-purple-400" />,
  freeform: <Edit3 className="w-3.5 h-3.5 text-amber-400" />,
}

const SLOT_ICONS: Record<string, React.ReactNode> = {
  morning: <Sunrise className="w-3.5 h-3.5 text-amber-300" />,
  afternoon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
  evening: <Sunset className="w-3.5 h-3.5 text-rose-400" />,
  night: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
  custom: <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />,
}

// ─── Helpers ──────────────────────────────────────────────────

function formatHours(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

// ─── Component ────────────────────────────────────────────────

export const MissionDetailClient: React.FC<Props> = ({ data }) => {
  const { mission, timeLogs, planners, recentNotes, recentFlashCards } = data

  const projectColor = mission.project?.color || '#00f0ff'

  // Weekly breakdown (last 7 days)
  const weeklyBreakdown = useMemo(() => {
    const days: { label: string; minutes: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const minutesForDay = timeLogs
        .filter((tl) => {
          const logDate = new Date(tl.startTime)
          return logDate >= dayStart && logDate < dayEnd
        })
        .reduce((sum, tl) => sum + (tl.duration || 0), 0)

      days.push({ label: dayStr, minutes: minutesForDay })
    }
    return days
  }, [timeLogs])

  const totalMinutesLast7Days = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return timeLogs
      .filter((tl) => new Date(tl.startTime) >= sevenDaysAgo)
      .reduce((sum, tl) => sum + (tl.duration || 0), 0)
  }, [timeLogs])

  const totalMinutesAllTime = useMemo(() => {
    return timeLogs.reduce((sum, tl) => sum + (tl.duration || 0), 0)
  }, [timeLogs])

  const maxBarMinutes = Math.max(...weeklyBreakdown.map((d) => d.minutes), 1)

  // Deadline calculation
  const deadlineDays = mission.deadline
    ? Math.ceil((new Date(mission.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Progress computation
  const overallProgress = mission.computedProgress ?? 0

  // Mission type display
  const missionTypeName =
    mission.missionType?.name ||
    (mission.type ? mission.type.charAt(0).toUpperCase() + mission.type.slice(1) : 'Mission')
  const missionTypeEmoji =
    (mission.missionType?.presetIcon && PRESET_ICON_EMOJI[mission.missionType.presetIcon]) ||
    (mission.type && PRESET_ICON_EMOJI[mission.type]) ||
    '🎯'

  // Streak metrics
  const streak = mission.streakData
  const streakFollowed = streak?.totalFollowed || 0
  const streakMissed = streak?.totalMissed || 0
  const totalStreakDays = streakFollowed + streakMissed
  const consistencyPercent =
    totalStreakDays > 0 ? Math.round((streakFollowed / totalStreakDays) * 100) : 0

  return (
    <div className="hud-bg min-h-screen text-slate-100 font-body">
      <div className="scanline-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-32">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/missions"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f0ff]/30 hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#00f0ff] transition-colors" />
            <span className="font-hud text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-[#00f0ff] transition-colors">
              Back to All Missions
            </span>
          </Link>

          {mission.project && (
            <Link
              href={`/projects/${mission.project.slug || mission.project.id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-all"
            >
              <FolderKanban
                className="w-3.5 h-3.5"
                style={{ color: projectColor }}
              />
              <span className="font-hud text-[10px] uppercase tracking-wider text-slate-300">
                {mission.project.title || `Project #${mission.project.id}`}
              </span>
            </Link>
          )}
        </div>

        {/* ═════════════════════════════════════ */}
        {/* ADMIN OVERRIDE BANNER                 */}
        {/* ═════════════════════════════════════ */}
        {mission.adminStatus && mission.adminStatus !== 'none' && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${
              mission.adminStatus === 'terminated'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-hud text-[10px] uppercase tracking-[2px] font-bold block">
                {mission.adminStatus === 'terminated'
                  ? '🛑 Admin Force-Terminated'
                  : '✅ Admin Verified Complete'}
              </span>
              <span className="font-data text-[9px] opacity-70">
                {mission.adminStatus === 'terminated'
                  ? 'This mission has been forcefully terminated by an administrator.'
                  : 'An administrator has officially marked this mission as verified complete.'}
              </span>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════ */}
        {/* MISSION HEADER CARD                   */}
        {/* ═════════════════════════════════════ */}
        <div
          className="hud-card relative overflow-hidden p-5 sm:p-6 mb-6"
          style={{
            borderLeftColor: projectColor,
            borderLeftWidth: '4px',
          }}
        >
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]/40 rounded-tl pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]/40 rounded-br pointer-events-none" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border text-xl"
                style={{
                  backgroundColor: `${projectColor}15`,
                  borderColor: `${projectColor}40`,
                }}
              >
                {missionTypeEmoji}
              </div>
              <div className="min-w-0">
                <h1 className="font-hud text-xl sm:text-2xl font-bold text-slate-100 truncate">
                  {mission.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {/* Mission Type Badge */}
                  <span className="font-hud text-[8px] px-2 py-0.5 rounded border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] uppercase tracking-wider">
                    {missionTypeEmoji} {missionTypeName}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`font-hud text-[8px] px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[mission.status] || STATUS_COLORS.active}`}
                  >
                    {mission.status}
                  </span>

                  {/* Admin Badge */}
                  {mission.adminStatus && mission.adminStatus !== 'none' && (
                    <span
                      className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[mission.adminStatus] || STATUS_COLORS.active}`}
                    >
                      {mission.adminStatus === 'terminated' ? '🛑 Terminated' : '✅ Admin Verified'}
                    </span>
                  )}

                  {/* Priority */}
                  {mission.priority && (
                    <span className="font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider bg-white/5 border-white/10 text-slate-400">
                      {mission.priority === 'critical'
                        ? '🔴'
                        : mission.priority === 'high'
                        ? '🟠'
                        : mission.priority === 'medium'
                        ? '🟡'
                        : '🟢'}{' '}
                      {mission.priority}
                    </span>
                  )}

                  <span className="font-data text-[9px] text-slate-500">
                    Created {formatDate(mission.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {mission.description && (
            <p className="font-body text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              {mission.description}
            </p>
          )}

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <Clock className="w-4 h-4 text-[#00f0ff]/70 mx-auto mb-1.5" />
              <span className="font-data text-lg font-bold text-[#00f0ff] block">
                {formatHours(totalMinutesLast7Days)}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Last 7 Days
              </span>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-400/70 mx-auto mb-1.5" />
              <span className="font-data text-lg font-bold text-emerald-300 block">
                {formatHours(totalMinutesAllTime)}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Total Logged
              </span>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <Flame className="w-4 h-4 text-amber-400/70 mx-auto mb-1.5" />
              <span className="font-data text-lg font-bold text-amber-300 block">
                {streak?.currentStreak || 0}d
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Current Streak
              </span>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <CalendarClock className="w-4 h-4 text-purple-400/70 mx-auto mb-1.5" />
              <span
                className={`font-data text-lg font-bold block ${
                  deadlineDays !== null && deadlineDays < 0
                    ? 'text-rose-400'
                    : deadlineDays !== null && deadlineDays <= 7
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {deadlineDays !== null
                  ? deadlineDays < 0
                    ? `${Math.abs(deadlineDays)}d over`
                    : `${deadlineDays}d`
                  : '—'}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                {deadlineDays !== null && deadlineDays < 0 ? 'Overdue' : 'Deadline'}
              </span>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-data text-[9px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-[#00f0ff]" />
                Computed Progress
                {mission.adminForcedProgress !== null && mission.adminForcedProgress !== undefined && (
                  <span className="text-[7px] text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/30 uppercase">
                    Admin Forced
                  </span>
                )}
              </span>
              <span className="font-data text-[10px] text-slate-300 font-bold">
                {overallProgress}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-black/60 border border-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${overallProgress}%`,
                  backgroundColor: projectColor,
                  boxShadow: `0 0 10px ${projectColor}60`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════ */}
        {/* TARGET SCHEDULE CONFIGURATION         */}
        {/* ═════════════════════════════════════ */}
        {mission.targetConfig && (
          <div className="hud-card p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500/60 rounded-full" />
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
                  Target Schedule Configuration
                </span>
              </div>
              <span className="font-hud text-[8px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase tracking-wider">
                Mode: {mission.targetConfig.mode}
              </span>
            </div>

            {/* DAILY MODE */}
            {mission.targetConfig.mode === 'daily' && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-hud text-[10px] text-slate-200 uppercase font-bold block">
                    Daily Focus Goal
                  </span>
                  <span className="font-data text-[9px] text-slate-500">
                    Target every single day without interruption
                  </span>
                </div>
                <span className="font-data text-xl font-bold text-amber-300">
                  {mission.targetConfig.dailyTargetHours || 1}h / day
                </span>
              </div>
            )}

            {/* WEEKLY MODE */}
            {mission.targetConfig.mode === 'weekly' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                  <div>
                    <span className="font-hud text-[10px] text-slate-200 uppercase font-bold block">
                      Weekly Strike Rate
                    </span>
                    <span className="font-data text-[9px] text-slate-500">
                      {mission.targetConfig.hoursPerActiveDay || 0}h per active day
                    </span>
                  </div>
                  <span className="font-data text-xl font-bold text-emerald-300">
                    {mission.targetConfig.weeklyTotalTarget ||
                      (mission.targetConfig.hoursPerActiveDay || 0) *
                        (mission.targetConfig.weeklyActiveDays?.length || 0)}
                    h / week
                  </span>
                </div>

                {/* Days of week selector preview */}
                <div className="grid grid-cols-7 gap-1.5">
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                    const isActive = mission.targetConfig?.weeklyActiveDays?.includes(day)
                    return (
                      <div
                        key={day}
                        className={`p-2 rounded-lg text-center border transition-all ${
                          isActive
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-black/20 border-white/5 text-slate-600'
                        }`}
                      >
                        <span className="font-hud text-[8px] uppercase tracking-wider block">
                          {day}
                        </span>
                        <span className="font-data text-[7px] mt-0.5 block">
                          {isActive ? `${mission.targetConfig?.hoursPerActiveDay}h` : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TIME-SLOTS MODE */}
            {mission.targetConfig.mode === 'time-slots' && (
              <div className="space-y-2">
                <p className="font-data text-[10px] text-slate-400 mb-2">
                  Scheduled time-blocks for optimal executive functioning:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(mission.targetConfig.timeSlots || []).map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                          {SLOT_ICONS[slot.slotName] || <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />}
                        </div>
                        <div>
                          <span className="font-hud text-[10px] text-slate-200 uppercase font-bold block">
                            {slot.customSlotLabel || slot.slotName}
                          </span>
                          {(slot.startHour !== null || slot.endHour !== null) && (
                            <span className="font-data text-[8px] text-slate-500">
                              {slot.startHour !== null ? `${slot.startHour}:00` : ''} -{' '}
                              {slot.endHour !== null ? `${slot.endHour}:00` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-data text-sm font-bold text-[#00f0ff]">
                        {slot.targetMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOTAL MODE */}
            {mission.targetConfig.mode === 'total' && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-hud text-[10px] text-slate-200 uppercase font-bold block">
                    Total Hours Objective
                  </span>
                  <span className="font-data text-[9px] text-slate-500">
                    Cumulative focus time across all operational sessions
                  </span>
                </div>
                <span className="font-data text-xl font-bold text-[#00f0ff]">
                  {mission.targetConfig.totalTargetHours || mission.targetHours || 0}h
                </span>
              </div>
            )}

            {/* CUSTOM MODE */}
            {mission.targetConfig.mode === 'custom' && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                <span className="font-hud text-[9px] text-slate-400 uppercase tracking-wider block mb-1">
                  Custom Strategy Notes:
                </span>
                <p className="font-body text-xs text-slate-300 leading-relaxed">
                  {mission.targetConfig.customTargetDescription || 'Custom scheduling rules apply.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════ */}
        {/* STREAK & CONSISTENCY CARD             */}
        {/* ═════════════════════════════════════ */}
        {streak && ((streak.totalFollowed ?? 0) > 0 || (streak.totalMissed ?? 0) > 0 || (streak.currentStreak ?? 0) > 0) && (
          <div className="hud-card p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
                  Strike Rate & Consistency Scorecard
                </span>
              </div>
              <span className="font-data text-xs text-amber-300 font-bold">
                {consistencyPercent}% Consistency
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="font-data text-lg font-bold text-amber-400 block">
                  {streak.currentStreak || 0}
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Active Days Streak
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="font-data text-lg font-bold text-purple-400 block">
                  {streak.longestStreak || 0}
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Record Streak
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="font-data text-lg font-bold text-emerald-400 block">
                  {streak.totalFollowed || 0}
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Days Followed
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="font-data text-lg font-bold text-rose-400 block">
                  {streak.totalMissed || 0}
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Days Cheated / Missed
                </span>
              </div>
            </div>

            {/* Visual ratio bar */}
            {totalStreakDays > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1 text-[8px] font-data text-slate-400">
                  <span>Followed: {streakFollowed}d</span>
                  <span>Missed: {streakMissed}d</span>
                </div>
                <div className="h-1.5 rounded-full bg-rose-500/40 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-400 rounded-l"
                    style={{ width: `${consistencyPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════ */}
        {/* WEEKLY ACTIVITY CHART                 */}
        {/* ═════════════════════════════════════ */}
        <div className="hud-card p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#00f0ff]/60 rounded-full" />
            <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
              Weekly Activity (Focus Hours)
            </span>
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2 h-28 sm:h-32">
            {weeklyBreakdown.map((day, i) => {
              const heightPercent = maxBarMinutes > 0 ? (day.minutes / maxBarMinutes) * 100 : 0

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-data text-[8px] text-slate-400">
                    {day.minutes > 0 ? formatHours(day.minutes) : ''}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${Math.max(heightPercent, 4)}%`,
                        backgroundColor:
                          day.minutes > 0 ? projectColor : 'rgba(255,255,255,0.05)',
                        boxShadow:
                          day.minutes > 0 ? `0 0 8px ${projectColor}40` : 'none',
                        minHeight: '4px',
                      }}
                    />
                  </div>
                  <span className="font-data text-[9px] text-slate-500">{day.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═════════════════════════════════════ */}
        {/* MISSION PLANNERS                      */}
        {/* ═════════════════════════════════════ */}
        <div className="hud-card p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-500/60 rounded-full" />
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
                Mission Planners
              </span>
              <span className="font-data text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                {planners.length}
              </span>
            </div>
          </div>

          {planners.length === 0 ? (
            <p className="font-data text-[11px] text-slate-500 text-center py-6">
              No tactical planners linked to this mission yet. Create checklists, mind-maps, or outlines in the admin panel.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planners.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-purple-500/30 transition-all"
                  style={{ borderLeftColor: p.color || '#00f0ff', borderLeftWidth: '3px' }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {PLANNER_TYPE_ICONS[p.planType] || <ListChecks className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="font-hud text-[11px] text-slate-200 font-bold truncate">
                        {p.title}
                      </span>
                    </div>
                    <span className="font-hud text-[7px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 uppercase">
                      {p.planType}
                    </span>
                  </div>
                  {p.description && (
                    <p className="font-body text-[10px] text-slate-400 line-clamp-2 mb-2">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[8px] font-data text-slate-500">
                    <span className="uppercase tracking-wider">Status: {p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════ */}
        {/* RECENT NOTES & FLASH CARDS            */}
        {/* ═════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Notes */}
          <div className="hud-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
                Related Notes
              </span>
            </div>
            {recentNotes.length === 0 ? (
              <p className="font-data text-[10px] text-slate-500 text-center py-4">
                No notes captured yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {recentNotes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-black/30 border border-white/5"
                  >
                    <span className="font-body text-[11px] text-slate-300 truncate">
                      {n.title}
                    </span>
                    <span className="font-data text-[8px] text-slate-500 shrink-0">
                      {getRelativeTime(n.updatedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flash Cards */}
          <div className="hud-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
                Flash Cards
              </span>
            </div>
            {recentFlashCards.length === 0 ? (
              <p className="font-data text-[10px] text-slate-500 text-center py-4">
                No flash cards active yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {recentFlashCards.map((fc) => (
                  <div
                    key={fc.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-black/30 border border-white/5"
                  >
                    <span className="font-body text-[11px] text-slate-300 truncate">
                      {fc.title}
                    </span>
                    <span className="font-data text-[8px] text-slate-500 shrink-0">
                      {getRelativeTime(fc.updatedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════ */}
        {/* RECENT TIME LOGS                      */}
        {/* ═════════════════════════════════════ */}
        <div className="hud-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-amber-500/60 rounded-full" />
            <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
              Mission Time Logs
            </span>
          </div>

          {timeLogs.length === 0 ? (
            <p className="font-data text-[11px] text-slate-500 text-center py-6">
              No time logs recorded for this mission yet. Start an OPS timer session to log focused time!
            </p>
          ) : (
            <div
              className="overflow-y-auto hud-scroll border border-white/10 rounded-xl bg-black/20"
              style={{ maxHeight: '240px' }}
            >
              <div className="divide-y divide-white/5">
                {timeLogs.slice(0, 20).map((tl) => (
                  <div
                    key={tl.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <span className="font-body text-[11px] text-slate-300 block truncate">
                        {tl.description || tl.category}
                      </span>
                      <span className="font-data text-[8px] text-slate-500">
                        {getRelativeTime(tl.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-data text-[10px] font-bold text-[#00f0ff]">
                        {formatHours(tl.duration)}
                      </span>
                      <span className="font-hud text-[7px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 uppercase">
                        {tl.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
