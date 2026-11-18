'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Target,
  Repeat,
  FolderKanban,
  BookOpen,
  Layers,
  Sparkles,
  Play,
  Pause,
  StopCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  LogOut,
  Trash2,
} from 'lucide-react'
import {
  useOpsTimerStore,
  OpsTimerTarget,
  OpsTimerTargetType,
} from '@/stores/useOpsTimerStore'
import { triggerHaptic } from '@/utilities/timerAudio'

interface OpsTimerManageModalProps {
  isOpen: boolean
  onClose: () => void
  habits?: Array<{ id: string | number; title: string; frequency?: string | null }>
  missions?: Array<{ id: string | number; title: string; type?: string | null }>
  projects?: Array<{ id: string | number; title: string; status?: string | null }>
  books?: Array<{ id: string | number; title: string; author?: string | null }>
  chapters?: Array<{ id: string | number; title: string; bookTitle?: string | null }>
}

type TabType = 'all' | 'habits' | 'missions' | 'projects' | 'books' | 'chapters'

const DURATION_PRESETS = [
  { label: '25m', sub: '1 Sprint', minutes: 25 },
  { label: '50m', sub: '2 Sprints', minutes: 50 },
  { label: '1h 15m', sub: '3 Sprints', minutes: 75 },
  { label: '1h 45m', sub: '4 Sprints', minutes: 105 },
  { label: '2h 15m', sub: '5 Sprints', minutes: 135 },
  { label: '3h 00m', sub: '6 Sprints', minutes: 180 },
  { label: '4h 00m', sub: '8 Sprints', minutes: 240 },
]

