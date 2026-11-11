import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const CallToActionBlockConfig: Block = {
  slug: 'ctaBlock',
  interfaceName: 'CallToActionSectionBlockType',
  labels: {
    singular: 'Call to Action Section',
    plural: 'Call to Action Sections',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge Text',
      admin: {
        placeholder: 'Ready to build unstoppable focus?',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
      admin: {
        placeholder: 'Start using ToggleDawn for free today.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        placeholder: 'Designed specifically to eliminate ADHD friction and overwhelm.',
      },
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'glow',
      options: [
        { label: 'Glow Accent Card', value: 'glow' },
        { label: 'Minimal Clean', value: 'minimal' },
        { label: 'High Contrast Dark', value: 'dark' },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
}
