'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  BookOpen,
  Layers,
  FileText,
  Bookmark,
  Cpu,
  Sparkles,
  ExternalLink,
  X,
  Activity,
  Zap,
} from 'lucide-react'
import { useElasticSearch } from '@/utilities/elasticsearch/useElasticSearch'
import { ElasticDoc } from '@/utilities/elasticsearch/types'

interface CodexSearchClientProps {
  initialQuery?: string
}

export function CodexSearchClient({ initialQuery = '' }: CodexSearchClientProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  const {
    query,
    setQuery,
    hits,
    totalHits,
    maxScore,
    took,
    engine,
    aggregations,
    isLoading,
    setTargetIndex,
  } = useElasticSearch({
    defaultQuery: initialQuery,
    index: 'all',
    debounceMs: 120,
    size: 30,
  })

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'all') {
      setTargetIndex('all')
    } else if (tab === 'books' || tab === 'chapters' || tab === 'notes') {
      setTargetIndex('toggledawn_codex')
    } else if (tab === 'flashcards') {
      setTargetIndex('toggledawn_flashcards')
    } else if (tab === 'intel') {
      setTargetIndex('toggledawn_intel')
    }
  }

  // Filter hits by local tab if needed
  const filteredHits = hits.filter((h) => {
    if (activeTab === 'all') return true
    if (activeTab === 'books') return h._source.docType === 'book'
    if (activeTab === 'chapters') return h._source.docType === 'chapter'
    if (activeTab === 'notes') return h._source.docType === 'note'
    if (activeTab === 'flashcards') return h._source.docType === 'flashcard'
    if (activeTab === 'intel') return h._source.docType === 'intel'
    return true
  })

  const getDocTypeIcon = (docType: ElasticDoc['docType']) => {
    switch (docType) {
      case 'book':
        return <BookOpen className="w-4 h-4 text-indigo-400" />
      case 'chapter':
        return <Bookmark className="w-4 h-4 text-purple-400" />
      case 'note':
        return <FileText className="w-4 h-4 text-[#00f0ff]" />
      case 'flashcard':
        return <Layers className="w-4 h-4 text-[#00ff9d]" />
      case 'intel':
        return <Cpu className="w-4 h-4 text-amber-400" />
      default:
        return <FileText className="w-4 h-4 text-slate-400" />
    }
  }

  const getDocTypeColor = (docType: ElasticDoc['docType']) => {
    switch (docType) {
      case 'book':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
      case 'chapter':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30'
      case 'note':
        return 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30'
      case 'flashcard':
        return 'bg-[#00ff9d]/15 text-[#00ff9d] border-[#00ff9d]/30'
      case 'intel':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* ================================================================ */}
      {/* 1. CYBER HEADER & TELEMETRY BAR                                  */}
      {/* ================================================================ */}
      <div className="relative rounded-3xl bg-[#060e1d]/90 border border-[rgba(0,240,255,0.25)] p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(0,240,255,0.1)]">
        {/* Spatial Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff] rounded-tl pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff] rounded-tr pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff] rounded-bl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff] rounded-br pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse" />
              <span className="font-hud text-xs font-bold text-[#00f0ff] tracking-widest uppercase">
                NEURAL CODEX QUERY ENGINE
              </span>
            </div>
            <h1 className="font-hud text-2xl md:text-3xl font-extrabold text-white tracking-wider">
              ELASTICSEARCH CODEX
            </h1>
            <p className="font-data text-xs text-slate-400 mt-1 max-w-xl">
              High-dimensional fuzzy BM25 retrieval across study books, chapters, formulas, field intel, and tactical flash cards.
            </p>
          </div>

          {/* Engine Status Badge */}
          <div className="flex flex-col items-end gap-1.5 font-data text-xs">
            <span className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[rgba(0,240,255,0.12)] border border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span className="font-hud font-bold">
                {engine === 'remote-elasticsearch' ? 'ELASTICSEARCH CLUSTER' : 'EMBEDDED BM25 ENGINE'}
              </span>
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>LATENCY: <strong className="text-[#00ff9d]">{took}ms</strong></span>
              <span>TOP SCORE: <strong className="text-amber-400">{maxScore.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. SEARCH INPUT TERMINAL                                         */}
        {/* ================================================================ */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#00f0ff] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH BOOKS, CHAPTERS, FORMULAS, FLASH CARDS, OR INTEL..."
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-black/60 border border-[rgba(0,240,255,0.35)] focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/20 text-white font-data text-sm placeholder:text-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] outline-none transition-all"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3. FACET FILTER TABS                                             */}
        {/* ================================================================ */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none font-hud text-xs">
          {[
            { id: 'all', label: 'ALL INDICES' },
            { id: 'notes', label: 'STUDY NOTES' },
            { id: 'flashcards', label: 'FLASH CARDS' },
            { id: 'intel', label: 'CAPTURED INTEL' },
            { id: 'books', label: 'BOOKS & MANUALS' },
            { id: 'chapters', label: 'CHAPTERS' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 4. RESULTS TELEMETRY STATUS                                      */}
      {/* ================================================================ */}
      <div className="flex items-center justify-between px-2 font-data text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            DISCOVERED <strong className="text-white">{filteredHits.length}</strong> RELEVANT HITS
          </span>
          {query && (
            <span className="text-[#00f0ff]">
              FOR QUERY: &ldquo;{query}&rdquo;
            </span>
          )}
        </div>
        {isLoading && (
          <span className="flex items-center gap-1.5 text-[#00f0ff] animate-pulse">
            <Zap className="w-3.5 h-3.5" /> ELASTIC SEARCHING...
          </span>
        )}
      </div>

      {/* ================================================================ */}
      {/* 5. SEARCH HITS LIST                                              */}
      {/* ================================================================ */}
      {filteredHits.length === 0 ? (
        <div className="rounded-3xl bg-[#060e1d]/60 border border-white/5 p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-hud text-base font-bold text-white tracking-wider">
            NO CORRESPONDING HITS LOCATED
          </h3>
          <p className="font-data text-xs max-w-md mx-auto">
            Try adjusting your query tokens or removing category filters. The Elasticsearch engine supports fuzzy matching and keyword synonyms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHits.map((hit) => {
            const doc = hit._source
            const scorePercent = Math.min(100, Math.round((hit._score / (maxScore || 1)) * 100))

            return (
              <div
                key={`${hit._index}-${hit._id}`}
                className="group relative rounded-2xl bg-[#060e1d]/80 border border-[rgba(0,240,255,0.18)] hover:border-[#00f0ff]/50 p-5 backdrop-blur-xl transition-all duration-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.12)] flex flex-col justify-between"
              >
                {/* Tech Corner Accent */}
                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00f0ff]/40 rounded-tr pointer-events-none group-hover:border-[#00f0ff]" />

                <div>
                  {/* Top Bar: DocType, Category, and Score */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-hud text-[10px] font-bold tracking-wider uppercase border ${getDocTypeColor(
                          doc.docType
                        )}`}
                      >
                        {getDocTypeIcon(doc.docType)}
                        <span>{doc.docType}</span>
                      </span>

                      {doc.category && (
                        <span className="font-data text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                          {doc.category}
                        </span>
                      )}
                    </div>

                    {/* BM25 Relevance Score Pill */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      <span>SCORE: {hit._score.toFixed(2)}</span>
                      <div className="w-10 h-1 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-[#00f0ff]"
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title (or Front Prompt for Flashcard) with Highlight */}
                  <h3 className="font-hud text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors mb-1.5">
                    {hit.highlight?.title ? (
                      <span dangerouslySetInnerHTML={{ __html: hit.highlight.title[0] }} />
                    ) : hit.highlight?.frontPrompt ? (
                      <span dangerouslySetInnerHTML={{ __html: hit.highlight.frontPrompt[0] }} />
                    ) : (
                      doc.title || doc.frontPrompt
                    )}
                  </h3>

                  {/* Description / Content Highlight */}
                  <div className="font-data text-xs text-slate-300 leading-relaxed mb-3">
                    {hit.highlight?.content ? (
                      <p
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: hit.highlight.content[0] }}
                      />
                    ) : hit.highlight?.description ? (
                      <p
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: hit.highlight.description[0] }}
                      />
                    ) : (
                      <p className="line-clamp-2 text-slate-400">
                        {doc.description || doc.content || doc.backSolution || 'No additional preview text.'}
                      </p>
                    )}
                  </div>

                  {/* Formula Display if available */}
                  {doc.formula && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-black/60 border border-[rgba(0,240,255,0.2)] font-mono text-xs text-[#00f0ff] flex items-center justify-between">
                      <span className="truncate">{doc.formula}</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </div>
                  )}

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {doc.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="font-data text-[10px] text-slate-400 bg-white/[0.03] border border-white/5 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action Link */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-slate-500 uppercase">
                    INDEX: {hit._index.replace('toggledawn_', '')}
                  </span>

                  <Link
                    href={doc.url || (doc.docType === 'flashcard' ? '/flash-cards' : doc.docType === 'intel' ? '/drafts' : '/')}
                    className="inline-flex items-center gap-1.5 font-hud text-xs font-bold text-[#00f0ff] hover:text-white transition-colors"
                  >
                    <span>OPEN ASSET</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

