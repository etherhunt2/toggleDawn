import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen pt-20 pb-24 px-4 sm:px-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* ── TOP HUD TELEMETRY SKELETON ── */}
      <div className="relative mb-6 p-4 rounded-2xl bg-[#060e1a]/80 border border-[#00f0ff]/20 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00f0ff]/60 rounded-tl pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00f0ff]/60 rounded-tr pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-36 h-3.5 rounded bg-white/10 animate-pulse" />
              <div className="w-24 h-2.5 rounded bg-[#00f0ff]/20 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
            <span className="font-hud text-[10px] text-[#00f0ff] uppercase tracking-widest hidden sm:inline">
              SYNCHRONIZING TELEMETRY...
            </span>
          </div>
        </div>
      </div>

      {/* ── GRID SKELETON CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-20 h-2.5 rounded bg-white/10 animate-pulse" />
              <div className="w-5 h-5 rounded-lg bg-[#00f0ff]/10 animate-pulse" />
            </div>
            <div className="w-28 h-6 rounded bg-white/15 animate-pulse mb-2" />
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="w-1/3 h-full bg-[#00f0ff]/40 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN WORKSPACE SKELETON ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="w-48 h-4 rounded bg-white/10 animate-pulse" />
            <div className="w-20 h-3 rounded bg-[#00f0ff]/20 animate-pulse" />
          </div>
          <div className="h-48 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="inline-block w-8 h-8 rounded-full border-2 border-[#00f0ff]/30 border-t-[#00f0ff] animate-spin" />
              <p className="font-hud text-xs text-slate-400 tracking-widest uppercase">
                STREAMING NEURAL NODE DATA
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
          <div className="w-32 h-4 rounded bg-white/10 animate-pulse pb-3 border-b border-white/5" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                <div className="w-3/4 h-3 rounded bg-white/10 animate-pulse" />
                <div className="w-1/2 h-2 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
