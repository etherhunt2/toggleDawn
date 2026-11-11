import React from 'react'
import { Star } from 'lucide-react'
import { Media } from '@/components/Media'

export type TestimonialItem = {
  quote: string
  authorName: string
  authorRole?: string | null
  avatar?: any | null
  rating?: number | null
}

export type TestimonialBlockProps = {
  badge?: string | null
  heading: string
  description?: string | null
  testimonials: TestimonialItem[]
}

export const TestimonialBlockComponent: React.FC<TestimonialBlockProps> = ({
  badge,
  heading,
  description,
  testimonials,
}) => {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(testimonials || []).map((t, index) => {
          const rating = t.rating || 5

          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-sm hover:border-primary/30 transition-colors"
            >
              <div>
                <div className="flex gap-1 mb-4 text-amber-400">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground/90 italic leading-relaxed text-sm md:text-base mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {t.avatar && typeof t.avatar !== 'string' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                    <Media resource={t.avatar} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                    {t.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{t.authorName}</h4>
                  {t.authorRole && (
                    <p className="text-xs text-muted-foreground">{t.authorRole}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
