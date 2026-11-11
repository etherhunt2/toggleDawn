import React from 'react'

export type StatItem = {
  value: string
  label: string
  description?: string | null
}

export type StatsBlockProps = {
  badge?: string | null
  heading?: string | null
  stats: StatItem[]
}

export const StatsBlockComponent: React.FC<StatsBlockProps> = ({
  badge,
  heading,
  stats,
}) => {
  return (
    <section className="container py-16 md:py-20 border-y border-border/50">
      {(badge || heading) && (
        <div className="text-center max-w-xl mx-auto mb-12">
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-3">
              {badge}
            </span>
          )}
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {heading}
            </h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {(stats || []).map((stat, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent mb-2">
              {stat.value}
            </span>
            <span className="text-base font-semibold text-foreground mb-1">
              {stat.label}
            </span>
            {stat.description && (
              <span className="text-xs text-muted-foreground max-w-[200px]">
                {stat.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
