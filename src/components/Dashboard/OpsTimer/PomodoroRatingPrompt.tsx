'use client'

import React, { useState, useEffect } from 'react'
import { Check, Sparkles, X, Coffee } from 'lucide-react'
import {
  useOpsTimerStore,
  PomodoroRatingEmoji,
  PomodoroRatingLabel,
  PomodoroRatingScore,
} from '@/stores/useOpsTimerStore'

interface RatingOption {
  emoji: PomodoroRatingEmoji
  label: PomodoroRatingLabel
  displayLabel: string
  score: PomodoroRatingScore
  color: string
  bgGlow: string
}

const RATING_OPTIONS: RatingOption[] = [
  {
    emoji: '😭',
    label: 'very-sad',
    displayLabel: 'Very Sad',
    score: 1,
    color: '#ef4444',
    bgGlow: 'rgba(239, 68, 68, 0.2)',
  },
  {
    emoji: '🙁',
    label: 'sad',
    displayLabel: 'Sad',
    score: 2,
    color: '#f97316',
    bgGlow: 'rgba(249, 115, 22, 0.2)',
  },
  {
    emoji: '😐',
    label: 'good',
    displayLabel: 'Good',
    score: 3,
    color: '#eab308',
    bgGlow: 'rgba(234, 179, 8, 0.2)',
  },
  {
    emoji: '😊',
    label: 'happy',
    displayLabel: 'Happy',
    score: 4,
    color: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.2)',
  },
  {
    emoji: '🥳',
    label: 'hurray',
    displayLabel: 'Hurray!',
    score: 5,
    color: '#00f0ff',
    bgGlow: 'rgba(0, 240, 255, 0.25)',
  },
]

export const PomodoroRatingPrompt: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false)
  const { session, pendingRatingPrompt, rateLastPomodoro, dismissRatingPrompt } = useOpsTimerStore()
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !pendingRatingPrompt || !session) return null

  const pomodoroNum = session.pomodorosCompleted || 1

  const handleSelect = (opt: RatingOption) => {
    setSelectedScore(opt.score)
    setSubmitted(true)
    rateLastPomodoro(opt.emoji, opt.label, opt.score)

    setTimeout(() => {
      setSubmitted(false)
      setSelectedScore(null)
    }, 1500)
  }

  return (
    <aside
      aria-label="Pomodoro Focus Rating"
      className="fixed bottom-24 sm:bottom-28 right-3 left-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="hud-card-3d relative p-4 sm:p-5 border border-[#00f0ff]/40 bg-[#060e1d]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(0,240,255,0.15)] rounded-2xl overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#10b981] to-[#f59e0b]" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={dismissRatingPrompt}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Dismiss rating"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5 pr-8">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-hud text-xs tracking-wider text-[#00f0ff] uppercase">
              Sprint {pomodoroNum} Complete
            </h4>
            <p className="font-data text-[9px] text-slate-400 tracking-wider">
              5-MIN TACTICAL BREAK ACTIVE
            </p>
          </div>
        </div>

        {/* Prompt Question */}
        <p className="font-body text-xs text-slate-200 mt-2 mb-3">
          How was your focus during the past 25-minute block?
        </p>

        {/* 5-Point Emoji Scale */}
        <div className="grid grid-cols-5 gap-2 my-2">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = selectedScore === opt.score
            return (
              <button
                key={opt.score}
                type="button"
                onClick={() => handleSelect(opt)}
                disabled={submitted}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'border-[#00f0ff] bg-[#00f0ff]/20 shadow-[0_0_16px_rgba(0,240,255,0.4)] scale-105'
                    : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 16px ${opt.bgGlow}` : undefined,
                }}
              >
                <span className="text-2xl sm:text-3xl filter drop-shadow group-hover:scale-110 transition-transform select-none">
                  {opt.emoji}
                </span>
                <span className="font-data text-[8px] uppercase tracking-wider text-slate-400 mt-1 truncate max-w-full">
                  {opt.displayLabel}
                </span>
              </button>
            )
          })}
        </div>

        {/* Submission Confirmation Pill */}
        {submitted ? (
          <div className="mt-2.5 py-1.5 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-1.5 text-emerald-300 font-data text-[10px] tracking-wider animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>RATING BUFFERED IN SESSION CACHE</span>
          </div>
        ) : (
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-data text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#f59e0b]" />
              Stored temporarily until goal finish
            </span>
            <button
              type="button"
              onClick={dismissRatingPrompt}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

