'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'

export type FAQItem = {
  question: string
  answer: string
}

export type FAQBlockProps = {
  badge?: string | null
  heading: string
  description?: string | null
  items: FAQItem[]
}

export const FAQBlockComponent: React.FC<FAQBlockProps> = ({
  badge,
  heading,
  description,
  items,
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0])

  const toggle = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  return (
    <section className="container py-16 md:py-24 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-4">
            {badge}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
          {heading}
        </h2>
        {description && <p className="text-muted-foreground text-lg">{description}</p>}
      </div>

      <div className="space-y-4">
        {(items || []).map((item, index) => {
          const isOpen = openIndices.includes(index)

          return (
            <div
              key={index}
              className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full py-5 px-6 text-left flex justify-between items-center gap-4 hover:bg-muted/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-lg text-foreground">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200',
                    {
                      'rotate-180 text-primary': isOpen,
                    },
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm md:text-base border-t border-border/40 pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
