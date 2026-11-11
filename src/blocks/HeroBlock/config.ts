import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const HeroBlock: Block = {
  slug: 'heroBlock',
  interfaceName: 'HeroBlockType',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge / Pill Text',
      admin: {
        placeholder: 'e.g. ADHD-Friendly Productivity',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Main Heading',
      admin: {
        placeholder: 'Turn Chaos into Momentum with ToggleDawn',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      admin: {
        placeholder:
          'Low-friction study planning, time tracking, and streak-forgiving habit management.',
      },
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Background / Showcase Image',
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
}
