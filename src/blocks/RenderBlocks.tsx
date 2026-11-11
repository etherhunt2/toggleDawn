import React, { Fragment } from 'react'

import { BannerBlock } from '@/blocks/Banner/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'

import { HeroBlockComponent } from '@/blocks/HeroBlock/Component'
import { RichContentBlockComponent } from '@/blocks/RichContentBlock/Component'
import { FeatureGridBlockComponent } from '@/blocks/FeatureGridBlock/Component'
import { CallToActionBlockComponent } from '@/blocks/CallToActionBlock/Component'
import { FAQBlockComponent } from '@/blocks/FAQBlock/Component'
import { TestimonialBlockComponent } from '@/blocks/TestimonialBlock/Component'
import { StatsBlockComponent } from '@/blocks/StatsBlock/Component'
import { CardGridBlockComponent } from '@/blocks/CardGridBlock/Component'
import { SpacerBlockComponent } from '@/blocks/SpacerBlock/Component'

const blockComponents: Record<string, React.FC<any>> = {
  // Original Blocks
  banner: BannerBlock,
  code: CodeBlock,
  mediaBlock: MediaBlock,
  cta: CallToActionBlock,
  content: ContentBlock,

  // New Reusable Page Builder Blocks
  heroBlock: HeroBlockComponent,
  richContent: RichContentBlockComponent,
  featureGrid: FeatureGridBlockComponent,
  ctaBlock: CallToActionBlockComponent,
  faqBlock: FAQBlockComponent,
  testimonialBlock: TestimonialBlockComponent,
  statsBlock: StatsBlockComponent,
  cardGrid: CardGridBlockComponent,
  spacerBlock: SpacerBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks?: any[] | null
}> = ({ blocks }) => {
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (!hasBlocks) return null

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType]

          if (Block) {
            return (
              <div key={index} data-block-type={blockType}>
                <Block {...block} />
              </div>
            )
          }
        }
        return null
      })}
    </Fragment>
  )
}
