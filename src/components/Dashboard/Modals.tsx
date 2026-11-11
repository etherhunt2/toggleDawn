'use client'

import React, { useState } from 'react'
import {
  X,
  Camera,
  Target,
  FilePlus,
  Repeat,
  Clock,
  Check,
  Upload,
  User,
  ShieldCheck,
} from 'lucide-react'

export interface ModalsProps {
  modalType: 'capture' | 'camera' | 'goal' | 'note' | 'habit' | 'time' | 'profile' | null
  onClose: () => void
  userPreferences?: any
  onSaveItem?: (type: string, data: any) => void
}

export const DashboardModals: React.FC<ModalsProps> = ({
  modalType,
  onClose,
  userPreferences,
  onSaveItem,
}) => {
  const [noteTitle, setNoteTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [goalTitle, setGoalTitle] = useState('')
  const [goalHours, setGoalHours] = useState('40')
  const [habitName, setHabitName] = useState('')
  const [timeCategory, setTimeCategory] = useState('Study')
  const [timeMinutes, setTimeMinutes] = useState('45')
  const [cameraSaved, setCameraSaved] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!modalType || modalType === 'camera') return null

  const handleSave = (type: string, data: any) => {
    onSaveItem?.(type, data)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="hud-card-3d corner-brackets relative w-full max-w-md p-6 text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-[#00f0ff]/50 hover:text-[#00f0ff] hover:border-[#00f0ff]/30 flex items-center justify-center transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Banner */}
        {savedSuccess && (
          <div className="absolute inset-x-0 top-0 bg-[#00f0ff]/10 border-b border-[#00f0ff]/20 text-[#00f0ff] font-hud py-2 text-center text-[9px] tracking-[2px] uppercase flex items-center justify-center gap-1.5 z-20">
            <Check className="w-3.5 h-3.5" /> OPERATION SUCCESSFUL
          </div>
        )}

        {/* 1. Quick Capture Menu */}
        {modalType === 'capture' && (
          <div>
            <h3 className="font-hud text-sm tracking-wider text-[#00f0ff] text-glow-cyan uppercase mb-1">Quick Capture</h3>
            <p className="font-body text-xs text-slate-400 mb-5">
              ADHD-friendly brain dump. Capture your idea instantly with zero friction.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { key: 'note', icon: FilePlus, label: 'New Note', sub: 'Brain dump', color: 'emerald' },
                { key: 'time', icon: Clock, label: 'Log Time', sub: 'Track focus', color: 'amber' },
                { key: 'goal', icon: Target, label: 'Add Goal', sub: 'Set target', color: 'cyan' },
                { key: 'habit', icon: Repeat, label: 'Add Habit', sub: 'Build streak', color: 'purple' },
              ].map((item) => {
                const iconColors: Record<string, string> = {
                  emerald: 'text-emerald-400 bg-emerald-500/10',
                  amber: 'text-amber-400 bg-amber-500/10',
                  cyan: 'text-[#00f0ff] bg-[#00f0ff]/10',
                  purple: 'text-purple-400 bg-purple-500/10',
                }
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSave('quick_action', item.key)}
                    className="hud-card flex items-center gap-3 p-3.5 text-left transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg ${iconColors[item.color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-hud text-[9px] tracking-wider block text-slate-200 uppercase">{item.label}</span>
                      <span className="font-data text-[10px] text-slate-500">{item.sub}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. Goal Modal */}
        {modalType === 'goal' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#00f0ff]" />
              <h3 className="font-hud text-sm tracking-wider text-[#00f0ff] text-glow-cyan uppercase">New Objective</h3>
            </div>
            <p className="font-body text-xs text-slate-400 mb-4">
              Break down your major ambition into achievable target hours.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="font-hud text-[8px] tracking-[2px] text-[#00f0ff]/50 uppercase block mb-1.5">Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master Organic Chemistry Reactions"
                  className="hud-input w-full rounded-lg px-3 py-2.5 text-xs"
                />
              </div>
              <div>
                <label className="font-hud text-[8px] tracking-[2px] text-[#00f0ff]/50 uppercase block mb-1.5">Target Hours</label>
                <input
                  type="number"
                  value={goalHours}
                  onChange={(e) => setGoalHours(e.target.value)}
                  className="hud-input w-full rounded-lg px-3 py-2.5 text-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSave('goal', { title: goalTitle || 'New Study Goal', hours: goalHours })}
              className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider"
            >
              {'// LOCK OBJECTIVE //'}
            </button>
          </div>
        )}

        {/* 4. Note Modal */}
        {modalType === 'note' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FilePlus className="w-5 h-5 text-emerald-400" />
              <h3 className="font-hud text-sm tracking-wider text-emerald-400 uppercase">File Briefing</h3>
            </div>
            <p className="font-body text-xs text-slate-400 mb-4">
              Add a quick note or chapter summary directly to your study silo.
            </p>

            <div className="space-y-3 mb-5">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title (e.g. Thermodynamics Laws)"
                className="hud-input w-full rounded-lg px-3 py-2.5 text-xs"
              />
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write your note, key equations, or key reminders..."
                rows={4}
                className="hud-input w-full rounded-lg p-3 text-xs resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSave('note', { title: noteTitle || 'Quick ADHD Note', content: noteBody })}
              className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider"
              style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}
            >
              {'// FILE BRIEFING //'}
            </button>
          </div>
        )}

        {/* 5. Habit Modal */}
        {modalType === 'habit' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Repeat className="w-5 h-5 text-purple-400" />
              <h3 className="font-hud text-sm tracking-wider text-purple-400 uppercase">New Protocol</h3>
            </div>
            <p className="font-body text-xs text-slate-400 mb-4">
              Includes ToggleDawn&apos;s 1-day forgiveness buffer so missed days never reset your momentum.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="font-hud text-[8px] tracking-[2px] text-purple-400/50 uppercase block mb-1.5">Protocol Name</label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g. 30 Mins Physics Problem Practice"
                  className="hud-input w-full rounded-lg px-3 py-2.5 text-xs"
                  style={{ borderColor: 'rgba(168, 85, 247, 0.15)' }}
                />
              </div>
              <div className="hud-card p-3 flex items-center gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="font-body">ADHD forgiveness buffer active: 1 missed day allowed per streak.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSave('habit', { name: habitName || 'Daily Deep Study' })}
              className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider"
              style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: '#a855f7' }}
            >
              {'// ACTIVATE PROTOCOL //'}
            </button>
          </div>
        )}

        {/* 6. Time Log Modal */}
        {modalType === 'time' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="font-hud text-sm tracking-wider text-amber-400 text-glow-amber uppercase">Log Ops Time</h3>
            </div>
            <p className="font-body text-xs text-slate-400 mb-4">
              Record time spent studying, revising, or solving practice tests.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="font-hud text-[8px] tracking-[2px] text-amber-400/50 uppercase block mb-1.5">Category</label>
                <select
                  value={timeCategory}
                  onChange={(e) => setTimeCategory(e.target.value)}
                  className="hud-input w-full rounded-lg px-3 py-2.5 text-xs"
                >
                  <option value="Study">Study</option>
                  <option value="Revision">Revision</option>
                  <option value="Test Practice">Test Practice</option>
                  <option value="Reading">Reading</option>
                </select>
              </div>
              <div>
                <label className="font-hud text-[8px] tracking-[2px] text-amber-400/50 uppercase block mb-1.5">Minutes</label>
                <input
                  type="number"
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(e.target.value)}
                  className="hud-input w-full rounded-lg px-3 py-2.5 text-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSave('time', { category: timeCategory, minutes: timeMinutes })}
              className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider"
              style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}
            >
              {'// RECORD OPS LOG //'}
            </button>
          </div>
        )}

        {/* 7. Profile Modal */}
        {modalType === 'profile' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-[#00f0ff]" />
              <h3 className="font-hud text-sm tracking-wider text-[#00f0ff] text-glow-cyan uppercase">Operator Profile</h3>
            </div>
            <p className="font-body text-xs text-slate-400 mb-4">
              Fine-tune your cognitive load settings.
            </p>

            <div className="space-y-3 text-xs text-slate-300 mb-5">
              <div className="hud-card p-3 flex justify-between items-center">
                <span className="font-body">Daily Target Goal:</span>
                <span className="font-data text-[#00f0ff]">
                  {userPreferences?.dailyGoalHours || 8} Hours
                </span>
              </div>
              <div className="hud-card p-3 flex justify-between items-center">
                <span className="font-body">Streak Forgiveness Buffer:</span>
                <span className="font-data text-[#00f0ff]">
                  {userPreferences?.streakForgivenessBuffer ?? 1} Days
                </span>
              </div>
              <div className="hud-card p-3 flex justify-between items-center">
                <span className="font-body">Notifications:</span>
                <span className="font-data text-emerald-400">Enabled</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider"
            >
              {'// CLOSE DOSSIER //'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
