'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  FolderKanban,
  Clock,
  Layers,
  Target,
  CalendarClock,
  FileText,
  Zap,
  TrendingUp,
  CheckCircle2,
  Pause,
  AlertTriangle,
  Video,
  ShieldAlert,
} from 'lucide-react'

interface ProjectDetailData {
  project: {
    id: number
    title: string
    description?: string | null
    status: string
    adminStatus?: string | null
    deadline?: string | null
    color?: string | null
    priority?: string | null
    computedProgress?: number | null
    featuredImage?: { url?: string | null; alt?: string | null } | null
    videoResource?: { url?: string | null } | null
    videoTitle?: string | null
    createdAt: string
    updatedAt: string
  }
  missions: Array<{
    id: number
    title: string
    type: string
    status: string
    targetHours: number
    description?: string | null
  }>
  timeLogs: Array<{
    id: number
    category: string
    duration: number
    startTime: string
    endTime: string
    description?: string | null
    mission: number | null
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
  data: ProjectDetailData
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  planning: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'on-hold': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  completed: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  paused: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  terminated: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'admin-completed': 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
}

const MISSION_TYPE_ICONS: Record<string, React.ReactNode> = {
  study: <FileText className="w-3.5 h-3.5 text-blue-400" />,
  habit: <Zap className="w-3.5 h-3.5 text-purple-400" />,
  hobby: <Target className="w-3.5 h-3.5 text-emerald-400" />,
}

const MISSION_STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <TrendingUp className="w-3 h-3 text-emerald-400" />,
  paused: <Pause className="w-3 h-3 text-amber-400" />,
  completed: <CheckCircle2 className="w-3 h-3 text-[#00f0ff]" />,
}

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

