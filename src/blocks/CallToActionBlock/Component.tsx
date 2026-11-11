import React from 'react'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

export type CallToActionBlockProps = {
  badge?: string | null
  heading: string
  description?: string | null
  style?: 'glow' | 'minimal' | 'dark' | null
  links?: { link: any }[] | null
}

export const CallToActionBlockComponent: React.FC<CallToActionBlockProps> = ({
  badge,
  heading,
  description,
  style = 'glow',
  links,
}) => {
  return (
    <section className="container py-16 md:py-20">
      <div
        className={cn(
          'relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden text-center max-w-4xl mx-auto border transition-all',
          {
            'bg-linear-to-b from-card to-card/60 border-primary/30 shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.25)]':
              style === 'glow',
            'bg-card border-border': style === 'minimal',
            'bg-black/80 text-white border-white/10': style === 'dark',
          },
        )}
      >
        {style === 'glow' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/20 blur-2xl pointer-events-none" />
        )}

        {badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-4">
            {badge}
          </span>
        )}

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{heading}</h2>

        {description && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {description}
          </p>
        )}

        {links && links.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {links.map(({ link }, i) => (
              <CMSLink key={i} size="lg" {...link} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
