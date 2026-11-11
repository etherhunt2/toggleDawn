'use client'

import React, { useState, useEffect } from 'react'
import { Search as SearchIcon, Sparkles } from 'lucide-react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()

  const debouncedValue = useDebounce(value, 250)

  useEffect(() => {
    if (debouncedValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(debouncedValue.trim())}`)
    }
  }, [debouncedValue, router])

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) {
            router.push(`/search?q=${encodeURIComponent(value.trim())}`)
          }
        }}
      >
        <div className="relative flex items-center">
          <SearchIcon className="w-4 h-4 text-[#00f0ff] absolute left-3.5 pointer-events-none" />
          <input
            id="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ELASTICSEARCH CODEX (BOOKS, FORMULAS, NOTES)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-black/60 border border-[rgba(0,240,255,0.3)] focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] text-white font-data text-xs placeholder:text-slate-500 outline-none transition-all"
          />
          <span className="absolute right-3 flex items-center gap-1 font-mono text-[9px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 px-1.5 py-0.5 rounded pointer-events-none">
            <Sparkles className="w-2.5 h-2.5" /> ELASTIC
          </span>
        </div>
      </form>
    </div>
  )
}