export const OpsTimerManageModal: React.FC<OpsTimerManageModalProps> = ({
  isOpen,
  onClose,
  habits = [],
  missions = [],
  projects = [],
  books = [],
  chapters = [],
}) => {
  const {
    session,
    lastPausedSession,
    manageModalInitialStep,
    configureSession,
    startTimer,
    pauseSession,
    resumeSession,
    terminateSession,
    quitSession,
  } = useOpsTimerStore()

  // Multi-step modal navigation: 1 = Choose Goal, 2 = Set Duration Time Picker
  const [currentStep, setCurrentStep] = useState<1 | 2>(manageModalInitialStep || 1)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<OpsTimerTarget | null>(null)
  const [customGoalTitle, setCustomGoalTitle] = useState('')

  // Duration State (held temporarily in component memory / useState until timer runs)
  const [durationHours, setDurationHours] = useState<number>(1)
  const [durationMinutes, setDurationMinutes] = useState<number>(15) // Default 1h 15m (3 pomodoros)

  // Combined candidates for target selection
  const allCandidates = useMemo(() => {
    const list: OpsTimerTarget[] = []

    habits.forEach((h) => {
      list.push({
        id: h.id,
        type: 'habit',
        title: h.title,
        subtitle: h.frequency ? `${h.frequency.toUpperCase()} PROTOCOL` : 'DAILY HABIT',
        category: 'exercise',
      })
    })

    missions.forEach((m) => {
      list.push({
        id: m.id,
        type: 'mission',
        title: m.title,
        subtitle: m.type ? `${m.type.toUpperCase()} OBJECTIVE` : 'ACTIVE MISSION',
        category: 'study',
      })
    })

    projects.forEach((p) => {
      list.push({
        id: p.id,
        type: 'project',
        title: p.title,
        subtitle: p.status ? `${p.status.toUpperCase()} PROJECT` : 'TACTICAL PROJECT',
        category: 'work',
      })
    })

    books.forEach((b) => {
      list.push({
        id: b.id,
        type: 'book',
        title: b.title,
        subtitle: b.author ? `AUTHOR: ${b.author}` : 'MANUAL',
        category: 'study',
      })
    })

    chapters.forEach((c) => {
      list.push({
        id: c.id,
        type: 'chapter',
        title: c.title,
        subtitle: c.bookTitle ? `BOOK: ${c.bookTitle}` : 'CHAPTER REVISION',
        category: 'study',
      })
    })

    return list
  }, [habits, missions, projects, books, chapters])

  // Filter candidates based on active tab & search query
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((item) => {
      if (activeTab === 'habits' && item.type !== 'habit') return false
      if (activeTab === 'missions' && item.type !== 'mission') return false
      if (activeTab === 'projects' && item.type !== 'project') return false
      if (activeTab === 'books' && item.type !== 'book') return false
      if (activeTab === 'chapters' && item.type !== 'chapter') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)
      }
      return true
    })
  }, [allCandidates, activeTab, searchQuery])

  if (!isOpen) return null

  // Calculate Pomodoro breakdowns
  const totalMinutes = durationHours * 60 + durationMinutes
  const totalFocusMinutes = totalMinutes
  const estimatedPomodoros = Math.max(1, Math.round(totalFocusMinutes / 30))

  const handleSelectPreset = (minutes: number) => {
    triggerHaptic(20)
    setDurationHours(Math.floor(minutes / 60))
    setDurationMinutes(minutes % 60)
  }

  const handleAdjustHours = (delta: number) => {
    triggerHaptic(15)
    setDurationHours((prev) => Math.max(0, Math.min(12, prev + delta)))
  }

  const handleAdjustMinutes = (delta: number) => {
    triggerHaptic(15)
    setDurationMinutes((prev) => {
      let next = prev + delta
      if (next >= 60) next = 55
      if (next < 0) next = 0
      return next
    })
  }

  const handleStartTimer = () => {
    const finalTarget = selectedTarget || {
      type: 'custom' as OpsTimerTargetType,
      title: customGoalTitle.trim() || 'Tactical Study Sprint',
      subtitle: 'CUSTOM OBJECTIVE',
      category: 'study',
    }

    // Configure session: stores duration temporarily in cache/Zustand without database write!
    configureSession(finalTarget, totalMinutes)
    startTimer()
    onClose()
  }

  const getTargetIcon = (type: OpsTimerTargetType) => {
    switch (type) {
      case 'habit':
        return <Repeat className="w-4 h-4 text-purple-400" />
      case 'mission':
        return <Target className="w-4 h-4 text-emerald-400" />
      case 'project':
        return <FolderKanban className="w-4 h-4 text-[#00f0ff]" />
      case 'book':
        return <BookOpen className="w-4 h-4 text-amber-400" />
      case 'chapter':
        return <Layers className="w-4 h-4 text-blue-400" />
      default:
        return <Zap className="w-4 h-4 text-yellow-400" />
    }
  }

  // Active / Paused session banner
  const liveSession = session || lastPausedSession

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ops-timer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="hud-card-3d relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-[#060e1d]/95 border border-[rgba(0,240,255,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.15)] text-slate-100 overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#10b981] to-[#f59e0b]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="ops-timer-title" className="font-hud text-sm sm:text-base font-bold tracking-wider text-[#00f0ff] uppercase">
                Ops Pomodoro Timer
              </h3>
              <p className="font-data text-[9px] sm:text-[10px] text-slate-400 tracking-wider">
                {currentStep === 1 ? 'STEP 01 // SELECT OBJECTIVE' : 'STEP 02 // TARGET DURATION PICKER'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live / Paused Session Status Header */}
        {liveSession && liveSession.status !== 'completed' && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-black/60 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${liveSession.status === 'running' ? 'bg-[#00ff9d] animate-pulse' : 'bg-amber-400'}`} />
                <div className="truncate">
                  <span className="font-hud text-[10px] text-amber-300 font-bold block truncate">
                    {liveSession.status === 'paused' ? 'PAUSED OBJECTIVE' : 'ACTIVE OBJECTIVE'}: {liveSession.target.title}
                  </span>
                  <span className="font-data text-[9px] text-slate-400">
                    {Math.round(liveSession.totalElapsedSeconds / 60)}m elapsed / {Math.round(liveSession.targetDurationSeconds / 60)}m target • Cycle {liveSession.currentCycle}
                  </span>
                </div>
              </div>

              {/* Status Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {liveSession.status === 'paused' ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20)
                      resumeSession(liveSession)
                      onClose()
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-hud text-[10px] font-bold hover:bg-emerald-500/30 flex items-center gap-1 active:scale-95 transition-all"
                    title="Resume Paused Timer"
                  >
                    <Play className="w-3 h-3 fill-emerald-300" /> RESUME
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20)
                      pauseSession()
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-hud text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-1 active:scale-95 transition-all"
                    title="Pause Timer and save status to database"
                  >
                    <Pause className="w-3 h-3 fill-amber-300" /> PAUSE
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    triggerHaptic(20)
                    await quitSession()
                    onClose()
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-300 font-hud text-[10px] font-bold hover:bg-amber-500/20 flex items-center gap-1 active:scale-95 transition-all"
                  title="Quit early: stops timer immediately and saves all data with start & end timestamps"
                >
                  <LogOut className="w-3 h-3 text-amber-400" /> QUIT (SAVE)
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    triggerHaptic(20)
                    await terminateSession()
                    onClose()
                  }}
                  className="px-2.5 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300 font-hud text-[10px] font-bold hover:bg-red-500/30 flex items-center gap-1 active:scale-95 transition-all"
                  title="Terminate: stops timer immediately and destroys current all logs & related data"
                >
                  <Trash2 className="w-3 h-3 text-red-400" /> DESTROY
                </button>
              </div>
            </div>

            {/* Session status info */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-data text-slate-400">
              <span>Paused session is safely preserved in database.</span>
            </div>
          </div>
        )}

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 hud-scroll space-y-4">
          {currentStep === 1 ? (
            /* ─────────────────────────────────────────────────────────────
               STEP 1: SELECT OBJECTIVE (HABITS, MISSIONS, PROJECTS, BOOKS, CHAPTERS)
               ───────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              {/* Category Segmented Tabs (Horizontal scroll on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'habits', label: 'Habits' },
                  { id: 'missions', label: 'Missions' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'books', label: 'Books' },
                  { id: 'chapters', label: 'Chapters' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10)
                      setActiveTab(tab.id as TabType)
                    }}
                    className={`px-3 py-1.5 rounded-lg font-data text-xs whitespace-nowrap transition-all uppercase tracking-wider ${
                      activeTab === tab.id
                        ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] shadow-[0_0_10px_rgba(0,240,255,0.2)] font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="// filter objectives or topics..."
                  className="hud-input w-full pl-9 pr-3 py-2 text-xs rounded-xl"
                />
              </div>

              {/* Custom Goal Input Card */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#00f0ff]/30 transition-all">
                <label className="font-hud text-[9px] uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#00f0ff]" />
                  Custom On-Demand Objective
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customGoalTitle}
                    onChange={(e) => {
                      setCustomGoalTitle(e.target.value)
                      if (e.target.value.trim()) {
                        setSelectedTarget({
                          type: 'custom',
                          title: e.target.value.trim(),
                          subtitle: 'CUSTOM OPERATIONAL GOAL',
                          category: 'study',
                        })
                      }
                    }}
                    placeholder="e.g. Physics Formula Memorization, React Docs..."
                    className="hud-input flex-1 px-3 py-2 text-xs rounded-lg"
                  />
                  {customGoalTitle.trim() && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-3 py-2 rounded-lg bg-[rgba(0,240,255,0.15)] border border-[#00f0ff]/40 text-[#00f0ff] font-hud text-[11px] font-bold"
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>

              {/* Objective Candidates List */}
              <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1 hud-scroll">
                {filteredCandidates.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 font-data text-xs">
                    No matching goals found. You can enter a custom goal above!
                  </div>
                ) : (
                  filteredCandidates.map((item) => {
                    const isSelected = selectedTarget?.id === item.id && selectedTarget?.type === item.type
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => {
                          triggerHaptic(20)
                          setSelectedTarget(item)
                          setCustomGoalTitle('')
                        }}
                        className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-[rgba(0,240,255,0.15)] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                            : 'bg-black/30 border border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            {getTargetIcon(item.type)}
                          </div>
                          <div className="truncate">
                            <p className="font-hud text-xs font-bold text-slate-200 truncate">
                              {item.title}
                            </p>
                            <p className="font-data text-[9px] text-slate-400 tracking-wider truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                        ) : (
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 uppercase tracking-widest shrink-0">
                            {item.type}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               STEP 2: TARGET DURATION PICKER (IN-MEMORY CACHE, NO DB WRITE)
               ───────────────────────────────────────────────────────────── */
            <div className="space-y-5">
              {/* Selected Target Summary Badge */}
              <div className="p-3 rounded-xl bg-[rgba(0,240,255,0.06)] border border-[#00f0ff]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  {getTargetIcon(selectedTarget?.type || 'custom')}
                  <div className="truncate">
                    <span className="font-data text-[9px] text-[#00f0ff] uppercase tracking-wider block">
                      Target Goal
                    </span>
                    <span className="font-hud text-xs font-bold text-slate-200 truncate block">
                      {selectedTarget?.title || customGoalTitle || 'Custom Focus Sprint'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="font-hud text-[10px] text-[#00f0ff] underline hover:opacity-80 shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Quick Duration Preset Pills */}
              <div>
                <label className="font-hud text-[10px] tracking-wider text-slate-400 uppercase block mb-2">
                  Quick Duration Presets
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {DURATION_PRESETS.map((p) => {
                    const isSelected = totalMinutes === p.minutes
                    return (
                      <button
                        key={p.minutes}
                        type="button"
                        onClick={() => handleSelectPreset(p.minutes)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)] font-bold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        <span className="font-data text-xs font-bold block">{p.label}</span>
                        <span className="font-mono text-[8px] text-slate-500 block truncate">{p.sub}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tactical Cyberpunk Stepper Controls */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
                <div className="flex items-center justify-center gap-6 sm:gap-10">
                  {/* Hours Stepper */}
                  <div className="flex flex-col items-center">
                    <span className="font-hud text-[9px] text-slate-400 uppercase tracking-widest mb-1">
                      HOURS
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustHours(-1)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 font-hud text-lg text-slate-200 flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                      <span className="w-14 sm:w-16 text-center font-data text-3xl sm:text-4xl font-black text-[#00f0ff] tracking-wider text-glow-cyan">
                        {String(durationHours).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustHours(1)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 font-hud text-lg text-slate-200 flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <span className="text-2xl text-slate-600 font-data pb-2">:</span>

                  {/* Minutes Stepper */}
                  <div className="flex flex-col items-center">
                    <span className="font-hud text-[9px] text-slate-400 uppercase tracking-widest mb-1">
                      MINUTES
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustMinutes(-5)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 font-hud text-lg text-slate-200 flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                      <span className="w-14 sm:w-16 text-center font-data text-3xl sm:text-4xl font-black text-[#00f0ff] tracking-wider text-glow-cyan">
                        {String(durationMinutes).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustMinutes(5)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 font-hud text-lg text-slate-200 flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pomodoro Cycles Calculation Breakdown */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 font-data text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    Cycle Blueprint: <strong className="text-white">{estimatedPomodoros} Pomodoro Sprints</strong>
                  </span>
                  <span>
                    Focus: <strong className="text-white">{totalFocusMinutes}m</strong> (25m sprints + 5m breaks)
                  </span>
                </div>
              </div>

              {/* Temporary Cache Notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-data text-[10px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Zero premature DB writes:</strong> Your targeted duration is cached in client memory and only written to the database on completion, pause, or termination.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          {currentStep === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-hud text-xs hover:bg-white/10 flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="button"
                onClick={handleStartTimer}
                disabled={totalMinutes <= 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff9d] text-black font-hud text-xs font-black tracking-widest uppercase hover:opacity-95 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-black" />
                Start Ops Timer
              </button>
            </>
          ) : (
            <>
              <span className="font-data text-[10px] text-slate-500">
                {selectedTarget ? 'Objective Selected' : 'Choose an objective above'}
              </span>

              <button
                type="button"
                disabled={!selectedTarget && !customGoalTitle.trim()}
                onClick={() => {
                  triggerHaptic(20)
                  setCurrentStep(2)
                }}
                className="px-5 py-2.5 rounded-xl bg-[rgba(0,240,255,0.2)] border border-[#00f0ff]/50 text-[#00f0ff] font-hud text-xs font-bold tracking-wider uppercase hover:bg-[rgba(0,240,255,0.3)] shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                Next: Set Duration <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

