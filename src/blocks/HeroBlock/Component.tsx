import React from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export type HeroBlockProps = {
  badge?: string | null
  heading: string
  subheading?: string | null
  alignment?: 'center' | 'left' | null
  media?: any | null
  links?: { link: any }[] | null
}

export const HeroBlockComponent: React.FC<HeroBlockProps> = ({
  badge,
  heading,
  subheading,
  alignment = 'center',
  media,
  links,
}) => {
  const isCenter = alignment === 'center'

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div
          className={cn('max-w-3xl flex flex-col', {
            'mx-auto items-center text-center': isCenter,
            'items-start text-left': !isCenter,
          })}
        >
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-primary/10 text-primary border border-primary/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {badge}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
            {heading}
          </h1>

          {subheading && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {subheading}
            </p>
          )}

          {links && links.length > 0 && (
            <div className="flex flex-wrap gap-4 items-center">
              {links.map(({ link }, i) => (
                <CMSLink key={i} size="lg" {...link} />
              ))}
            </div>
          )}
        </div>

        {media && typeof media !== 'string' && (
          <div className="mt-12 md:mt-16 rounded-2xl overflow-hidden border border-border shadow-2xl max-w-5xl mx-auto">
            <Media priority resource={media} />
          </div>
        )}
      </div>
    </section>
  )
}
