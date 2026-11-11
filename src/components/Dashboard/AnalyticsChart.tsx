'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ChevronDown, BarChart2, TrendingUp } from 'lucide-react'
import { useTestScoreStore } from '@/stores/useTestScoreStore'
import { useHabitStore } from '@/stores/useHabitStore'

export interface AnalyticsChartProps {
  onManageTests?: () => void
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ onManageTests }) => {
  const [activeTab, setActiveTab] = useState<'habits' | 'tests'>('habits')
  const [selectedExam, setSelectedExam] = useState<string>('')

  const { scores, fetchScores } = useTestScoreStore()
  const { habits, fetchHabits } = useHabitStore()

  useEffect(() => {
    fetchScores()
    fetchHabits()
  }, [fetchScores, fetchHabits])

  // Group scores by subject/examName
  const examGroups = useMemo(() => {
    if (!scores || scores.length === 0) {
      return [
        { id: 'physics-1', name: 'Physics Exam #1', scores: [72, 78, 85, 78, 85], latest: '85%' },
        { id: 'maths-mock', name: 'Calculus & Algebra #2', scores: [65, 74, 80, 88, 92], latest: '92%' },
        { id: 'chemistry-test', name: 'Organic Chem Midterm', scores: [70, 75, 72, 82, 88], latest: '88%' },
      ]
    }

    const map = new Map<string, number[]>()
    scores.forEach((s) => {
      const key = s.subject || s.examName
      const pct = s.percentage ?? (s.totalScore > 0 ? Math.round((s.scoreObtained / s.totalScore) * 100) : 0)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(pct)
    })

    const result: Array<{ id: string; name: string; scores: number[]; latest: string }> = []
    map.forEach((pcts, name) => {
      const latestPct = pcts[0] || 0
      result.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        scores: pcts.slice(0, 5).reverse(),
        latest: `${latestPct}%`,
      })
    })
    return result
  }, [scores])

  // Select first exam if none selected
  useEffect(() => {
    if (examGroups.length > 0 && (!selectedExam || !examGroups.some((e) => e.name === selectedExam))) {
      setSelectedExam(examGroups[0].name)
    }
  }, [examGroups, selectedExam])

  const currentExamData = examGroups.find((e) => e.name === selectedExam) || examGroups[0] || {
    id: 'default',
    name: 'General Performance',
    scores: [75, 80, 85],
    latest: '85%',
  }

  return (
    <div className="hud-card corner-brackets p-4 sm:p-5">
      {/* Tab Toggle */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-black/30 dark:bg-black/30 border border-[#00f0ff]/10">
          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-hud text-[9px] tracking-[1px] uppercase transition-all ${
              activeTab === 'habits'
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            OPS TEMPO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-hud text-[9px] tracking-[1px] uppercase transition-all ${
              activeTab === 'tests'
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            SCORE INTEL
          </button>
        </div>

        {activeTab === 'tests' && (
          <div className="relative">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="hud-input appearance-none text-xs rounded-lg py-1.5 pl-3 pr-7 font-data cursor-pointer"
            >
              {examGroups.map((exam) => (
                <option key={exam.id} value={exam.name}>{exam.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#00f0ff]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Bar Chart View */}
      {activeTab === 'habits' && (
        <div>
          <div className="relative h-44 sm:h-48 w-full flex items-end pt-4 pb-2">
            <div className="absolute inset-y-0 left-0 w-8 flex flex-col justify-between font-data text-[10px] text-[#00f0ff]/30 pointer-events-none select-none">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            <div className="absolute inset-y-0 left-9 right-0 flex flex-col justify-between pointer-events-none">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="border-b border-[#00f0ff]/5 w-full" />
              ))}
            </div>
            <div className="ml-10 w-full h-full flex justify-around items-end z-10 px-2 sm:px-6">
              <div className="flex items-end gap-1.5 sm:gap-2.5 h-full">
                {[65, 88, 70, 96].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }}
                    className="w-4 sm:w-6 bg-gradient-to-t from-amber-700 via-amber-500 to-amber-300 rounded-t-sm shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all hover:brightness-125"
                  />
                ))}
              </div>
              <div className="flex items-end gap-1.5 sm:gap-2.5 h-full">
                {[90, 98, 76, 100].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }}
                    className="w-4 sm:w-6 bg-gradient-to-t from-purple-800 via-purple-500 to-fuchsia-400 rounded-t-sm shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all hover:brightness-125"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="ml-10 flex justify-around font-hud text-[8px] tracking-[1px] uppercase pt-2 border-t border-[#00f0ff]/5">
            <span className="text-amber-400/80">Time Ops</span>
            <span className="text-purple-400/80">Habit Protocol</span>
          </div>
        </div>
      )}

      {/* Line Chart View */}
      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 relative h-40 w-full flex items-center">
            <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="cyanGlowHud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[20,60,100].map(y => (
                <line key={y} x1="10" y1={y} x2="310" y2={y} stroke="rgba(0,240,255,0.06)" strokeDasharray="3 3" />
              ))}
              <path d="M 20 85 Q 75 70, 90 70 T 160 45 T 230 70 T 300 45 L 300 115 L 20 115 Z" fill="url(#cyanGlowHud)" />
              <path d="M 20 85 Q 75 70, 90 70 T 160 45 T 230 70 T 300 45" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
              {[{x:20,y:85,s:'72%'},{x:90,y:70,s:'78%'},{x:160,y:45,s:'85%'},{x:230,y:70,s:'78%'},{x:300,y:45,s:'85%'}].map((pt,i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#030712" stroke="#00f0ff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y-10} textAnchor="middle" fill="#00f0ff" fontSize="8" fontWeight="600" fontFamily="var(--font-share-tech-mono)">{pt.s}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="flex flex-col items-start sm:items-end justify-center gap-3 sm:border-l sm:border-[#00f0ff]/10 sm:pl-4">
            <div>
              <span className="font-hud text-[8px] tracking-[2px] text-[#00f0ff]/40 uppercase block">Score History</span>
              <span className="font-data text-sm text-slate-200">
                Latest: <span className="text-[#00f0ff]">{currentExamData.latest}</span>
              </span>
            </div>
            <button type="button" onClick={onManageTests} className="hud-btn px-4 py-1.5 rounded-lg text-[10px]">
              Manage
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
