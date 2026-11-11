'use client'

import React from 'react'
import { Camera, Target, FilePlus, Repeat } from 'lucide-react'
import { useCapturedAssetsStore } from '@/stores/useCapturedAssetsStore'

export interface QuickActionsProps {
  onActionClick: (action: 'camera' | 'goal' | 'note' | 'habit') => void
}

const actions = [
  {
    key: 'camera' as const,
    label: 'CAMERA',
    Icon: Camera,
    glowClass: 'glow-red',
    color: 'text-[#ef4444]',
    borderColor: 'rgba(239,68,68,0.35)',
    hoverBorder: 'rgba(239,68,68,0.7)',
    bgGlow: 'rgba(239,68,68,0.08)',
    shadowColor: '239,68,68',
  },
  {
    key: 'goal' as const,
    label: 'TARGET',
    Icon: Target,
    glowClass: 'glow-cyan',
    color: 'text-[#00f0ff]',
    borderColor: 'rgba(0,240,255,0.35)',
    hoverBorder: 'rgba(0,240,255,0.7)',
    bgGlow: 'rgba(0,240,255,0.08)',
    shadowColor: '0,240,255',
  },
  {
    key: 'note' as const,
    label: 'INTEL',
    Icon: FilePlus,
    glowClass: 'glow-emerald',
    color: 'text-[#10b981]',
    borderColor: 'rgba(16,185,129,0.35)',
    hoverBorder: 'rgba(16,185,129,0.7)',
    bgGlow: 'rgba(16,185,129,0.08)',
    shadowColor: '16,185,129',
  },
  {
    key: 'habit' as const,
    label: 'ROUTINE',
    Icon: Repeat,
    glowClass: 'glow-purple',
    color: 'text-[#a855f7]',
    borderColor: 'rgba(168,85,247,0.35)',
    hoverBorder: 'rgba(168,85,247,0.7)',
    bgGlow: 'rgba(168,85,247,0.08)',
    shadowColor: '168,85,247',
  },
]

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const [mounted, setMounted] = React.useState(false)
  const rawDraftCount = useCapturedAssetsStore((s) => s.getDraftCount())
  const draftCount = mounted ? rawDraftCount : 0

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
      {actions.map(({ key, label, Icon, color, borderColor, hoverBorder, bgGlow, shadowColor }) => (
        <button
          key={key}
          type="button"
          onClick={() => onActionClick(key)}
          className="group relative hud-card-3d corner-brackets flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-300 active:scale-95 hover:scale-105"
          style={{
            borderColor: borderColor,
            background: `radial-gradient(ellipse at center, ${bgGlow}, transparent 70%), rgba(6,15,30,0.7)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = hoverBorder
            e.currentTarget.style.boxShadow = `0 0 24px rgba(${shadowColor},0.35), inset 0 0 20px rgba(${shadowColor},0.06)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Draft count badge on Camera button */}
          {key === 'camera' && draftCount > 0 && (
            <span
              title={`${draftCount} drafts awaiting structure in vault`}
              className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.2 rounded-full bg-amber-500/30 border border-amber-500/70 text-amber-300 font-mono text-[8px] animate-pulse flex items-center gap-0.5"
            >
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              {draftCount}
            </span>
          )}

          {/* Hexagonal clip container for icon */}
          <div
            className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110"
            style={{
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
              background: `linear-gradient(135deg, rgba(${shadowColor},0.15), rgba(${shadowColor},0.05))`,
            }}
          >
            {/* Inner hex border */}
            <div
              className="absolute inset-[1px] flex items-center justify-center"
              style={{
                clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                background: `radial-gradient(circle at center, rgba(${shadowColor},0.12), rgba(3,7,18,0.9))`,
              }}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color} stroke-[1.8] drop-shadow-[0_0_6px_rgba(${shadowColor},0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(${shadowColor},0.9)]`} />
            </div>
          </div>

          {/* Label */}
          <span className="font-hud text-[8px] sm:text-[9px] uppercase tracking-[2px] text-slate-400 group-hover:text-slate-200 transition-colors duration-300">
            {label}
          </span>

          {/* Scan line effect on hover */}
          <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div
              className="absolute inset-x-0 h-[1px] animate-pulse"
              style={{
                top: '50%',
                background: `linear-gradient(90deg, transparent, rgba(${shadowColor},0.3), transparent)`,
              }}
            />
          </div>
        </button>
      ))}
    </div>
  )
}
