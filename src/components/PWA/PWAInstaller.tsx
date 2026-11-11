'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  WifiOff,
  ShieldCheck,
} from 'lucide-react'

// Helper event name for triggering install from any component
export const PWA_INSTALL_EVENT = 'toggledawn:pwa-install'

export function triggerPWAInstall() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PWA_INSTALL_EVENT))
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAInstaller() {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installedNotification, setInstalledNotification] = useState(false)

  // 1. Check standalone mode and iOS device
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect standalone display mode
    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(Boolean(standaloneCheck))
    if (standaloneCheck) {
      setIsInstalled(true)
    }

    // Detect iOS
    const ua = window.navigator.userAgent
    const isIOSDevice =
      (/iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) &&
      !(window as unknown as { MSStream?: unknown }).MSStream

    setIsIOS(Boolean(isIOSDevice))

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('toggledawn-pwa-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // 2. Register Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('[ToggleDawn PWA] Service Worker active with scope:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[ToggleDawn PWA] New version ready for activation.')
              }
            })
          }
        })
      } catch (error) {
        console.error('[ToggleDawn PWA] Service Worker registration failed:', error)
      }
    }

    // Delay registration slightly to prevent blocking initial paint
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
      return () => window.removeEventListener('load', registerSW)
    }
  }, [])

  // 3. Listen for beforeinstallprompt event (Chromium, Edge, Android)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setCanInstall(true)
      console.log('[ToggleDawn PWA] Native install prompt captured.')
    }

    const handleAppInstalled = () => {
      console.log('[ToggleDawn PWA] Application installed on device!')
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
      setInstalledNotification(true)
      setTimeout(() => setInstalledNotification(false), 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // 4. Install handler
  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        console.log('[ToggleDawn PWA] Operator install choice:', choice.outcome)
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
          setCanInstall(false)
        }
        setDeferredPrompt(null)
      } catch (err) {
        console.error('[ToggleDawn PWA] Install error:', err)
      }
    } else if (isIOS && !isStandalone) {
      setShowIOSModal(true)
    }
  }, [deferredPrompt, isIOS, isStandalone])

  // 5. Global custom event listener
  useEffect(() => {
    const handleGlobalInstallRequest = () => {
      handleInstallClick()
    }

    window.addEventListener(PWA_INSTALL_EVENT, handleGlobalInstallRequest)
    return () => {
      window.removeEventListener(PWA_INSTALL_EVENT, handleGlobalInstallRequest)
    }
  }, [handleInstallClick])

  // Dismiss floating banner
  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('toggledawn-pwa-dismissed', 'true')
  }

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup')

  if (isAuthPage) {
    return null
  }

  // If already running standalone or installed, don't show the banner
  const showBanner = !isStandalone && !isInstalled && !isDismissed && (canInstall || isIOS)

  return (
    <>
      {/* ===== 1. SUCCESS NOTIFICATION TOAST ===== */}
      {installedNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#060e1a]/95 backdrop-blur-xl border border-[#00ff9d]/50 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,157,0.25)] text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-[#00ff9d]/20 border border-[#00ff9d]/50 flex items-center justify-center text-[#00ff9d]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-hud text-xs font-bold text-[#00ff9d] tracking-wider">
              INSTALL COMPLETE
            </p>
            <p className="font-data text-[11px] text-slate-300">
              ToggleDawn Command Center is now installed on your device.
            </p>
          </div>
        </div>
      )}

      {/* ===== 2. SPATIAL FLOATING INSTALL HUD PILL ===== */}
      {showBanner && (
        <aside
          role="region"
          aria-label="PWA Installation Prompt"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 max-w-sm rounded-2xl bg-[#060e1a]/95 dark:bg-[#060e1a]/95 backdrop-blur-2xl border border-[rgba(0,240,255,0.35)] shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(0,240,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.15)] p-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300 group"
        >
          {/* Tech Corner Accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00f0ff]/60 rounded-tl pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#00f0ff]/60 rounded-br pointer-events-none" />

          <div className="flex items-start gap-3">
            {/* Holographic Icon Badge */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/25 to-[#a855f7]/20 border border-[#00f0ff]/50 flex items-center justify-center text-[#00f0ff] shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <Download className="w-5 h-5 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00ff9d] border-2 border-[#060e1a] shadow-[0_0_6px_#00ff9d]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-hud text-xs font-bold text-white tracking-wider">
                  INSTALL TOGGLEDAWN
                </span>
                <span className="font-mono text-[9px] bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded px-1.5 py-0.2">
                  PWA
                </span>
              </div>
              <p className="font-data text-[11px] text-slate-400 leading-snug">
                Install as a standalone application for offline access, instant telemetry &amp; full-screen HUD.
              </p>

              {/* Action Buttons */}
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-hud text-xs font-bold tracking-wider text-black bg-[#00f0ff] hover:bg-[#38bdf8] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-200 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>INSTALL APP</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-xl font-data text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            {/* Close / Dismiss */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss install banner"
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ===== 3. IOS INSTALL INSTRUCTIONS MODAL ===== */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#060e1d] border border-[rgba(0,240,255,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.15)] p-5 text-slate-200">
            {/* Tech Corner Accents */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00f0ff] rounded-tl pointer-events-none" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00f0ff] rounded-tr pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#00f0ff] rounded-bl pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#00f0ff] rounded-br pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-hud text-sm font-bold text-white tracking-wider">
                    INSTALL ON IOS SAFARI
                  </h3>
                  <p className="font-data text-[10px] text-[#00f0ff]/80">
                    APPLE HOMESCREEN PROTOCOL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 font-data text-xs text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] font-bold font-hud text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">Tap the Share icon in Safari</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Located in Safari bottom toolbar:
                    <Share2 className="w-3.5 h-3.5 text-[#00f0ff] inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] font-bold font-hud text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">Select &quot;Add to Home Screen&quot;</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Scroll down the share sheet and tap:
                    <PlusSquare className="w-3.5 h-3.5 text-[#00ff9d] inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] font-bold font-hud text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">Confirm Installation</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap <strong className="text-white">&quot;Add&quot;</strong> in the top-right corner to place ToggleDawn on your Home Screen.
                  </p>
                </div>
              </div>
            </div>

            {/* Offline & Standalone Perks */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-[#00f0ff]">
                <ShieldCheck className="w-3.5 h-3.5" /> STANDALONE UI
              </span>
              <span className="flex items-center gap-1 text-[#00ff9d]">
                <WifiOff className="w-3.5 h-3.5" /> OFFLINE READY
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl font-hud text-xs font-bold tracking-wider text-black bg-[#00f0ff] hover:bg-[#38bdf8] transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] uppercase"
            >
              UNDERSTOOD // RETURN TO HUD
            </button>
          </div>
        </div>
      )}
    </>
  )
}

