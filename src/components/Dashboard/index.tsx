'use client'

import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { HUDHeader } from './HUDHeader'
import { QuickActions } from './QuickActions'
import { QuickInputRow } from './QuickInputRow'
import { AnalyticsChart } from './AnalyticsChart'
import { SummaryCards } from './SummaryCards'
import { BottomNav } from './BottomNav'
import { DashboardModals } from './Modals'
import { ScheduleView } from './ScheduleView'
import { DopamineReward } from './DopamineReward'
import { CameraCaptureModal } from './CameraCaptureModal'
import { TestEntryForm } from './TestEntryForm'
import { TimeLogForm } from './TimeLogForm'
import { PieChartComponent } from './PieChart'
import { FlashCardWidget } from './FlashCardWidget'
import { DashboardSearchTerminal } from './DashboardSearchTerminal'
import { OpsTimerManageModal } from './OpsTimer/OpsTimerManageModal'
import { PomodoroRatingPrompt } from './OpsTimer/PomodoroRatingPrompt'
import { ProjectOverview } from './ProjectOverview'
import type { DashboardData } from './types'
import {
  useAuthStore,
  useNotesStore,
  useTimeLogStore,
  useTestScoreStore,
  useMissionStore,
  useHabitStore,
  useScheduleStore,
  useOpsTimerStore,
} from '@/stores'

export interface DashboardProps {
  initialData?: DashboardData
}

