import React from 'react'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { ArrowUpRight } from 'lucide-react'

export type CardGridItem = {
  title: string
  description: string
  badge?: string | null
  media?: any | null
  link?: any | null
}

export type CardGridBlockProps = {
  badge?: string | null
  heading: string
  description?: string | null
  cards: CardGridItem[]
}

export const CardGridBlockComponent: React.FC<CardGridBlockProps> = ({
  badge,
  heading,
  description,
  cards,
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
        {(cards || []).map((card, i) => (
          <div
            key={i}
            className="group rounded-2xl bg-card border border-border overflow-hidden flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all duration-300"
          >
            <div>
              {card.media && typeof card.media !== 'string' && (
                <div className="aspect-video w-full overflow-hidden border-b border-border">
                  <Media
                    resource={card.media}
                    imgClassName="group-hover:scale-105 transition-transform duration-300 object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-6">
                {card.badge && (
                  <span className="inline-block text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground mb-3">
                    {card.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {card.link?.url && (
              <div className="p-6 pt-0">
                <CMSLink
                  {...card.link}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Learn more <ArrowUpRight className="w-4 h-4" />
                </CMSLink>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
