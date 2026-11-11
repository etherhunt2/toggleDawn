'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  X,
  Sparkles,
  ExternalLink,
  BookOpen,
  FileText,
  Layers,
  Cpu,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { useElasticSearch } from '@/utilities/elasticsearch/useElasticSearch'
import { ElasticDoc } from '@/utilities/elasticsearch/types'

export const DashboardSearchTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    query,
    setQuery,
    hits,
    totalHits,
    maxScore,
    took,
    engine,
    isLoading,
  } = useElasticSearch({
    index: 'all',
    debounceMs: 120,
    size: 8,
    initialAutoFetch: false,
  })

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const getDocIcon = (docType: ElasticDoc['docType']) => {
    switch (docType) {
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
      case 'flashcard':
        return <Layers className="w-3.5 h-3.5 text-[#00ff9d]" />
      case 'intel':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />
      case 'book':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  const getDocBadge = (docType: ElasticDoc['docType']) => {
    switch (docType) {
      case 'note':
        return 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30'
      case 'flashcard':
        return 'bg-[#00ff9d]/15 text-[#00ff9d] border-[#00ff9d]/30'
      case 'intel':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      case 'book':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-72 md:w-80">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          placeholder="SEARCH INTEL (ELASTICSEARCH)..."
          className="hud-input w-full rounded-xl py-2 pl-9 pr-16 text-xs font-data bg-[#060e1a]/90 border border-[rgba(0,240,255,0.3)] focus:border-[#00f0ff] text-slate-100 placeholder:text-slate-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
        />
        <Search className="w-3.5 h-3.5 text-[#00f0ff]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-8 text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}

        {/* Mini Elastic Pill Indicator */}
        <span className="absolute right-2.5 font-mono text-[8px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 px-1 py-0.2 rounded pointer-events-none">
          ES
        </span>
      </div>

      {/* Floating Dropdown Results Popover */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[#060e1d]/95 backdrop-blur-2xl border border-[rgba(0,240,255,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(0,240,255,0.12)] p-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Telemetry */}
          <div className="flex items-center justify-between px-2 py-1 mb-1.5 border-b border-white/5 font-mono text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 text-[#00f0ff]">
              <Sparkles className="w-3 h-3 text-[#00f0ff]" />
              <span>ELASTIC INTEL</span>
            </span>
            <span className="text-[#00ff9d]">
              {took}ms // BM25: {maxScore.toFixed(2)}
            </span>
          </div>

          {/* Hits List */}
          {hits.length === 0 ? (
            <div className="py-6 text-center text-slate-400 font-data text-xs">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-[#00f0ff]">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>SEARCHING CORPUS...</span>
                </div>
              ) : (
                <p>No matching intel located in index.</p>
              )}
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto hud-scroll">
              {hits.map((hit) => {
                const doc = hit._source
                const targetUrl =
                  doc.url ||
                  (doc.docType === 'flashcard'
                    ? '/flash-cards'
                    : doc.docType === 'intel'
                    ? '/drafts'
                    : `/search?q=${encodeURIComponent(query)}`)

                return (
                  <Link
                    key={`${hit._index}-${hit._id}`}
                    href={targetUrl}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-[rgba(0,240,255,0.08)] border border-transparent hover:border-[rgba(0,240,255,0.25)] transition-all group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getDocIcon(doc.docType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-hud text-[8px] font-bold tracking-wider uppercase border ${getDocBadge(
                            doc.docType
                          )}`}
                        >
                          {doc.docType}
                        </span>
                        <p className="font-hud text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors truncate">
                          {doc.title || doc.frontPrompt}
                        </p>
                      </div>

                      {doc.formula && (
                        <p className="font-mono text-[10px] text-[#00f0ff] truncate">
                          {doc.formula}
                        </p>
                      )}

                      <p className="font-data text-[10px] text-slate-400 line-clamp-1">
                        {doc.description || doc.content || doc.backSolution || ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                        {hit._score.toFixed(1)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* View Full Results in Codex Link */}
          <div className="mt-2 pt-1.5 border-t border-white/5">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg font-hud text-[11px] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.1)] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>VIEW ALL IN ELASTICSEARCH CODEX</span>
                <span className="font-mono text-[9px] text-slate-400">({totalHits} hits)</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