export const ProjectDetailClient: React.FC<Props> = ({ data }) => {
  const { project, missions, timeLogs, recentNotes, recentFlashCards } = data

  // Compute weekly breakdown (last 7 days)
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

  const totalHoursLast7Days = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return timeLogs
      .filter((tl) => new Date(tl.startTime) >= sevenDaysAgo)
      .reduce((sum, tl) => sum + (tl.duration || 0), 0)
  }, [timeLogs])

  const totalHoursAllTime = useMemo(() => {
    return timeLogs.reduce((sum, tl) => sum + (tl.duration || 0), 0)
  }, [timeLogs])

  const totalTargetHours = missions.reduce((sum, m) => sum + (m.targetHours || 0), 0)

  const locallyComputedProgress =
    totalTargetHours > 0
      ? Math.min(100, Math.round((totalHoursAllTime / 60 / totalTargetHours) * 100))
      : 0

  // Prefer server-computed progress; fall back to local calculation
  const overallProgress = project.computedProgress != null && project.computedProgress > 0
    ? project.computedProgress
    : locallyComputedProgress

  const maxBarMinutes = Math.max(...weeklyBreakdown.map((d) => d.minutes), 1)

  // Deadline calculations
  const deadlineDays = project.deadline
    ? Math.ceil(
        (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : null

  return (
    <div className="hud-bg min-h-screen text-slate-100 font-body">
      <div className="scanline-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-32">
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

        {/* ═════════════════════════════════════ */}
        {/* FEATURED IMAGE BANNER                 */}
        {/* ═════════════════════════════════════ */}
        {project.featuredImage?.url && (
          <div className="hud-card overflow-hidden mb-6 relative rounded-2xl">
            <img
              src={project.featuredImage.url}
              alt={project.featuredImage.alt || project.title}
              className="w-full h-48 sm:h-64 object-cover"
              style={{ display: 'block' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            {/* HUD corner decorations */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00f0ff]/60 rounded-tl pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00f0ff]/60 rounded-br pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="font-hud text-[8px] uppercase tracking-[2px] text-[#00f0ff]/70">
                Featured Image
              </span>
              <span className="font-data text-[8px] text-slate-400 uppercase tracking-wider">
                {project.title}
              </span>
            </div>
          </div>
        )}

        {/* Admin Terminated / Admin Completed Banner */}
        {project.adminStatus && project.adminStatus !== 'none' && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${
              project.adminStatus === 'terminated'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-hud text-[10px] uppercase tracking-[2px] font-bold block">
                {project.adminStatus === 'terminated' ? '🛑 Admin Force-Terminated' : '✅ Admin Verified Complete'}
              </span>
              <span className="font-data text-[9px] opacity-70">
                {project.adminStatus === 'terminated'
                  ? 'This project has been forcefully terminated by an administrator.'
                  : 'An administrator has verified this project as completed.'}
              </span>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════ */}
        {/* PROJECT HEADER                        */}
        {/* ═════════════════════════════════════ */}
        <div
          className="hud-card relative overflow-hidden p-5 sm:p-6 mb-6"
          style={{
            borderLeftColor: project.color || '#00f0ff',
            borderLeftWidth: '4px',
          }}
        >
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]/40 rounded-tl pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]/40 rounded-br pointer-events-none" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${project.color || '#00f0ff'}15`,
                  borderColor: `${project.color || '#00f0ff'}40`,
                }}
              >
                <FolderKanban
                  className="w-6 h-6"
                  style={{ color: project.color || '#00f0ff' }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-hud text-xl sm:text-2xl font-bold text-slate-100 truncate">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`font-hud text-[8px] px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}
                  >
                    {project.status}
                  </span>
                  {project.adminStatus && project.adminStatus !== 'none' && (
                    <span
                      className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[project.adminStatus] || STATUS_COLORS.active}`}
                    >
                      {project.adminStatus === 'terminated' ? '🛑 Terminated' : '✅ Admin Verified'}
                    </span>
                  )}
                  {project.priority && (
                    <span className="font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider bg-white/5 border-white/10 text-slate-400">
                      {project.priority === 'critical' ? '🔴' : project.priority === 'high' ? '🟠' : project.priority === 'medium' ? '🟡' : '🟢'} {project.priority}
                    </span>
                  )}
                  <span className="font-data text-[9px] text-slate-500">
                    Created {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {project.description && (
            <p className="font-body text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              {project.description}
            </p>
          )}

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <Clock className="w-4 h-4 text-[#00f0ff]/70 mx-auto mb-1.5" />
              <span className="font-data text-lg font-bold text-[#00f0ff] block">
                {formatHours(totalHoursLast7Days)}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Last 7 Days
              </span>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-400/70 mx-auto mb-1.5" />
              <span className="font-data text-lg font-bold text-emerald-300 block">
                {formatHours(totalHoursAllTime)}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Total Logged
              </span>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <Layers className="w-4 h-4 text-purple-400/70 mx-auto mb-1.5" />
              <span className="font-data text-lg font-bold text-purple-300 block">
                {missions.length}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Missions
              </span>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <CalendarClock className="w-4 h-4 text-amber-400/70 mx-auto mb-1.5" />
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
          {(totalTargetHours > 0 || (project.computedProgress ?? 0) > 0) && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-data text-[9px] text-slate-400 uppercase tracking-wider">
                  Overall Progress
                </span>
                <span className="font-data text-[10px] text-slate-300 font-bold">
                  {overallProgress}%
                  {totalTargetHours > 0 && ` (${formatHours(totalHoursAllTime)} / ${totalTargetHours}h)`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${overallProgress}%`,
                    backgroundColor: project.color || '#00f0ff',
                    boxShadow: `0 0 10px ${project.color || '#00f0ff'}60`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════ */}
        {/* WEEKLY ACTIVITY CHART                 */}
        {/* ═════════════════════════════════════ */}
        <div className="hud-card p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#00f0ff]/60 rounded-full" />
            <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
              Weekly Activity
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
                          day.minutes > 0
                            ? project.color || '#00f0ff'
                            : 'rgba(255,255,255,0.05)',
                        boxShadow:
                          day.minutes > 0
                            ? `0 0 8px ${project.color || '#00f0ff'}40`
                            : 'none',
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
        {/* VIDEO RESOURCE PLAYER                 */}
        {/* ═════════════════════════════════════ */}
        {project.videoResource?.url && (
          <div className="hud-card p-4 sm:p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-rose-500/60 rounded-full" />
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
                Project Resource Video
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <video
                controls
                className="w-full"
                style={{ maxHeight: '340px', colorScheme: 'dark', display: 'block' }}
                preload="metadata"
              >
                <source src={project.videoResource.url} />
                Your browser does not support the video tag.
              </video>
            </div>
            {project.videoTitle && (
              <p className="font-data text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
                <span className="text-rose-400/70">▶</span>
                {project.videoTitle}
              </p>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════ */}
        {/* MISSIONS LIST                         */}
        {/* ═════════════════════════════════════ */}
        <div className="hud-card p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-purple-500/60 rounded-full" />
            <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
              Missions
            </span>
            <span className="font-data text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
              {missions.length}
            </span>
          </div>

          {missions.length === 0 ? (
            <p className="font-data text-[11px] text-slate-500 text-center py-6">
              No missions linked to this project yet.
            </p>
          ) : (
            <div className="space-y-2">
              {missions.map((m) => {
                const missionLoggedMinutes = timeLogs
                  .filter((tl) => String(tl.mission) === String(m.id))
                  .reduce((sum, tl) => sum + (tl.duration || 0), 0)
                const missionProgress =
                  m.targetHours > 0
                    ? Math.min(
                        100,
                        Math.round((missionLoggedMinutes / 60 / m.targetHours) * 100),
                      )
                    : 0

                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-black/30 border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      {MISSION_TYPE_ICONS[m.type] || (
                        <Target className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-hud text-[10px] sm:text-[11px] text-slate-200 font-bold truncate">
                          {m.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {MISSION_STATUS_ICONS[m.status]}
                          <span
                            className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase ${STATUS_COLORS[m.status] || STATUS_COLORS.active}`}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>

                      {/* Mission progress */}
                      {m.targetHours > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${missionProgress}%` }}
                            />
                          </div>
                          <span className="font-data text-[8px] text-slate-500">
                            {formatHours(missionLoggedMinutes)} / {m.targetHours}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
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
                Recent Notes
              </span>
            </div>
            {recentNotes.length === 0 ? (
              <p className="font-data text-[10px] text-slate-500 text-center py-4">
                No notes yet.
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
                Recent Flash Cards
              </span>
            </div>
            {recentFlashCards.length === 0 ? (
              <p className="font-data text-[10px] text-slate-500 text-center py-4">
                No flash cards yet.
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

        {/* Recent Time Logs */}
        <div className="hud-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-amber-500/60 rounded-full" />
            <span className="font-hud text-[10px] uppercase tracking-[2px] text-slate-300 font-bold">
              Recent Time Logs
            </span>
          </div>

          {timeLogs.length === 0 ? (
            <p className="font-data text-[11px] text-slate-500 text-center py-6">
              No time logs linked to this project&apos;s missions yet.
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
