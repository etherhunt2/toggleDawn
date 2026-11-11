import React from 'react'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export type RichContentBlockProps = {
  richText: any
  layout?: 'standard' | 'mediaRight' | 'mediaLeft' | null
  media?: any | null
}

export const RichContentBlockComponent: React.FC<RichContentBlockProps> = ({
  richText,
  layout = 'standard',
  media,
}) => {
  if (layout === 'standard' || !media) {
    return (
      <section className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {richText && <RichText data={richText} enableGutter={false} />}
        </div>
      </section>
    )
  }

  const isMediaLeft = layout === 'mediaLeft'

  return (
    <section className="container py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className={cn({ 'md:order-2': isMediaLeft })}>
          {richText && <RichText data={richText} enableGutter={false} />}
        </div>
        <div
          className={cn('rounded-xl overflow-hidden border border-border shadow-md', {
            'md:order-1': isMediaLeft,
          })}
        >
          {media && typeof media !== 'string' && <Media resource={media} />}
        </div>
      </div>
    </section>
  )
}
