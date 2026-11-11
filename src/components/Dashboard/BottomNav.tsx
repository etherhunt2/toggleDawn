'use client'

import React from 'react'
import Link from 'next/link'
import { Home, BookOpen, Calendar, User, Plus } from 'lucide-react'

export interface BottomNavProps {
  activeTab?: 'home' | 'study' | 'schedule' | 'profile'
  onTabChange?: (tab: 'home' | 'study' | 'schedule' | 'profile') => void
  onPlusClick: () => void
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab = 'home',
  onTabChange,
  onPlusClick,
}) => {
  const tabs = [
    { key: 'home' as const, label: 'HOME', Icon: Home, isLink: false },
    { key: 'study' as const, label: 'STUDY', Icon: BookOpen, isLink: true, href: '/books' },
    null, // center button placeholder
    { key: 'schedule' as const, label: 'OPS', Icon: Calendar, isLink: false },
    { key: 'profile' as const, label: 'PROFILE', Icon: User, isLink: false },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl z-50 pointer-events-none">
      <div className="hud-dock pointer-events-auto mx-2 sm:mx-4 mb-2 sm:mb-3 rounded-2xl backdrop-blur-xl px-2 sm:px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        {tabs.map((tab, i) => {
          if (!tab) {
            // Center action button — fused with panel, prominent in center, no personal border
            return (
              <button
                key="plus"
                type="button"
                onClick={onPlusClick}
                aria-label="Quick Action"
                className="relative flex flex-col items-center justify-center flex-1 py-1 text-[#00f0ff] hover:text-white transition-all group"
              >
                <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.8] drop-shadow-[0_0_10px_rgba(0,240,255,0.7)] group-hover:scale-115 group-active:scale-95 transition-transform" />
              </button>
            )
          }

          const isActive = activeTab === tab.key
          const content = (
            <>
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff]" />
              )}
              <tab.Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 stroke-[1.8] ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]' : ''}`} />
              <span className="font-hud text-[7px] sm:text-[8px] tracking-[1px]">{tab.label}</span>
            </>
          )

          const className = `relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive ? 'text-[#00f0ff]' : 'text-slate-600 hover:text-slate-400'
          }`

          if (tab.isLink && tab.href) {
            return (
              <Link key={tab.key} href={tab.href} onClick={() => onTabChange?.(tab.key)} className={className}>
                {content}
              </Link>
            )
          }

          return (
            <button key={tab.key} type="button" onClick={() => onTabChange?.(tab.key)} className={className}>
              {content}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
