'use client'

import React, { useEffect } from 'react'
import { Zap } from 'lucide-react'

export interface DopamineRewardProps {
  message: string
  points?: number
  onClose: () => void
}

export const DopamineReward: React.FC<DopamineRewardProps> = ({
  message,
  points = 15,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="hud-card corner-brackets flex items-center gap-3 px-5 py-3 glow-cyan">
        <div className="w-7 h-7 rounded-full bg-[#00f0ff]/15 flex items-center justify-center animate-bounce">
          <Zap className="w-4 h-4 text-[#00f0ff]" />
        </div>
        <span className="font-hud text-[10px] sm:text-[11px] tracking-[2px] uppercase text-[#00f0ff] text-glow-cyan">
          {message}
        </span>
        <span className="font-data text-[11px] px-2.5 py-0.5 rounded-md bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff]">
          +{points} XP
        </span>
      </div>
    </div>
  )
}
