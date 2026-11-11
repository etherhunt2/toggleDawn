'use client'

import React from 'react'
import Link from 'next/link'

export interface SummaryCardsProps {
  readingNoteTitle?: string
  readingNoteSlug?: string
  plannerCount?: number
  summaryCount?: number
  missionProgress?: number
  goalsProgress?: number
  onManagePlanner?: () => void
  onManageMissions?: () => void
  onManageGoals?: () => void
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  readingNoteTitle = 'Summary: last Reading Notes, Rotational Dynamics and Kinematics...',
  readingNoteSlug = 'moment-of-inertia-formulas',
  plannerCount = 2,
  summaryCount = 16,
  missionProgress = 62,
  goalsProgress = 78,
  onManagePlanner,
  onManageMissions,
  onManageGoals,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* 1. Last Intel Brief */}
      <div className="hud-card-3d corner-brackets p-3.5 sm:p-4 flex flex-col justify-between relative">
        <span className="stamp-classified">INTEL</span>
        <div>
          <h4 className="font-hud text-[9px] sm:text-[10px] tracking-[2px] text-[#00f0ff]/70 uppercase mb-2">
            Last Intel Brief
          </h4>
          <p className="font-body text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {readingNoteTitle}
          </p>
        </div>
        <Link
          href={`/books/${readingNoteSlug}`}
          className="hud-btn w-full py-2 rounded-lg text-[10px] text-center block"
        >
          Continue
        </Link>
      </div>

      {/* 2. Ops Planner */}
      <div className="hud-card-3d corner-brackets p-3.5 sm:p-4 flex flex-col justify-between relative">
        <span className="stamp-classified">OPS</span>
        <div>
          <h4 className="font-hud text-[9px] sm:text-[10px] tracking-[2px] text-[#00f0ff]/70 uppercase mb-2">
            Ops Planner
          </h4>
          <div className="font-data text-xs text-slate-300 space-y-1 mb-4">
            <p>
              PLANS: <span className="text-[#00f0ff]">{plannerCount}</span>
            </p>
            <p>
              BRIEFS: <span className="text-[#00f0ff]">{summaryCount}</span>
            </p>
          </div>
        </div>
        <button type="button" onClick={onManagePlanner} className="hud-btn w-full py-2 rounded-lg text-[10px]">
          Manage
        </button>
      </div>

      {/* 3. Mission Status */}
      <div className="hud-card-3d corner-brackets p-3.5 sm:p-4 flex flex-col justify-between relative">
        <span className="stamp-classified">PRIORITY</span>
        <div>
          <h4 className="font-hud text-[9px] sm:text-[10px] tracking-[2px] text-amber-500/70 uppercase mb-1.5">
            Mission Status
          </h4>
          <div className="flex items-center justify-between mb-1">
            <span className="font-data text-[10px] text-amber-400/60">PROGRESS</span>
            <span className="font-data text-xs text-amber-400">{missionProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
            <div
              style={{ width: `${missionProgress}%` }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full progress-glow shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500"
            />
          </div>
        </div>
        <button type="button" onClick={onManageMissions} className="hud-btn w-full py-2 rounded-lg text-[10px]">
          Manage
        </button>
      </div>

      {/* 4. Objective Tracker */}
      <div className="hud-card-3d corner-brackets p-3.5 sm:p-4 flex flex-col justify-between relative">
        <span className="stamp-classified">ACTIVE</span>
        <div>
          <h4 className="font-hud text-[9px] sm:text-[10px] tracking-[2px] text-[#00f0ff]/70 uppercase mb-1.5">
            Objective Tracker
          </h4>
          <div className="flex items-center justify-between mb-1">
            <span className="font-data text-[10px] text-[#00f0ff]/60">PROGRESS</span>
            <span className="font-data text-xs text-[#00f0ff]">{goalsProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
            <div
              style={{ width: `${goalsProgress}%` }}
              className="h-full bg-gradient-to-r from-cyan-600 to-[#00f0ff] rounded-full progress-glow shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all duration-500"
            />
          </div>
        </div>
        <button type="button" onClick={onManageGoals} className="hud-btn w-full py-2 rounded-lg text-[10px]">
          Manage
        </button>
      </div>
    </div>
  )
}
