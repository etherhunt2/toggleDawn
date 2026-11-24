'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  ArrowRight,
  Clock,
  FileText,
  Layers,
  ChevronRight,
  CalendarClock,
  Eye,
} from 'lucide-react'
import type { DashboardData } from './types'

interface ProjectOverviewProps {
  projects?: DashboardData['projects']
  missions?: DashboardData['missions']
  timeLogs?: DashboardData['timeLogs']
  notes?: DashboardData['notes']
}

interface ProjectWithMetrics {
  id: string | number
  title: string
  slug?: string | null
  status?: string | null
  adminStatus?: string | null
  description?: string | null
  deadline?: string | null
  color?: string | null
  priority?: string | null
  computedProgress?: number | null
  updatedAt?: string | null
  createdAt?: string | null
  hoursLast7Days: number
  totalMissions: number
  lastNote?: string | null
  lastFlashCard?: string | null
  /** Progress from server computedProgress, falls back to local calculation */
  progressPercent: number
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  planning: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'on-hold': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  completed: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  terminated: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'admin-completed': 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
}

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

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projects = [],
  missions = [],
  timeLogs = [],
  notes = [],
}) => {
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Build enriched project list with metrics
  const enrichedProjects = useMemo((): ProjectWithMetrics[] => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return (projects || []).map((p) => {
      // Find all missions for this project
      const projectMissions = (missions || []).filter(
        (m) => m.project !== null && m.project !== undefined && String(m.project) === String(p.id),
      )
      const missionIds = new Set(projectMissions.map((m) => String(m.id)))

      // Sum time logs linked to this project's missions within last 7 days
      let totalMinutesLast7d = 0
      for (const tl of timeLogs || []) {
        if (!tl.mission || !missionIds.has(String(tl.mission))) continue
        if (!tl.startTime) continue
        const logDate = new Date(tl.startTime)
        if (logDate >= sevenDaysAgo) {
          totalMinutesLast7d += tl.duration || 0
        }
      }

      // Rough progress: prefer server-computed value, fall back to local calculation
      const totalTargetHours = projectMissions.reduce((sum, m) => sum + (m.targetHours || 0), 0)
      const totalLoggedMinutes = (timeLogs || [])
        .filter((tl) => tl.mission && missionIds.has(String(tl.mission)))
        .reduce((sum, tl) => sum + (tl.duration || 0), 0)
      const localProgress =
        totalTargetHours > 0
          ? Math.min(100, Math.round((totalLoggedMinutes / 60 / totalTargetHours) * 100))
          : 0
      // Use server-computed progress if available (most accurate)
      const progressPercent = typeof (p as any).computedProgress === 'number'
        ? (p as any).computedProgress
        : localProgress

      // Find last related note (matching project keywords or latest available note)
      const relatedNote = (notes || []).find((n) => {
        const titleMatch = n.title?.toLowerCase().includes(p.title.toLowerCase())
        const chapterMatch = n.chapterTitle?.toLowerCase().includes(p.title.toLowerCase())
        return titleMatch || chapterMatch
      }) || (notes && notes.length > 0 ? notes[0] : null)

      return {
        id: p.id,
        title: p.title,
        slug: (p as any).slug || null,
        status: p.status,
        adminStatus: (p as any).adminStatus || 'none',
        description: p.description,
        deadline: p.deadline,
        color: p.color,
        priority: (p as any).priority || 'medium',
        computedProgress: (p as any).computedProgress ?? null,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        hoursLast7Days: totalMinutesLast7d,
        totalMissions: projectMissions.length,
        lastNote: relatedNote?.title || null,
        lastFlashCard: null,
        progressPercent,
      }
    })
  }, [projects, missions, timeLogs, notes])

  // Sort by recent activity (updatedAt descending)
  const sortedByRecent = useMemo(() => {
    return [...enrichedProjects].sort((a, b) => {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return db - da
    })
  }, [enrichedProjects])

  // Last Active Project = first in sortedByRecent with active/planning status
  const lastActiveProject = useMemo(() => {
    return (
      sortedByRecent.find(
        (p) => p.status === 'active' || p.status === 'planning',
      ) || sortedByRecent[0] || null
    )
  }, [sortedByRecent])

  // Last 7 days active: projects that had time logged or were updated in last 7 days
  const sevenDayProjects = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return sortedByRecent
      .filter((p) => {
        if (p.hoursLast7Days > 0) return true
        if (p.updatedAt && new Date(p.updatedAt) >= sevenDaysAgo) return true
        return false
      })
      .slice(0, 5)
  }, [sortedByRecent])

  // All active projects (not completed, not archived)
  const allActiveProjects = useMemo(() => {
    return enrichedProjects.filter(
      (p) => p.status !== 'completed' && p.status !== 'archived',
    )
  }, [enrichedProjects])

  if (!isMounted) {
    return (
      <div className="hud-card p-4 animate-pulse">
        <div className="h-4 w-40 bg-white/10 rounded mb-3" />
        <div className="h-24 bg-white/5 rounded-xl" />
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="hud-card p-4 text-center">
        <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="font-hud text-[10px] text-slate-500 uppercase tracking-wider">
          No Projects Yet
        </p>
        <p className="font-data text-[10px] text-slate-600 mt-1">
          Create your first project in the admin panel to see the overview here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 1: Last Active Project (Featured Card)     */}
      {/* ═══════════════════════════════════════════════════ */}
      {lastActiveProject && (
        <Link
          href={`/projects/${lastActiveProject.slug || lastActiveProject.id}`}
          className="block group"
        >
          <div
            className="hud-card relative overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:border-[#00f0ff]/40"
            style={{
              borderLeftColor: lastActiveProject.color || '#00f0ff',
              borderLeftWidth: '3px',
            }}
          >
            {/* Corner brackets accent */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00f0ff]/40 rounded-tl pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#00f0ff]/40 rounded-br pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${lastActiveProject.color || '#00f0ff'}15`,
                    borderColor: `${lastActiveProject.color || '#00f0ff'}40`,
                  }}
                >
                  <FolderKanban
                    className="w-4.5 h-4.5"
                    style={{ color: lastActiveProject.color || '#00f0ff' }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-hud text-sm sm:text-base font-bold text-slate-100 truncate group-hover:text-[#00f0ff] transition-colors">
                    {lastActiveProject.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {/* Admin override badge (shown when admin has set a status) */}
                    {lastActiveProject.adminStatus && lastActiveProject.adminStatus !== 'none' && (
                      <span className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[lastActiveProject.adminStatus] || 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                        {lastActiveProject.adminStatus === 'terminated' ? '🛑 Terminated' : '✅ Admin Verified'}
                      </span>
                    )}
                    <span
                      className={`font-hud text-[8px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[lastActiveProject.status || 'active'] || STATUS_COLORS.active}`}
                    >
                      {lastActiveProject.status || 'active'}
                    </span>
                    <span className="font-data text-[9px] text-slate-500 uppercase tracking-wider">
                      Last Active Project
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00f0ff] transition-colors shrink-0 mt-1" />
            </div>

            {/* Description */}
            {lastActiveProject.description && (
              <p className="font-body text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                {lastActiveProject.description}
              </p>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                <Clock className="w-3.5 h-3.5 text-[#00f0ff]/70 mx-auto mb-1" />
                <span className="font-data text-sm sm:text-base font-bold text-[#00f0ff] block">
                  {formatHours(lastActiveProject.hoursLast7Days)}
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Last 7 Days
                </span>
              </div>

              <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                <Layers className="w-3.5 h-3.5 text-purple-400/70 mx-auto mb-1" />
                <span className="font-data text-sm sm:text-base font-bold text-purple-300 block">
                  {lastActiveProject.totalMissions}
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Missions
                </span>
              </div>

              <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                <FileText className="w-3.5 h-3.5 text-amber-400/70 mx-auto mb-1" />
                <span className="font-data text-sm sm:text-base font-bold text-amber-300 block">
                  {lastActiveProject.progressPercent}%
                </span>
                <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                  Progress
                </span>
              </div>
            </div>

            {/* Last Note / Flashcard info */}
            {lastActiveProject.lastNote && (
              <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-hud text-[8px] text-slate-500 uppercase tracking-wider block">
                      Last Related Note / Flashcard
                    </span>
                    <span className="font-body text-[11px] text-slate-300 truncate block">
                      {lastActiveProject.lastNote}
                    </span>
                  </div>
                </div>
                <span className="font-hud text-[7px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0 uppercase tracking-wider">
                  Revision
                </span>
              </div>
            )}

            {/* Deadline badge */}
            {lastActiveProject.deadline && (
              <div className="mt-3 flex items-center gap-1.5 font-data text-[9px] text-slate-400">
                <CalendarClock className="w-3 h-3 text-amber-400/60" />
                <span>Deadline: {getDeadlineLabel(lastActiveProject.deadline)}</span>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 2: Last 7 Days Active Projects             */}
      {/* ═══════════════════════════════════════════════════ */}
      {sevenDayProjects.length > 0 && (
        <div className="hud-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-hud text-[10px] sm:text-[11px] uppercase tracking-[2px] text-slate-300 font-bold">
                Last 7 Days
              </span>
            </div>
            <Link
              href="/projects"
              className="font-hud text-[9px] uppercase tracking-wider text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {sevenDayProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug || p.id}`}
                className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-[#00f0ff]/30 hover:bg-black/50 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color || '#00f0ff' }}
                  />
                  <div className="min-w-0">
                    <span className="font-hud text-[10px] sm:text-[11px] text-slate-200 font-bold truncate block group-hover:text-[#00f0ff] transition-colors">
                      {p.title}
                    </span>
                    <span className="font-data text-[8px] text-slate-500">
                      {p.totalMissions} missions • {formatHours(p.hoursLast7Days)} logged
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[p.status || 'active'] || STATUS_COLORS.active}`}
                  >
                    {p.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00f0ff] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 3: All Active Projects (Scrollable)        */}
      {/* ═══════════════════════════════════════════════════ */}
      {allActiveProjects.length > 0 && (
        <div className="hud-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-hud text-[10px] sm:text-[11px] uppercase tracking-[2px] text-slate-300 font-bold">
                All Active Projects
              </span>
              <span className="font-data text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                {allActiveProjects.length}
              </span>
            </div>
          </div>

          {/* Scrollable container */}
          <div
            className="overflow-y-auto hud-scroll border border-white/10 rounded-xl bg-black/20"
            style={{ maxHeight: '240px' }}
          >
            <div className="divide-y divide-white/5">
              {allActiveProjects.map((p) => {
                const deadlineLabel = getDeadlineLabel(p.deadline)
                const isOverdue =
                  p.deadline && new Date(p.deadline).getTime() < Date.now()

                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug || p.id}`}
                    className="group flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
                  >
                    {/* Color dot */}
                    <div
                      className="w-1.5 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || '#00f0ff' }}
                    />

                    {/* Name + Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-hud text-[10px] sm:text-[11px] text-slate-200 font-bold truncate group-hover:text-[#00f0ff] transition-colors">
                          {p.title}
                        </span>
                        {deadlineLabel && (
                          <span
                            className={`font-data text-[8px] shrink-0 flex items-center gap-1 ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}
                          >
                            <CalendarClock className="w-2.5 h-2.5" />
                            {deadlineLabel}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${p.progressPercent}%`,
                              backgroundColor: p.color || '#00f0ff',
                              boxShadow: `0 0 6px ${p.color || '#00f0ff'}60`,
                            }}
                          />
                        </div>
                        <span className="font-data text-[8px] text-slate-500 w-7 text-right shrink-0">
                          {p.progressPercent}%
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
