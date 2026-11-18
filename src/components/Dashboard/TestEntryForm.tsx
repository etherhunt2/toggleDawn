'use client'

import React, { useState } from 'react'
import { FlaskConical, ListChecks, Send } from 'lucide-react'

interface TestEntryFormProps {
  onManageTests?: () => void
  onSubmitScore?: (data: any) => void
}

export const TestEntryForm: React.FC<TestEntryFormProps> = ({ onManageTests, onSubmitScore }) => {
  const [examName, setExamName] = useState('')
  const [subject, setSubject] = useState('')
  const [scoreObtained, setScoreObtained] = useState('')
  const [totalScore, setTotalScore] = useState('')
  const [examDate, setExamDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!examName || !scoreObtained || !totalScore) return

    setSubmitting(true)
    const payload = {
      examName,
      subject: subject || undefined,
      scoreObtained: Number(scoreObtained),
      totalScore: Number(totalScore),
      examDate: examDate || new Date().toISOString().split('T')[0],
    }

    try {
      await fetch('/api/test-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      onSubmitScore?.(payload)
      setSuccess(true)
      setExamName('')
      setSubject('')
      setScoreObtained('')
      setTotalScore('')
      setExamDate('')
      setTimeout(() => setSuccess(false), 2000)
    } catch (_e) {}
    setSubmitting(false)
  }

  const pct = totalScore && scoreObtained ? Math.round((Number(scoreObtained) / Number(totalScore)) * 100) : null

  return (
    <div className="hud-card corner-brackets p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <h3 className="font-hud text-[10px] sm:text-xs tracking-[2px] text-purple-400 uppercase">
            New Test Data Entry
          </h3>
        </div>
        <span className="stamp-classified" style={{ position: 'static', color: 'rgba(168,85,247,0.4)', borderColor: 'rgba(168,85,247,0.2)' }}>
          SCORE
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="font-hud text-[7px] tracking-[2px] text-purple-400/50 uppercase block mb-1">Exam Name *</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. Physics Unit Test 3"
            className="hud-input w-full rounded-lg px-3 py-2 text-xs"
            required
          />
        </div>

        <div>
          <label className="font-hud text-[7px] tracking-[2px] text-purple-400/50 uppercase block mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Physics"
            className="hud-input w-full rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-hud text-[7px] tracking-[2px] text-purple-400/50 uppercase block mb-1">Score *</label>
            <input
              type="number"
              value={scoreObtained}
              onChange={(e) => setScoreObtained(e.target.value)}
              placeholder="75"
              min="0"
              className="hud-input w-full rounded-lg px-3 py-2 text-xs"
              required
            />
          </div>
          <div>
            <label className="font-hud text-[7px] tracking-[2px] text-purple-400/50 uppercase block mb-1">Total *</label>
            <input
              type="number"
              value={totalScore}
              onChange={(e) => setTotalScore(e.target.value)}
              placeholder="100"
              min="1"
              className="hud-input w-full rounded-lg px-3 py-2 text-xs"
              required
            />
          </div>
        </div>

        {pct !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#00f0ff]/5 overflow-hidden">
              <div
                className="h-full rounded-full progress-glow transition-all duration-500"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: pct >= 80 ? 'rgba(16,185,129,0.7)' : pct >= 50 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)',
                }}
              />
            </div>
            <span className="font-data text-[11px] text-slate-400">{pct}%</span>
          </div>
        )}

        <div>
          <label className="font-hud text-[7px] tracking-[2px] text-purple-400/50 uppercase block mb-1">Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="hud-input w-full rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="hud-btn w-full py-2.5 rounded-lg text-[10px] tracking-wider flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}
        >
          <Send className="w-3 h-3" />
          {success ? '// SCORE RECORDED //' : submitting ? '// TRANSMITTING... //' : '// SUBMIT SCORE //'}
        </button>
      </form>

      <button
        type="button"
        onClick={onManageTests ?? (() => window.open('/super-master/collections/test-scores', '_blank'))}
        className="hud-btn w-full py-2 rounded-lg text-[9px] tracking-wider flex items-center justify-center gap-2"
      >
        <ListChecks className="w-3 h-3" />
        MANAGE ALL TESTS
      </button>
    </div>
  )
}

