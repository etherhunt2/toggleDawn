'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  FolderKanban,
  Clock,
  Layers,
  CalendarClock,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react'

interface ProjectData {
  id: number
  title: string
  description?: string | null
  status: string
  adminStatus?: string | null
  computedProgress?: number | null
  priority?: string | null
  deadline?: string | null
  color?: string | null
  featuredImage?: { url?: string | null; alt?: string | null } | null
  createdAt: string
  updatedAt: string
}

interface MissionData {
  id: number
  title: string
  project: number | null
  targetHours: number
  status: string
}

interface TimeLogData {
  id: number
  duration: number
  startTime: string
  mission: number | null
}

interface Props {
  data: {
    projects: ProjectData[]
    missions: MissionData[]
    timeLogs: TimeLogData[]
  }
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

const STATUS_TABS = ['all', 'active', 'planning', 'on-hold', 'completed', 'archived'] as const

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

export const ProjectsListClient: React.FC<Props> = ({ data }) => {
  const { projects, missions, timeLogs } = data
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Compute per-project metrics
  const enrichedProjects = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return projects.map((p) => {
      const projectMissions = missions.filter(
        (m) => m.project !== null && String(m.project) === String(p.id),
      )
      const missionIds = new Set(projectMissions.map((m) => String(m.id)))

      let minutesLast7d = 0
      let minutesLast30d = 0
      for (const tl of timeLogs) {
        if (!tl.mission || !missionIds.has(String(tl.mission))) continue
        const logDate = new Date(tl.startTime)
        minutesLast30d += tl.duration || 0
        if (logDate >= sevenDaysAgo) {
          minutesLast7d += tl.duration || 0
        }
      }

      const totalTargetHours = projectMissions.reduce(
        (sum, m) => sum + (m.targetHours || 0),
        0,
      )
      const progressPercent =
        p.computedProgress != null && p.computedProgress > 0
          ? p.computedProgress
          : totalTargetHours > 0
          ? Math.min(100, Math.round((minutesLast30d / 60 / totalTargetHours) * 100))
          : 0

      return {
        ...p,
        missionCount: projectMissions.length,
        minutesLast7d,
        minutesLast30d,
        progressPercent,
        totalTargetHours,
      }
    })
  }, [projects, missions, timeLogs])

  // Filter by tab and search
  const filteredProjects = useMemo(() => {
    let list = enrichedProjects
    if (activeTab !== 'all') {
      list = list.filter((p) => p.status === activeTab)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      )
    }
    return list
  }, [enrichedProjects, activeTab, searchQuery])

  // Stats
  const totalProjects = projects.length
  const activeCount = projects.filter((p) => p.status === 'active').length
  const totalHoursLast7Days = enrichedProjects.reduce(
    (sum, p) => sum + p.minutesLast7d,
    0,
  )

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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-hud text-lg sm:text-xl font-bold text-slate-100 uppercase tracking-wider">
                All Projects
              </h1>
              <span className="font-data text-[9px] text-slate-500 uppercase tracking-wider">
                Project Command Registry
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-center">
              <span className="font-data text-lg font-bold text-[#00f0ff] block">
                {totalProjects}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Total Projects
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
                {formatHours(totalHoursLast7Days)}
              </span>
              <span className="font-data text-[8px] text-slate-500 uppercase tracking-wider">
                Last 7 Days
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* FILTERS + SEARCH                    */}
        {/* ═══════════════════════════════════ */}
        <div className="hud-card p-3.5 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto hud-scroll flex-1">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`font-hud text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                    activeTab === tab
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-[#00f0ff]/40 font-data text-[11px] text-slate-200 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* PROJECT LIST                        */}
        {/* ═══════════════════════════════════ */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="hud-card p-8 text-center">
              <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-hud text-[11px] text-slate-400 uppercase tracking-wider">
                {searchQuery
                  ? 'No projects match your search'
                  : `No ${activeTab === 'all' ? '' : activeTab + ' '}projects found`}
              </p>
            </div>
          ) : (
            filteredProjects.map((p) => {
              const deadlineLabel = getDeadlineLabel(p.deadline)
              const isOverdue =
                p.deadline && new Date(p.deadline).getTime() < Date.now()

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group block"
                >
                  <div
                    className="hud-card relative overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.12)] hover:border-[#00f0ff]/40"
                    style={{
                      borderLeftColor: p.color || '#00f0ff',
                      borderLeftWidth: '3px',
                    }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {p.featuredImage?.url ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                            <img
                              src={p.featuredImage.url}
                              alt={p.featuredImage.alt || p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: `${p.color || '#00f0ff'}15`,
                              borderColor: `${p.color || '#00f0ff'}40`,
                            }}
                          >
                            <FolderKanban
                              className="w-4 h-4"
                              style={{ color: p.color || '#00f0ff' }}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-hud text-sm sm:text-base font-bold text-slate-100 truncate group-hover:text-[#00f0ff] transition-colors">
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span
                              className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[p.status] || STATUS_COLORS.active}`}
                            >
                              {p.status}
                            </span>
                            {p.adminStatus && p.adminStatus !== 'none' && (
                              <span
                                className={`font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[p.adminStatus] || STATUS_COLORS.active}`}
                              >
                                {p.adminStatus === 'terminated' ? '🛑 Terminated' : '✅ Admin Verified'}
                              </span>
                            )}
                            {p.priority && (
                              <span className="font-hud text-[7px] px-1.5 py-0.5 rounded border uppercase tracking-wider bg-white/5 border-white/10 text-slate-400">
                                {p.priority === 'critical' ? '🔴' : p.priority === 'high' ? '🟠' : p.priority === 'medium' ? '🟡' : '🟢'} {p.priority}
                              </span>
                            )}
                            <span className="font-data text-[8px] text-slate-500">
                              Updated {getRelativeTime(p.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00f0ff] transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Description */}
                    {p.description && (
                      <p className="font-body text-[10px] sm:text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-1">
                        {p.description}
                      </p>
                    )}

                    {/* Metrics row */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#00f0ff]/60" />
                        <span className="font-data text-[10px] text-slate-300 font-bold">
                          {formatHours(p.minutesLast7d)}
                        </span>
                        <span className="font-data text-[8px] text-slate-500">
                          7d
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-purple-400/60" />
                        <span className="font-data text-[10px] text-slate-300 font-bold">
                          {p.missionCount}
                        </span>
                        <span className="font-data text-[8px] text-slate-500">
                          missions
                        </span>
                      </div>

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
                    </div>

                    {/* Progress bar */}
                    {p.totalTargetHours > 0 && (
                      <div className="mt-3 flex items-center gap-2">
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
                        <span className="font-data text-[8px] text-slate-500 w-8 text-right shrink-0">
                          {p.progressPercent}%
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
            Showing {filteredProjects.length} of {totalProjects} projects
          </span>
        </div>
      </div>
    </div>
  )
}
