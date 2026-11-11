import React from 'react'
import {
  Zap,
  Target,
  Clock,
  BookOpen,
  Brain,
  CheckCircle2,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

const iconMap = {
  zap: Zap,
  target: Target,
  clock: Clock,
  book: BookOpen,
  brain: Brain,
  check: CheckCircle2,
  barChart: BarChart3,
  sparkles: Sparkles,
}

export type FeatureItem = {
  icon?: keyof typeof iconMap | null
  title: string
  description: string
  tag?: string | null
}

export type FeatureGridBlockProps = {
  badge?: string | null
  heading: string
  description?: string | null
  columns?: '2' | '3' | '4' | null
  features: FeatureItem[]
}

export const FeatureGridBlockComponent: React.FC<FeatureGridBlockProps> = ({
  badge,
  heading,
  description,
  columns = '3',
  features,
}) => {
  const gridColsClass = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  }[columns || '3']

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

      <div className={cn('grid grid-cols-1 gap-6', gridColsClass)}>
        {(features || []).map((feature, i) => {
          const IconComponent = (feature.icon && iconMap[feature.icon]) || Zap

          return (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">
                    {feature.title}
                  </h3>
                  {feature.tag && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                      {feature.tag}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
