'use client'

import React from 'react'
import {
  Trash2,
  Save,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  X,
  Database,
} from 'lucide-react'
import { useToastStore, type HUDToast, type ToastType } from '@/stores/useToastStore'

function getToastVisuals(type: ToastType) {
  switch (type) {
    case 'terminate':
      return {
        borderColor: 'border-rose-500/70',
        glowColor: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
        bgColor: 'bg-[#18050c]/95',
        textColor: 'text-rose-100',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        headerText: '// DATABASE PURGE TELEMETRY',
        icon: Trash2,
        iconColor: 'text-rose-400',
        progressBg: 'bg-rose-500',
      }
    case 'quit':
      return {
        borderColor: 'border-amber-500/70',
        glowColor: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
        bgColor: 'bg-[#1a1005]/95',
        textColor: 'text-amber-100',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        headerText: '// DATABASE SAVE (QUIT EARLY)',
        icon: Save,
        iconColor: 'text-amber-400',
        progressBg: 'bg-amber-500',
      }
    case 'pause':
      return {
        borderColor: 'border-[#00f0ff]/70',
        glowColor: 'shadow-[0_0_25px_rgba(0,240,255,0.35)]',
        bgColor: 'bg-[#041424]/95',
        textColor: 'text-cyan-100',
        badgeBg: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40',
        headerText: '// DATABASE STATE SYNCED (PAUSED)',
        icon: Pause,
        iconColor: 'text-[#00f0ff]',
        progressBg: 'bg-[#00f0ff]',
      }
    case 'resume':
      return {
        borderColor: 'border-emerald-500/70',
        glowColor: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
        bgColor: 'bg-[#051a11]/95',
        textColor: 'text-emerald-100',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        headerText: '// OPS TIMER RESUMED',
        icon: Play,
        iconColor: 'text-emerald-400',
        progressBg: 'bg-emerald-500',
      }
    case 'sync':
      return {
        borderColor: 'border-[#00f0ff]/60',
        glowColor: 'shadow-[0_0_20px_rgba(0,240,255,0.25)]',
        bgColor: 'bg-[#040e1d]/95',
        textColor: 'text-slate-100',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        headerText: '// DATABASE OPERATION IN PROGRESS',
        icon: Loader2,
        iconColor: 'text-[#00f0ff] animate-spin',
        progressBg: 'bg-[#00f0ff]',
      }
    case 'error':
      return {
        borderColor: 'border-red-500/80',
        glowColor: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
        bgColor: 'bg-[#1f0707]/95',
        textColor: 'text-red-100',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
        headerText: '// DATABASE ERROR REPORT',
        icon: AlertTriangle,
        iconColor: 'text-red-400',
        progressBg: 'bg-red-500',
      }
    case 'success':
    default:
      return {
        borderColor: 'border-[#00ff9d]/70',
        glowColor: 'shadow-[0_0_25px_rgba(0,255,157,0.35)]',
        bgColor: 'bg-[#041a12]/95',
        textColor: 'text-emerald-100',
        badgeBg: 'bg-[#00ff9d]/20 text-[#00ff9d] border-[#00ff9d]/40',
        headerText: '// DATABASE TELEMETRY CONFIRMED',
        icon: CheckCircle2,
        iconColor: 'text-[#00ff9d]',
        progressBg: 'bg-[#00ff9d]',
      }
  }
}

export const HUDToastContainer: React.FC = () => {
  const [mounted, setMounted] = React.useState(false)
  const { toasts, dismissToast, showToast } = useToastStore()

  React.useEffect(() => {
    setMounted(true)

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<HUDToast>
      if (customEvent?.detail) {
        const currentToasts = useToastStore.getState().toasts
        if (!currentToasts.some((t) => t.id === customEvent.detail.id)) {
          showToast(customEvent.detail)
        }
      }
    }

    window.addEventListener('toggledawn:hud-toast', handleToastEvent)
    return () => {
      window.removeEventListener('toggledawn:hud-toast', handleToastEvent)
    }
  }, [showToast])

  if (!mounted || !toasts || toasts.length === 0) return null

  return (
    <aside
      aria-label="Database and timer notifications"
      className="fixed top-20 right-3 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-[94vw] sm:max-w-md w-full pointer-events-none"
      style={{ zIndex: 99999 }}
    >
      {toasts.map((toast) => {
        const visual = getToastVisuals(toast.type)
        const Icon = visual.icon

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            style={{ opacity: 1 }}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border ${visual.borderColor} ${visual.bgColor} ${visual.glowColor} backdrop-blur-xl p-3 sm:p-4 text-left transition-all duration-200 shadow-2xl opacity-100`}
          >
            {/* Top scanning line aesthetic */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
              <span className="font-hud text-[9px] tracking-[1.5px] uppercase text-slate-400 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-[#00f0ff]/70" />
                {visual.headerText}
              </span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content row */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className={`w-4 h-4 ${visual.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-hud text-xs sm:text-[13px] font-bold tracking-wide uppercase ${visual.textColor}`}>
                  {toast.title}
                </p>
                <p className="font-data text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {toast.message}
                </p>
                {toast.detail && (
                  <p className="font-mono text-[9px] sm:text-[10px] text-slate-400 mt-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 truncate">
                    {toast.detail}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Progress Accent */}
            {toast.duration && toast.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 overflow-hidden">
                <div
                  className={`h-full ${visual.progressBg} transition-all duration-300 opacity-90`}
                />
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