export const Dashboard: React.FC<DashboardProps> = ({ initialData }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'home' | 'study' | 'schedule' | 'profile'>('home')
  const [activeModal, setActiveModal] = useState<
    'capture' | 'camera' | 'goal' | 'note' | 'habit' | 'time' | 'profile' | null
  >(null)
  const [dopamine, setDopamine] = useState<{ message: string; points: number } | null>(null)

  // Prime Zustand stores with SSR initialData on mount
  useEffect(() => {
    if (initialData?.user && initialData.user.id) {
      useAuthStore.setState({
        user: {
          id: Number(initialData.user.id),
          email: initialData.user.email || '',
          name: initialData.user.name || undefined,
        },
        isAuthenticated: true,
      })
    }
    const initNotes = initialData?.notes
    if (initNotes && initNotes.length > 0) {
      useNotesStore.setState((s) => ({
        notes: s.notes.length > 0 ? s.notes : (initNotes as any),
        totalDocs: Math.max(s.totalDocs, initNotes.length),
      }))
    }
    const initLogs = initialData?.timeLogs
    if (initLogs && initLogs.length > 0) {
      useTimeLogStore.setState((s) => ({
        logs: s.logs.length > 0 ? s.logs : (initLogs as any),
        totalDocs: Math.max(s.totalDocs, initLogs.length),
      }))
    }
  }, [initialData])

  // Zustand subscriptions
  const notes = useNotesStore((s) => s.notes)
  const timeLogs = useTimeLogStore((s) => s.logs)
  const scheduleEvents = useScheduleStore((s) => s.events)

  const [readingNoteTitle, setReadingNoteTitle] = useState(
    initialData?.notes?.[0]?.title
      ? `Summary: ${initialData.notes[0].title}`
      : 'Summary: last Reading Notes, Rotational Dynamics and Kinematics...',
  )
  const [readingNoteSlug, setReadingNoteSlug] = useState(
    initialData?.notes?.[0]?.slug || 'moment-of-inertia-formulas',
  )
  const [missionProgress, setMissionProgress] = useState(64)
  const [goalsProgress, setGoalsProgress] = useState(80)

  // Sync note title if notes update
  useEffect(() => {
    if (notes.length > 0 && notes[0]?.title) {
      setReadingNoteTitle(`Summary: ${notes[0].title}`)
      if (notes[0].slug) setReadingNoteSlug(notes[0].slug)
    }
  }, [notes])

  const triggerReward = (message: string, points = 25) => {
    setDopamine({ message, points })
  }

  // OPS Timer subscriptions
  const isManageModalOpen = useOpsTimerStore((s) => s.isManageModalOpen)
  const openManageModal = useOpsTimerStore((s) => s.openManageModal)
  const closeManageModal = useOpsTimerStore((s) => s.closeManageModal)
  const syncWithDatabase = useOpsTimerStore((s) => s.syncWithDatabase)

  // Sync last paused session from database on mount / login
  useEffect(() => {
    syncWithDatabase()

    const handleSessionComplete = (e: Event) => {
      const detail = (e as CustomEvent)?.detail
      setDopamine({
        message: `OBJECTIVE COMPLETE // ${detail?.targetTitle || 'SPRINT'} (${detail?.durationMinutes || 25}M)`,
        points: 75,
      })
    }

    const handleSessionQuit = (e: Event) => {
      const detail = (e as CustomEvent)?.detail
      setDopamine({
        message: `SESSION QUIT // ${detail?.elapsedMinutes || 0}M SAVED FOR ${detail?.targetTitle || 'OBJECTIVE'}`,
        points: 15,
      })
    }

    const handleSessionTerminated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail
      setDopamine({
        message: `SESSION TERMINATED // ALL DATA DESTROYED FOR ${detail?.targetTitle || 'OBJECTIVE'}`,
        points: 0,
      })
    }

    window.addEventListener('toggledawn:session-complete', handleSessionComplete)
    window.addEventListener('toggledawn:session-quit', handleSessionQuit)
    window.addEventListener('toggledawn:session-terminated', handleSessionTerminated)

    return () => {
      window.removeEventListener('toggledawn:session-complete', handleSessionComplete)
      window.removeEventListener('toggledawn:session-quit', handleSessionQuit)
      window.removeEventListener('toggledawn:session-terminated', handleSessionTerminated)
    }
  }, [syncWithDatabase])

  const handleSaveQuickNote = async (noteText: string) => {
    setReadingNoteTitle(`Summary: ${noteText}`)
    triggerReward('INTEL CAPTURED', 15)
    try {
      const created = await useNotesStore.getState().createNote({
        title: noteText.slice(0, 50),
        noteType: 'note',
      })
      if (created?.slug) setReadingNoteSlug(created.slug)
    } catch (_e) {}
  }

  const handleModalSave = async (type: string, data: any) => {
    if (type === 'note') {
      if (data?.title) setReadingNoteTitle(`Summary: ${data.title}`)
      triggerReward('BRIEFING FILED', 30)
      try {
        const created = await useNotesStore.getState().createNote({
          title: data.title || 'Untitled Briefing',
          noteType: 'note',
        })
        if (created?.slug) setReadingNoteSlug(created.slug)
      } catch (_e) {}
    } else if (type === 'goal') {
      setGoalsProgress((p) => Math.min(100, p + 5))
      triggerReward('OBJECTIVE LOCKED', 25)
    } else if (type === 'time') {
      setMissionProgress((p) => Math.min(100, p + 6))
      triggerReward('OPS LOG RECORDED', 40)
      try {
        await useTimeLogStore.getState().createLog({
          category: (data?.category || 'study').toLowerCase(),
          duration: Number(data?.minutes) || 45,
          description: `Focus block - ${data?.category || 'Study'}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + (Number(data?.minutes) || 45) * 60000).toISOString(),
        })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('time-log-added'))
        }
      } catch (_e) {}
    } else if (type === 'habit') {
      triggerReward('PROTOCOL REINFORCED', 50)
      try {
        await useHabitStore.getState().addHabit({
          title: data?.title || 'New Protocol',
          frequency: 'daily',
        })
      } catch (_e) {}
    } else if (type === 'camera') {
      triggerReward('ASSET UPLOADED TO VAULT', 20)
    }
  }

  return (
    <div className="hud-bg min-h-screen text-slate-100 font-body flex flex-col items-center justify-start relative">
      {/* Scanline Overlay */}
      <div className="scanline-overlay" />

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col min-h-screen">
        {/* HUD Top Bar */}
        <HUDHeader
          userName={initialData?.user?.name || initialData?.user?.email?.split('@')[0]}
        />

        {/* Main Scrollable Area */}
        <div className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-36 sm:pb-48 overflow-y-auto hud-scroll">
          {activeTab === 'schedule' ? (
            <ScheduleView
              onBackToHome={() => setActiveTab('home')}
              onOpenLogTimeModal={() => setActiveModal('time')}
            />
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {/* Title + Search Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="font-hud text-lg sm:text-2xl md:text-3xl font-bold tracking-wider text-[#00f0ff] text-glow-cyan uppercase">
                    ToggleDawn
                  </h1>
                  <p className="font-data text-[10px] sm:text-xs tracking-[2px] text-slate-500 mt-0.5 uppercase">
                    Intelligence Operations Dashboard
                  </p>
                </div>

                {/* Search Terminal Powered by Elasticsearch */}
                <DashboardSearchTerminal />
              </div>

              {/* Command Modules (Quick Actions) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#00f0ff]/60 rounded-full" />
                  <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-[#00f0ff]/50 uppercase">
                    Command Modules
                  </span>
                </div>
                <QuickActions onActionClick={(action) => setActiveModal(action)} />
              </div>

              {/* Desktop: 2-column grid / Mobile: stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                  {/* Data Terminals (Quick Inputs) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-amber-500/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-amber-500/50 uppercase">
                        Data Terminals
                      </span>
                    </div>
                    <QuickInputRow
                      onSaveQuickNote={handleSaveQuickNote}
                      onManageTime={() => openManageModal(1)}
                    />
                  </div>

                  {/* Intelligence Feed (Analytics) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-purple-500/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-purple-500/50 uppercase">
                        Intelligence Feed
                      </span>
                    </div>
                    <AnalyticsChart onManageTests={() => setActiveModal('goal')} />
                  </div>

                  {/* Time Distribution (Pie Chart) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-[#00f0ff]/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-[#00f0ff]/50 uppercase">
                        Time Distribution
                      </span>
                    </div>
                    <PieChartComponent timeLogs={initialData?.timeLogs?.map(l => ({
                      category: l.category,
                      duration: l.duration,
                      startTime: l.startTime,
                    }))} />
                  </div>

                  {/* Project Overview */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-emerald-500/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-emerald-500/50 uppercase">
                        Project Overview
                      </span>
                    </div>
                    <ProjectOverview
                      projects={initialData?.projects}
                      missions={initialData?.missions}
                      timeLogs={initialData?.timeLogs}
                      notes={initialData?.notes}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                  {/* Flash Cards Widget */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-[#00f0ff]/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-[#00f0ff]/50 uppercase">
                        Flash Cards
                      </span>
                    </div>
                    <FlashCardWidget />
                  </div>

                  {/* Situation Briefing (Summary Cards) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-emerald-500/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-emerald-500/50 uppercase">
                        Situation Briefing
                      </span>
                    </div>
                    <SummaryCards
                      readingNoteTitle={readingNoteTitle}
                      readingNoteSlug={readingNoteSlug}
                      plannerCount={scheduleEvents.length > 0 ? scheduleEvents.length : 6}
                      summaryCount={notes.length > 0 ? notes.length : 6}
                      missionProgress={missionProgress}
                      goalsProgress={goalsProgress}
                      onManagePlanner={() => setActiveModal('goal')}
                      onManageMissions={() => setActiveModal('goal')}
                      onManageGoals={() => setActiveModal('goal')}
                    />
                  </div>

                  {/* Score Entry (Test Entry Form) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-purple-500/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-purple-500/50 uppercase">
                        Score Entry
                      </span>
                    </div>
                    <TestEntryForm
                      onSubmitScore={(data) => triggerReward('SCORE LOGGED', 35)}
                    />
                  </div>

                  {/* Ops Log Entry (Time Log Form) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-amber-500/60 rounded-full" />
                      <span className="font-hud text-[9px] sm:text-[10px] tracking-[3px] text-amber-500/50 uppercase">
                        Ops Log Entry
                      </span>
                    </div>
                    <TimeLogForm
                      onSubmitLog={(data) => {
                        setMissionProgress((p) => Math.min(100, p + 6))
                        triggerReward('OPS LOG RECORDED', 40)
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Extra clearance spacer so bottom Manage buttons never overlap with the floating dock */}
              <div className="h-14 sm:h-20" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Bottom Command Dock */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            if (tab === 'profile') setActiveModal('profile')
          }}
          onPlusClick={() => setActiveModal('capture')}
        />
      </div>

      {/* Dopamine HUD Toast */}
      {dopamine && (
        <DopamineReward
          message={dopamine.message}
          points={dopamine.points}
          onClose={() => setDopamine(null)}
        />
      )}

      {/* Camera Capture & Structured Intake Modal */}
      <CameraCaptureModal
        isOpen={activeModal === 'camera'}
        onClose={() => setActiveModal(null)}
        onReward={(msg, pts) => triggerReward(msg, pts)}
        projects={initialData?.projects?.map((p: any) => ({ id: p.id, title: p.title }))}
        missions={initialData?.missions?.map((m: any) => ({ id: m.id, title: m.title }))}
      />

      {/* Modals */}
      <DashboardModals
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        userPreferences={initialData?.user?.preferences}
        onSaveItem={handleModalSave}
      />

      {/* Strategic Mobile-First OPS Pomodoro Timer Modal */}
      <OpsTimerManageModal
        isOpen={isManageModalOpen}
        onClose={closeManageModal}
        habits={initialData?.habits}
        missions={initialData?.missions}
        projects={initialData?.projects}
        books={initialData?.books}
        chapters={initialData?.chapters}
      />

      {/* Floating 5-Point Emoji Pomodoro Rating Prompt */}
      <PomodoroRatingPrompt />
    </div>
  )
}
