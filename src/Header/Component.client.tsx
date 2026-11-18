'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Header as HeaderType } from '@/payload-types'
import { useTheme } from '@/providers/Theme'
import { themeLocalStorageKey } from '@/providers/Theme/ThemeSelector/types'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Search,
  Shield,
  SlidersHorizontal,
  LogOut,
  LogIn,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Target,
  Clock,
  Sparkles,
  ExternalLink,
  Inbox,
  Download,
} from 'lucide-react'
import { useCapturedAssetsStore } from '@/stores/useCapturedAssetsStore'
import { triggerPWAInstall } from '@/components/PWA/PWAInstaller'

interface HeaderClientProps {
  data?: HeaderType
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const PRIMARY_NAV: NavItem[] = [
  {
    label: 'OPERATIONS',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'FLASH CARDS',
    href: '/flash-cards',
    icon: Layers,
    badge: 'DRILL',
  },
  {
    label: 'MANUALS',
    href: '/books',
    icon: BookOpen,
  },
  {
    label: 'CODEX',
    href: '/search',
    icon: Search,
  },
  {
    label: 'DRAFTS',
    href: '/drafts',
    icon: Inbox,
    badge: 'VAULT',
  },
]

export const HeaderClient: React.FC<HeaderClientProps> = () => {
  const pathname = usePathname()
  const { setTheme: setGlobalTheme } = useTheme()
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()
  const rawDraftCount = useCapturedAssetsStore((s) => s.getDraftCount())

  const [mounted, setMounted] = useState(false)
  const [currentThemeValue, setCurrentThemeValue] = useState<string>('auto')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const draftCount = mounted ? rawDraftCount : 0

  // Mount tracking to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Verify auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Sync theme preference from localStorage on mount
  useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setCurrentThemeValue(preference ?? 'auto')
  }, [])

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  // Handle click outside & escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const applyTheme = (mode: 'dark' | 'light' | 'auto') => {
    setCurrentThemeValue(mode)
    if (mode === 'auto') {
      setGlobalTheme(null)
    } else {
      setGlobalTheme(mode)
    }
  }

  const cycleTheme = () => {
    const order = ['dark', 'light', 'auto'] as const
    const currentIdx = order.indexOf(currentThemeValue as any)
    const next = order[(currentIdx + 1) % order.length]
    applyTheme(next)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore network errors
    }
    await logout()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('toggle-dawn-auth')
      window.localStorage.removeItem('toggledawn_ops_timer_session')
      window.localStorage.removeItem('toggledawn_ops_timer_paused')
      window.location.href = '/login'
    }
  }

  const getInitials = () => {
    if (!user) return 'OP'
    if (user.name) {
      const parts = user.name.trim().split(/\s+/)
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return user.name.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'OP'
  }

  const isAuth = mounted && isAuthenticated

  const isAdmin =
    mounted &&
    (user?.role === 'admin' ||
      user?.email === 'admin@toggledawn.com')

  const ThemeIcon =
    currentThemeValue === 'dark' ? Moon : currentThemeValue === 'light' ? Sun : Monitor

  // Completely hide Header Navbar & Spatial Dock on Login and Signup pages
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup')

  if (isAuthPage) {
    return null
  }

  return (
    <header className="sticky top-2 z-40 w-full px-3 md:px-6 mb-3">
      <div className="max-w-7xl mx-auto relative">
        {/* ===== MAIN SPATIAL DOCK ===== */}
        <div className="relative flex items-center justify-between h-14 md:h-16 px-4 md:px-6 rounded-2xl bg-[#060e1a]/80 dark:bg-[#060e1a]/85 backdrop-blur-2xl border border-[rgba(0,240,255,0.22)] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(0,240,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300">
          
          {/* Spatial Corner Accent Bracket (Top-Left) */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00f0ff]/50 rounded-tl pointer-events-none" />
          {/* Spatial Corner Accent Bracket (Bottom-Right) */}
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#00f0ff]/50 rounded-br pointer-events-none" />

          {/* ===== BRAND IDENTITY / LOGO ===== */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Spatial Hex Badge */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 via-[#00ff9d]/10 to-transparent border border-[#00f0ff]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)] group-hover:border-[#00f0ff] group-hover:shadow-[0_0_18px_rgba(0,240,255,0.4)] transition-all duration-300">
                <Shield className="w-4 h-4 text-[#00f0ff] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-hud text-sm md:text-base font-black tracking-widest bg-gradient-to-r from-white via-[#00f0ff] to-[#00ff9d] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  TOGGLE DAWN
                </span>
                <span className="font-data text-[9px] tracking-wider text-[#00f0ff]/70 hidden sm:inline -mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_6px_#00ff9d] animate-pulse" />
                  OPERATIONAL HUB // v2.4
                </span>
              </div>
            </Link>
          </div>

          {/* ===== CENTER: SPATIAL NAVIGATION CAPSULE (Restricted to Authenticated Operators) ===== */}
          {isAuth ? (
            <nav className="hidden md:flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
              {PRIMARY_NAV.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-data text-xs tracking-wider transition-all duration-200 group ${
                      isActive
                        ? 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] shadow-[0_0_14px_rgba(0,240,255,0.2)] font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? 'text-[#00f0ff]' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>

                    {item.href === '/drafts' && draftCount > 0 ? (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono tracking-normal uppercase rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse">
                        {draftCount} DRAFT
                      </span>
                    ) : item.badge ? (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono tracking-normal uppercase rounded bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40">
                        {item.badge}
                      </span>
                    ) : null}

                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
                    )}
                  </Link>
                )
              })}
            </nav>
          ) : null}

          {/* ===== RIGHT CONTROLS: SEARCH, THEME & USER AVATAR ===== */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Search Trigger (Only for Authenticated Operators) */}
            {isAuth ? (
              <Link
                href="/search"
                aria-label="Search Codex"
                className="hidden lg:flex items-center gap-2 bg-[#0b1322]/80 hover:bg-[#101b30] border border-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.4)] rounded-xl px-3 py-1.5 transition-all duration-200 group"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00f0ff] transition-colors" />
                <span className="font-data text-xs text-slate-400 group-hover:text-slate-200">
                  Search Codex
                </span>
                <kbd className="font-mono text-[10px] text-slate-500 bg-black/50 border border-white/10 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </Link>
            ) : null}

            {/* Spatial Theme Cycler */}
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={`Theme: ${currentThemeValue}`}
              title={`Switch Theme (Current: ${currentThemeValue})`}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/30 hover:bg-white/[0.08] border border-white/5 hover:border-[rgba(0,240,255,0.3)] text-slate-400 hover:text-[#00f0ff] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <ThemeIcon className="w-4 h-4 transition-transform hover:rotate-12" />
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-[rgba(0,240,255,0.15)] mx-0.5" />

            {/* ===== USER AVATAR WITH SPATIAL DROPDOWN ===== */}
            {isAuth ? (
              <div ref={dropdownRef} className="relative">
                {/* Avatar Trigger Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2.5 p-1 rounded-xl transition-all duration-200 border ${
                    dropdownOpen
                      ? 'bg-[rgba(0,240,255,0.12)] border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'hover:bg-white/[0.05] border-transparent hover:border-white/10'
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Glowing Spatial Avatar Ring */}
                  <div className="relative">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-[#00f0ff]/25 via-[#00ff9d]/15 to-[#050b14] border border-[#00f0ff]/50 flex items-center justify-center font-hud text-xs font-bold text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.25)]">
                      {getInitials()}
                    </div>
                    {/* Live Status Beacon */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff9d] border-2 border-[#060e1a] shadow-[0_0_6px_#00ff9d] animate-pulse" />
                  </div>

                  {/* Operator Info (Desktop) */}
                  <div className="hidden xl:flex flex-col text-left pr-1">
                    <span className="font-data text-xs font-semibold text-slate-200 tracking-wider truncate max-w-[110px]">
                      {user?.name || user?.email?.split('@')[0] || 'OPERATOR'}
                    </span>
                    <span className="font-hud text-[9px] text-[#00f0ff]/80 tracking-widest">
                      {isAdmin ? 'CLEARANCE L5' : 'OPERATOR L1'}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-[#00f0ff]' : ''
                    }`}
                  />
                </button>

                {/* ===== SPATIAL DROPDOWN MENU ===== */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 z-50 rounded-2xl bg-[#060e1d]/95 backdrop-blur-2xl border border-[rgba(0,240,255,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.12),inset_0_1px_1px_rgba(255,255,255,0.12)] p-2.5 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Header: Operator Credentials Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[rgba(0,240,255,0.08)] to-transparent border border-[rgba(0,240,255,0.15)] mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#00ff9d]/20 border border-[#00f0ff]/40 flex items-center justify-center font-hud text-sm font-bold text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                          {getInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-hud text-xs font-bold text-white tracking-wider truncate">
                            {user?.name || 'OPERATOR'}
                          </p>
                          <p className="font-data text-[11px] text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between font-data text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold tracking-wider ${
                            isAdmin
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30'
                          }`}
                        >
                          {isAdmin ? 'ADMINISTRATOR' : 'FIELD OPERATOR'}
                        </span>
                        <span className="text-[#00ff9d] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_6px_#00ff9d] animate-pulse" />
                          ENCRYPTED SESSION
                        </span>
                      </div>
                    </div>

                    {/* Section: Mission Directives & Important Links */}
                    <div className="space-y-0.5">
                      <p className="px-2.5 py-1 font-data text-[9px] font-bold text-[#00f0ff]/70 tracking-widest uppercase">
                        COMMAND DIRECTIVES
                      </p>

                      {/* Payload CMS Admin Panel (Exclusive to Administrators) */}
                      {isAdmin && (
                        <a
                          href="/super-master"
                          className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[rgba(0,240,255,0.1)] border border-transparent hover:border-[rgba(0,240,255,0.25)] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-hud text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                                PAYLOAD CMS CORE
                              </p>
                              <p className="font-data text-[10px] text-slate-400">
                                Database & CMS Admin Panel
                              </p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded px-1.5 py-0.5">
                            PANEL <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </a>
                      )}

                      {/* Operations Dashboard */}
                      <Link
                        href="/"
                        prefetch={true}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-105 transition-transform">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-hud text-xs font-semibold text-slate-200 group-hover:text-[#00f0ff] transition-colors">
                            OPERATIONS CENTER
                          </p>
                          <p className="font-data text-[10px] text-slate-400">
                            Home study dashboard & telemetry
                          </p>
                        </div>
                      </Link>

                      {/* Flash Cards */}
                      <Link
                        href="/flash-cards"
                        prefetch={true}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center text-[#00ff9d] group-hover:scale-105 transition-transform">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-hud text-xs font-semibold text-slate-200 group-hover:text-[#00ff9d] transition-colors">
                            TACTICAL FLASH CARDS
                          </p>
                          <p className="font-data text-[10px] text-slate-400">
                            Spaced repetition drills
                          </p>
                        </div>
                      </Link>

                      {/* Manuals & Books */}
                      <Link
                        href="/books"
                        prefetch={true}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-hud text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                            FIELD MANUALS & BOOKS
                          </p>
                          <p className="font-data text-[10px] text-slate-400">
                            Coursebooks & chapters
                          </p>
                        </div>
                      </Link>

                      {/* Codex Search */}
                      <Link
                        href="/search"
                        prefetch={true}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-hud text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                            GLOBAL CODEX SEARCH
                          </p>
                          <p className="font-data text-[10px] text-slate-400">
                            Query formulas, notes & scores
                          </p>
                        </div>
                      </Link>

                      {/* Drafts & Captured Vault */}
                      <Link
                        href="/drafts"
                        prefetch={true}
                        className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[rgba(245,158,11,0.08)] border border-transparent hover:border-amber-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                            <Inbox className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-hud text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                              DRAFTS & ASSET VAULT
                            </p>
                            <p className="font-data text-[10px] text-slate-400">
                              Manage quick-saved & raw captures
                            </p>
                          </div>
                        </div>
                        {draftCount > 0 && (
                          <span className="font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded px-1.5 py-0.5 animate-pulse">
                            {draftCount} DRAFT
                          </span>
                        )}
                      </Link>

                      {/* Install Application Directive (PWA) */}
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false)
                          triggerPWAInstall()
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[rgba(0,240,255,0.08)] border border-transparent hover:border-[rgba(0,240,255,0.25)] transition-all group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-105 transition-transform">
                            <Download className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-hud text-xs font-semibold text-slate-200 group-hover:text-[#00f0ff] transition-colors">
                              INSTALL APPLICATION
                            </p>
                            <p className="font-data text-[10px] text-slate-400">
                              Standalone PWA & offline mode
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[9px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 rounded px-1.5 py-0.5">
                          PWA
                        </span>
                      </button>
                    </div>

                    {/* Section: Spatial Theme Selector */}
                    <div className="mt-2 pt-2 border-t border-white/5 px-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-data text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                          THEME DISPLAY
                        </span>
                        <span className="font-mono text-[9px] text-[#00f0ff] uppercase">
                          {currentThemeValue}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => applyTheme('dark')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-data text-[11px] transition-all ${
                            currentThemeValue === 'dark'
                              ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Moon className="w-3 h-3" />
                          <span>Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTheme('light')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-data text-[11px] transition-all ${
                            currentThemeValue === 'light'
                              ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Sun className="w-3 h-3" />
                          <span>Light</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTheme('auto')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-data text-[11px] transition-all ${
                            currentThemeValue === 'auto'
                              ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Monitor className="w-3 h-3" />
                          <span>Auto</span>
                        </button>
                      </div>
                    </div>

                    {/* Section: Logout Action */}
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-hud text-xs tracking-wider uppercase text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
                      >
                        <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <span>TERMINATE SESSION</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* When Not Authenticated — Show Spatial Login Button */
              <Link
                href="/login"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-hud text-xs font-bold tracking-wider text-[#00f0ff] bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.2)] border border-[rgba(0,240,255,0.4)] hover:border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all duration-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">OPERATOR</span>
                <span>LOGIN</span>
              </Link>
            )}

            {/* ===== MOBILE MENU TRIGGER BUTTON ===== */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl bg-black/30 hover:bg-white/[0.08] border border-white/5 text-slate-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ===== MOBILE SPATIAL DRAWER ===== */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-[#060e1d]/95 backdrop-blur-2xl border border-[rgba(0,240,255,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-40 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Primary Nav Links (Only for Authenticated Operators) */}
            {isAuth ? (
              <div className="space-y-1 mb-3">
                {PRIMARY_NAV.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname?.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-data text-xs tracking-wider transition-all ${
                        isActive
                          ? 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)] font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#00f0ff]" />
                        <span>{item.label}</span>
                      </div>
                      {item.href === '/drafts' && draftCount > 0 ? (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse">
                          {draftCount} DRAFT
                        </span>
                      ) : item.badge ? (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            ) : null}

            {/* Quick Link: Admin Panel (Only for Administrators) */}
            {isAdmin && (
              <a
                href="/super-master"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-hud text-xs font-bold mb-3"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>PAYLOAD CMS CORE</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Mobile PWA Install Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                triggerPWAInstall()
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.25)] text-slate-200 font-hud text-xs font-bold mb-3 hover:bg-[rgba(0,240,255,0.15)] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#00f0ff]" />
                <span>INSTALL APP (PWA)</span>
              </div>
              <span className="font-mono text-[9px] bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded px-1.5 py-0.5">
                OFFLINE
              </span>
            </button>

            {/* Mobile Auth Status & Actions */}
            {isAuth ? (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between px-2 font-data text-xs text-slate-400">
                  <span className="truncate max-w-[180px]">{user?.email}</span>
                  <span className="text-[#00ff9d] text-[10px]">ACTIVE</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-hud text-xs text-red-400 bg-red-500/10 border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>TERMINATE SESSION</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-hud text-xs text-[#00f0ff] bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.4)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>OPERATOR AUTHENTICATION</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
