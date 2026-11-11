'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  LogOut,
  Search,
  Shuffle,
  ListOrdered,
  BookOpen,
  FileText,
  Image as ImageIcon,
  FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useFlashCardStore } from '@/stores/useFlashCardStore'

interface BookOption {
  id: string | number
  title: string
}

interface ChapterOption {
  id: string | number
  title: string
}

interface FlashCardViewerProps {
  bookOptions: BookOption[]
}

export const FlashCardViewer: React.FC<FlashCardViewerProps> = ({ bookOptions }) => {
  const router = useRouter()

  const {
    cards,
    currentIndex,
    studyMode,
    filterBook,
    filterChapter,
    searchQuery,
    isLoading: loading,
    setCurrentIndex,
    setStudyMode,
    setFilterBook,
    setFilterChapter,
    setSearchQuery,
    fetchCards: storeFetchCards,
  } = useFlashCardStore()

  const [chapters, setChapters] = useState<ChapterOption[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  // Refs for GSAP
  const cardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Fetch cards using store
  const fetchCards = useCallback(() => {
    storeFetchCards({
      book: filterBook !== 'all' ? filterBook : undefined,
      chapter: filterChapter !== 'all' ? filterChapter : undefined,
      search: searchQuery.trim() || undefined,
      sort: studyMode === 'jumbled' ? 'random' : 'serial',
    })
  }, [filterBook, filterChapter, searchQuery, studyMode, storeFetchCards])

  // Initial and reactive fetch
  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // Fetch chapters when book changes
  useEffect(() => {
    if (!filterBook || filterBook === 'all') {
      setChapters([])
      setFilterChapter('all')
      return
    }
    const fetchChapters = async () => {
      try {
        const res = await fetch(`/api/chapters?where[book][equals]=${filterBook}&limit=100`)
        const data = await res.json()
        setChapters(
          (data.docs || []).map((c: any) => ({ id: c.id, title: c.title })),
        )
      } catch {
        setChapters([])
      }
    }
    fetchChapters()
    setFilterChapter('all')
  }, [filterBook, setFilterChapter])

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current || loading) return
    const tl = gsap.timeline()
    if (topBarRef.current) {
      tl.fromTo(
        topBarRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      )
    }
    if (cardRef.current) {
      tl.fromTo(
        cardRef.current,
        { scale: 0.85, opacity: 0, rotateY: -15 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 0.7, ease: 'back.out(1.7)' },
        '-=0.3',
      )
    }
    if (progressRef.current) {
      tl.fromTo(
        progressRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.3',
      )
    }
  }, [loading, cards.length])

  // Card transition animation
  const animateCardTransition = (direction: 'left' | 'right', callback: () => void) => {
    if (!cardRef.current) {
      callback()
      return
    }
    const xOut = direction === 'left' ? -120 : 120
    gsap.to(cardRef.current, {
      x: xOut,
      opacity: 0,
      rotateY: direction === 'left' ? -12 : 12,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        callback()
        gsap.fromTo(
          cardRef.current,
          { x: -xOut, opacity: 0, rotateY: direction === 'left' ? 12 : -12 },
          { x: 0, opacity: 1, rotateY: 0, duration: 0.4, ease: 'power2.out' },
        )
      },
    })
  }

  const goNext = () => {
    if (currentIndex >= cards.length - 1) return
    animateCardTransition('left', () => setCurrentIndex(currentIndex + 1))
  }

  const goPrev = () => {
    if (currentIndex <= 0) return
    animateCardTransition('right', () => setCurrentIndex(currentIndex - 1))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') router.push('/')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  // Touch swipe
  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  const toggleOrder = () => {
    setStudyMode(studyMode === 'serial' ? 'jumbled' : 'serial')
  }

  const currentCard = cards[currentIndex] || null

  // Rich text renderer (simplified — handles Lexical JSON)
  const renderRichText = (content: any) => {
    if (!content) return <p className="font-data text-sm text-slate-400">No content</p>
    if (content?.root?.children) {
      return (
        <div className="prose prose-invert prose-sm max-w-none font-body">
          {content.root.children.map((node: any, i: number) => {
            if (node.type === 'paragraph') {
              const text = node.children?.map((c: any) => c.text || '').join('') || ''
              return (
                <p key={i} className="mb-2 text-slate-200 leading-relaxed">
                  {text}
                </p>
              )
            }
            if (node.type === 'heading') {
              const text = node.children?.map((c: any) => c.text || '').join('') || ''
              const tag = node.tag || 'h3'
              if (tag === 'h3') {
                return (
                  <h3 key={i} className="font-hud text-[#00f0ff] mb-2">
                    {text}
                  </h3>
                )
              }
              return (
                <h4 key={i} className="font-hud text-[#00f0ff] mb-2">
                  {text}
                </h4>
              )
            }
            return null
          })}
        </div>
      )
    }
    return <p className="font-body text-sm text-slate-300">{JSON.stringify(content)}</p>
  }

  // Content type icon
  const contentIcon = (type?: string) => {
    switch (type) {
      case 'text':
        return <FileText className="w-3.5 h-3.5" />
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5" />
      case 'pdf':
        return <FileDown className="w-3.5 h-3.5" />
      default:
        return <Layers className="w-3.5 h-3.5" />
    }
  }

  return (
    <div
      ref={containerRef}
      className="hud-bg min-h-screen text-slate-100 flex flex-col"
    >
      <div className="scanline-overlay" />

      {/* ========= TOP BAR ========= */}
      <div
        ref={topBarRef}
        className="relative z-20 border-b border-[#00f0ff]/10 bg-black/40 backdrop-blur-xl"
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Row 1: Title + Quit */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" />
              <span className="font-hud text-xs sm:text-sm tracking-[2px] text-[#00f0ff] uppercase">
                Flash Cards
              </span>
              {cards.length > 0 && (
                <span className="font-data text-[10px] text-slate-500 ml-1">
                  [{cards.length} LOADED]
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-red-400/80 hover:text-red-300 hover:bg-red-500/10 font-hud text-[10px] tracking-wider gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              QUIT
            </Button>
          </div>

          {/* Row 2: Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Order toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOrder}
              className="border-[#00f0ff]/20 bg-[#00f0ff]/5 text-[#00f0ff] hover:bg-[#00f0ff]/15 font-hud text-[9px] sm:text-[10px] tracking-wider gap-1.5 h-8"
            >
              {studyMode === 'serial' ? (
                <ListOrdered className="w-3.5 h-3.5" />
              ) : (
                <Shuffle className="w-3.5 h-3.5" />
              )}
              {studyMode === 'serial' ? 'SERIAL' : 'JUMBLED'}
            </Button>

            {/* Book filter */}
            <Select value={filterBook || 'all'} onValueChange={setFilterBook}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 border-[#00f0ff]/20 bg-[#00f0ff]/5 text-slate-200 font-data text-[10px] sm:text-xs">
                <BookOpen className="w-3 h-3 text-amber-500/60 mr-1" />
                <SelectValue placeholder="All Books" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-[#00f0ff]/20">
                <SelectItem value="all" className="font-data text-xs text-slate-300">
                  All Books
                </SelectItem>
                {bookOptions.map((b) => (
                  <SelectItem
                    key={String(b.id)}
                    value={String(b.id)}
                    className="font-data text-xs text-slate-300"
                  >
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chapter filter (only when book selected) */}
            {filterBook && filterBook !== 'all' && chapters.length > 0 && (
              <Select value={filterChapter || 'all'} onValueChange={setFilterChapter}>
                <SelectTrigger className="w-[140px] sm:w-[180px] h-8 border-amber-500/20 bg-amber-500/5 text-slate-200 font-data text-[10px] sm:text-xs">
                  <SelectValue placeholder="All Chapters" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-amber-500/20">
                  <SelectItem value="all" className="font-data text-xs text-slate-300">
                    All Chapters
                  </SelectItem>
                  {chapters.map((c) => (
                    <SelectItem
                      key={String(c.id)}
                      value={String(c.id)}
                      className="font-data text-xs text-slate-300"
                    >
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Search toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="border-[#00f0ff]/20 bg-[#00f0ff]/5 text-[#00f0ff] hover:bg-[#00f0ff]/15 h-8 w-8"
            >
              <Search className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Search bar (expandable with Elasticsearch) */}
          {searchOpen && (
            <div className="mt-2 relative flex items-center">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchCards()
                }}
                placeholder="Search flash cards (Elasticsearch BM25)..."
                className="bg-black/60 border-[#00f0ff]/30 text-slate-200 font-data text-xs placeholder:text-slate-500 h-8 pr-20"
                autoFocus
              />
              <span className="absolute right-2 font-mono text-[8px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 px-1.5 py-0.5 rounded pointer-events-none">
                ELASTIC
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========= CARD DISPLAY AREA ========= */}
      <div
        className="flex-1 relative z-10 flex items-center justify-center px-4 py-6 sm:py-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
            <span className="font-data text-xs text-slate-500 tracking-wider">
              LOADING CARDS...
            </span>
          </div>
        ) : cards.length === 0 ? (
          <Card className="bg-black/30 border-[#00f0ff]/10 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="font-hud text-sm text-slate-400 mb-2">NO CARDS FOUND</p>
              <p className="font-body text-xs text-slate-500 mb-4">
                Create flash cards in the admin panel or adjust your filters.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="border-[#00f0ff]/20 text-[#00f0ff] font-hud text-[10px] tracking-wider"
              >
                RETURN TO BASE
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-2xl flex items-center gap-2 sm:gap-4">
            {/* Prev button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              disabled={currentIndex <= 0}
              className="text-[#00f0ff]/60 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 disabled:opacity-20 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            {/* Card */}
            <div
              ref={cardRef}
              className="flex-1 min-h-[300px] sm:min-h-[400px] perspective-[1200px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="hud-card corner-brackets bg-black/30 border-[#00f0ff]/15 h-full overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1 font-data text-[9px] px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff]/70 border border-[#00f0ff]/20 flex-shrink-0">
                      {contentIcon(currentCard?.contentType)}
                      {currentCard?.contentType?.toUpperCase()}
                    </span>
                    <span className="font-hud text-xs sm:text-sm text-slate-200 truncate">
                      {currentCard?.title}
                    </span>
                  </div>
                  <span className="font-data text-[10px] text-slate-500 flex-shrink-0">
                    {currentIndex + 1}/{cards.length}
                  </span>
                </div>

                {/* Book / Chapter info */}
                {currentCard?.book && typeof currentCard.book === 'object' && (
                  <div className="px-4 sm:px-5 pb-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-amber-500/60" />
                      <span className="font-data text-[10px] text-amber-500/70">
                        {currentCard.book.title}
                      </span>
                      {currentCard.chapter &&
                        typeof currentCard.chapter === 'object' && (
                          <>
                            <span className="text-slate-600 text-[10px]">›</span>
                            <span className="font-data text-[10px] text-amber-500/50">
                              {currentCard.chapter.title}
                            </span>
                          </>
                        )}
                    </div>
                  </div>
                )}

                {/* Card content */}
                <CardContent className="p-4 sm:p-5 pt-2">
                  <div className="min-h-[200px] sm:min-h-[280px] flex items-start">
                    {currentCard?.contentType === 'text' && (
                      <div className="w-full overflow-y-auto max-h-[50vh] hud-scroll pr-1">
                        {renderRichText(currentCard.textContent)}
                      </div>
                    )}

                    {currentCard?.contentType === 'image' &&
                      currentCard.image &&
                      typeof currentCard.image === 'object' && (
                        <div className="w-full flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentCard.image.url || ''}
                            alt={currentCard.image.alt || currentCard.title}
                            className="max-w-full max-h-[50vh] rounded-lg border border-[#00f0ff]/10 object-contain"
                          />
                        </div>
                      )}

                    {currentCard?.contentType === 'pdf' &&
                      currentCard.pdf &&
                      typeof currentCard.pdf === 'object' && (
                        <div className="w-full flex flex-col items-center gap-4">
                          <FileDown className="w-12 h-12 text-[#00f0ff]/40" />
                          <p className="font-data text-xs text-slate-400">
                            {currentCard.pdf.filename || 'PDF Document'}
                          </p>
                          <a
                            href={currentCard.pdf.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              className="border-[#00f0ff]/20 text-[#00f0ff] font-hud text-[10px] tracking-wider"
                            >
                              OPEN PDF
                            </Button>
                          </a>
                          {currentCard.pdf.url && (
                            <iframe
                              src={currentCard.pdf.url}
                              className="w-full h-[40vh] rounded border border-[#00f0ff]/10 bg-white"
                              title={currentCard.pdf.filename || 'PDF Preview'}
                            />
                          )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              disabled={currentIndex >= cards.length - 1}
              className="text-[#00f0ff]/60 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 disabled:opacity-20 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* ========= BOTTOM PROGRESS BAR ========= */}
      {cards.length > 0 && (
        <div
          ref={progressRef}
          className="relative z-20 border-t border-[#00f0ff]/10 bg-black/40 backdrop-blur-xl"
        >
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-data text-[10px] text-slate-500">PROGRESS</span>
              <span className="font-data text-[10px] text-[#00f0ff]/70">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#00f0ff]/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff]/60 to-[#00f0ff] rounded-full transition-all duration-500 ease-out progress-glow"
                style={{
                  width: `${((currentIndex + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
            {/* Keyboard hint */}
            <div className="hidden sm:flex items-center justify-center gap-4 mt-2">
              <span className="font-data text-[9px] text-slate-600">
                ← → NAVIGATE
              </span>
              <span className="font-data text-[9px] text-slate-600">ESC QUIT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
