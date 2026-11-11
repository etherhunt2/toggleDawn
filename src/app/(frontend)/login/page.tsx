'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { Shield, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle2, UserPlus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/useAuthStore'

export default function LoginPage({ initialMode }: { initialMode?: 'login' | 'signup' } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const { login, signup, isLoading, error, clearError } = useAuthStore()

  // Mode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    if (initialMode) return initialMode
    if (pathname?.includes('signup')) return 'signup'
    return 'login'
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Verify server session on mount to prevent stale-session redirect loops
  useEffect(() => {
    let isMounted = true

    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            useAuthStore.setState({
              user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role || 'user',
              },
              isAuthenticated: true,
            })
            if (isMounted) {
              window.location.href = '/'
            }
            return
          }
        }
      } catch {
        // Network or server error
      }

      // No active server session — clear any stale localStorage
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('toggle-dawn-auth')
      }
      if (isMounted) {
        setIsVerifying(false)
      }
    }

    verifyAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  // GSAP entrance animation
  useEffect(() => {
    if (isVerifying) return

    const ctx = gsap.context(() => {
      // Grid background pulse
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { opacity: 0 },
          { opacity: 0.15, duration: 2, ease: 'power2.out' },
        )
      }

      // Logo shield entrance
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { scale: 0, rotateY: 180, opacity: 0 },
          { scale: 1, rotateY: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)', delay: 0.3 },
        )
      }

      // Card slide up
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 },
        )
      }

      // Form fields stagger
      if (formRef.current) {
        const fields = formRef.current.querySelectorAll('.form-field')
        gsap.fromTo(
          fields,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.7 },
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [isVerifying])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)

    if (authMode === 'signup') {
      if (password.length < 6) {
        setValidationError('Access code must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setValidationError('Access codes do not match.')
        return
      }

      const success = await signup(email.trim(), password, name.trim() || undefined)
      if (success) {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: -40,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
              window.location.href = '/'
            },
          })
        } else {
          window.location.href = '/'
        }
      }
    } else {
      const success = await login(email.trim(), password)
      if (success) {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: -40,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
              window.location.href = '/'
            },
          })
        } else {
          window.location.href = '/'
        }
      }
    }
  }

  if (isVerifying) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--bg-primary, #0a0a0f)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--hud-accent, #00ff9d)' }} />
          <p className="font-data text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted, #8892b0)' }}>
            VERIFYING OPERATOR CREDENTIALS...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen py-10 flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-primary, #0a0a0f)' }}
    >
      {/* Animated grid background */}
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 157, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 157, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(0, 255, 157, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Scan line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none animate-scan-down"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0, 255, 157, 0.3), transparent)',
        }}
      />

      <div ref={cardRef} className="w-full max-w-md px-4 relative z-10">
        <Card className="border border-[var(--hud-border,rgba(0,255,157,0.2))] bg-[var(--bg-secondary,rgba(10,10,20,0.95))] backdrop-blur-xl shadow-2xl shadow-[rgba(0,255,157,0.05)]">
          <CardContent className="p-7 sm:p-8">
            {/* Logo / Shield */}
            <div className="flex flex-col items-center mb-6">
              <div
                ref={logoRef}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,255,157,0.25)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0, 255, 157, 0.2), rgba(0, 255, 157, 0.05))',
                  border: '1px solid rgba(0, 255, 157, 0.4)',
                }}
              >
                <Shield className="w-7 h-7" style={{ color: 'var(--hud-accent, #00ff9d)' }} />
              </div>
              <h1
                className="font-hud text-xl sm:text-2xl tracking-widest text-white"
              >
                TOGGLE DAWN
              </h1>
              <p className="font-data text-xs mt-1" style={{ color: 'var(--text-muted, #8892b0)' }}>
                {authMode === 'login'
                  ? 'SECURE ACCESS — OPERATOR AUTHENTICATION'
                  : 'COMMISSIONING — NEW OPERATOR ENROLLMENT'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-black/60 p-1 mb-6 border border-white/10 font-hud text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  clearError()
                  setValidationError(null)
                }}
                className={`flex-1 py-2 text-center rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 shadow-[0_0_10px_rgba(0,255,157,0.2)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ACCESS CODE // LOGIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  clearError()
                  setValidationError(null)
                }}
                className={`flex-1 py-2 text-center rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                NEW OPERATOR // SIGN UP
              </button>
            </div>

            {/* Error display */}
            {(error || validationError) && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm font-data"
                style={{
                  background: 'rgba(255, 85, 85, 0.1)',
                  border: '1px solid rgba(255, 85, 85, 0.3)',
                  color: '#ff5555',
                }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (Sign Up only) */}
              {authMode === 'signup' && (
                <div className="form-field space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="font-data text-xs tracking-wider uppercase text-slate-300"
                  >
                    Operator Call-sign / Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="h-10 font-data text-sm border-[var(--hud-border,rgba(0,255,157,0.2))] bg-[var(--bg-primary,rgba(10,10,15,0.8))] focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-colors"
                    style={{ color: 'var(--text-primary, #e6f1ff)' }}
                  />
                </div>
              )}

              {/* Email field */}
              <div className="form-field space-y-1.5">
                <Label
                  htmlFor="email"
                  className="font-data text-xs tracking-wider uppercase text-slate-300"
                >
                  Operator ID (Email)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@toggledawn.ops"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10 font-data text-sm border-[var(--hud-border,rgba(0,255,157,0.2))] bg-[var(--bg-primary,rgba(10,10,15,0.8))] focus:border-[var(--hud-accent,#00ff9d)] focus:ring-1 focus:ring-[var(--hud-accent,#00ff9d)] transition-colors"
                  style={{ color: 'var(--text-primary, #e6f1ff)' }}
                />
              </div>

              {/* Password field */}
              <div className="form-field space-y-1.5">
                <Label
                  htmlFor="password"
                  className="font-data text-xs tracking-wider uppercase text-slate-300"
                >
                  Access Code (Password)
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    className="h-10 font-data text-sm pr-10 border-[var(--hud-border,rgba(0,255,157,0.2))] bg-[var(--bg-primary,rgba(10,10,15,0.8))] focus:border-[var(--hud-accent,#00ff9d)] focus:ring-1 focus:ring-[var(--hud-accent,#00ff9d)] transition-colors"
                    style={{ color: 'var(--text-primary, #e6f1ff)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-muted, #8892b0)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {authMode === 'signup' && (
                <div className="form-field space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="font-data text-xs tracking-wider uppercase text-slate-300"
                  >
                    Confirm Access Code
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-10 font-data text-sm border-[var(--hud-border,rgba(0,255,157,0.2))] bg-[var(--bg-primary,rgba(10,10,15,0.8))] focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-colors"
                    style={{ color: 'var(--text-primary, #e6f1ff)' }}
                  />
                </div>
              )}

              {/* Role explanation banner in Sign Up mode */}
              {authMode === 'signup' && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-data text-blue-200/90 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                    <Lock className="w-3.5 h-3.5" /> Normal Operator Access
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Public registration commissions a <strong>Normal User</strong> account with complete access to your personal study dashboard (<code className="text-white">/</code>), notes, flashcards, time logs, and drafts. Access to the <code className="text-white">/admin</code> CMS panel requires administrator authorization.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="form-field pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password || (authMode === 'signup' && !confirmPassword)}
                  className="w-full h-11 font-hud text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-40"
                  style={{
                    background: isLoading
                      ? 'rgba(0, 255, 157, 0.1)'
                      : authMode === 'signup'
                      ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 240, 255, 0.1))'
                      : 'linear-gradient(135deg, rgba(0, 255, 157, 0.2), rgba(0, 255, 157, 0.1))',
                    border:
                      authMode === 'signup'
                        ? '1px solid rgba(0, 240, 255, 0.5)'
                        : '1px solid rgba(0, 255, 157, 0.4)',
                    color: authMode === 'signup' ? '#00f0ff' : 'var(--hud-accent, #00ff9d)',
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {authMode === 'signup' ? 'COMMISSIONING ACCOUNT...' : 'AUTHENTICATING...'}
                    </span>
                  ) : authMode === 'signup' ? (
                    'COMMISSION OPERATOR ACCOUNT'
                  ) : (
                    'INITIATE ACCESS'
                  )}
                </Button>
              </div>
            </form>

            {/* Demo & Admin credentials hint (in login mode) */}
            {authMode === 'login' ? (
              <div
                className="mt-6 p-3 rounded-lg text-center space-y-1.5"
                style={{
                  background: 'rgba(0, 255, 157, 0.04)',
                  border: '1px solid rgba(0, 255, 157, 0.1)',
                }}
              >
                <p className="font-data text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted, #8892b0)' }}>
                  DEFAULT CREDENTIALS
                </p>
                <div className="font-data text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] bg-black/40 p-1.5 rounded border border-white/5">
                    <span className="text-amber-300 font-bold">Admin (Access to /admin + /):</span>
                    <span className="font-mono text-slate-300">admin@toggledawn.com / password</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] bg-black/40 p-1.5 rounded border border-white/5">
                    <span className="text-[#00ff9d] font-bold">Normal User (Access to /):</span>
                    <span className="font-mono text-slate-300">demo-author@example.com / password</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Toggle switch between modes at footer */}
            <div className="mt-5 text-center font-data text-xs text-slate-400">
              {authMode === 'login' ? (
                <p>
                  Need a new personal study console?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup')
                      clearError()
                      setValidationError(null)
                    }}
                    className="text-[#00f0ff] hover:underline font-bold"
                  >
                    Register Normal User
                  </button>
                </p>
              ) : (
                <p>
                  Already have an operator account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login')
                      clearError()
                      setValidationError(null)
                    }}
                    className="text-[#00ff9d] hover:underline font-bold"
                  >
                    Back to Login
                  </button>
                </p>
              )}
            </div>

            {/* Status bar */}
            <div
              className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between font-data text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--text-muted, #8892b0)' }}
            >
              <span>SYS STATUS: OPERATIONAL</span>
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--hud-accent, #00ff9d)' }}
                />
                ROLE-BASED GUARD ACTIVE
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
