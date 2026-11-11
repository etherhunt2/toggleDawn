import React from 'react'
import { cn } from '@/utilities/ui'

export type SpacerBlockProps = {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | null
  showDivider?: boolean | null
}

export const SpacerBlockComponent: React.FC<SpacerBlockProps> = ({
  size = 'medium',
  showDivider = false,
}) => {
  const heightClasses = {
    small: 'h-8 my-4',
    medium: 'h-16 my-8',
    large: 'h-24 my-12',
    xlarge: 'h-32 my-16',
  }[size || 'medium']

  return (
    <div className={cn('w-full flex items-center justify-center', heightClasses)}>
      {showDivider && <div className="container"><hr className="border-border w-full" /></div>}
    </div>
  )
}
