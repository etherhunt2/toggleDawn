'use client'

import React, { useEffect, useRef } from 'react'
import { Layers, Play, Settings, BookOpen } from 'lucide-react'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFlashCardStore } from '@/stores/useFlashCardStore'

export const FlashCardWidget: React.FC = () => {
  const { cards, totalDocs, isLoading, fetchCards } = useFlashCardStore()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cards.length === 0) {
      fetchCards()
    }
  }, [cards.length, fetchCards])

  // GSAP entrance animation
  useEffect(() => {
    if (!isLoading && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
      )
    }
  }, [isLoading])

  const lastCard = cards[0] || null

  const contentTypeLabel = (ct?: string) => {
    switch (ct) {
      case 'text':
        return 'TEXT'
      case 'image':
        return 'IMG'
      case 'pdf':
        return 'PDF'
      default:
        return '—'
    }
  }

  const bookTitle =
    typeof lastCard?.book === 'object' && lastCard?.book !== null
      ? (lastCard.book as any).title
      : undefined

  return (
    <div ref={cardRef}>
      <Card className="hud-card corner-brackets border-[#00f0ff]/10 bg-transparent">
        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00f0ff]" />
              <span className="font-hud text-[10px] sm:text-xs tracking-[2px] text-[#00f0ff] uppercase">
                Flash Cards
              </span>
            </div>
            <span className="font-data text-[10px] text-slate-500">
              {isLoading && cards.length === 0 ? '...' : `${totalDocs || cards.length} CARDS`}
            </span>
          </div>

          {/* Card Info */}
          {isLoading && cards.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
            </div>
          ) : lastCard ? (
            <div className="space-y-3">
              {/* Last card details */}
              <div className="hud-card p-3 bg-black/20 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-data text-[10px] text-slate-500 uppercase mb-1">
                      Last Card
                    </p>
                    <p className="font-body text-xs sm:text-sm text-slate-200 truncate">
                      {lastCard.title}
                    </p>
                    {bookTitle && (
                      <div className="flex items-center gap-1 mt-1">
                        <BookOpen className="w-3 h-3 text-amber-500/60" />
                        <span className="font-data text-[10px] text-amber-500/80 truncate">
                          {bookTitle}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-data text-[9px] px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff]/70 border border-[#00f0ff]/20 flex-shrink-0">
                    {contentTypeLabel(lastCard.contentType)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-data text-xs text-slate-500">NO CARDS YET</p>
              <p className="font-body text-[10px] text-slate-600 mt-1">
                Create flash cards in the admin panel
              </p>
            </div>
          )}

          {/* Action Buttons — ShadCN Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 border-[#00f0ff]/20 bg-[#00f0ff]/8 text-[#00f0ff] hover:bg-[#00f0ff]/15 hover:border-[#00f0ff]/40 font-hud text-[10px] tracking-wider gap-1.5"
            >
              <a href="/flash-cards">
                <Play className="w-3.5 h-3.5" />
                Start
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600/30 bg-slate-800/20 text-slate-400 hover:bg-slate-700/30 hover:text-slate-300 font-hud text-[10px] tracking-wider gap-1.5"
            >
              <a href="/super-master/collections/flash-cards">
                <Settings className="w-3.5 h-3.5" />
                Manage
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
