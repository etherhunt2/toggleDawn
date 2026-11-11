import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'statsBlock',
  interfaceName: 'StatsBlockType',
  labels: {
    singular: 'Statistics Section',
    plural: 'Statistics Sections',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        placeholder: 'Proven Results',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      admin: {
        placeholder: 'Impact that speaks for itself',
      },
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            placeholder: '98% or 10k+',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'Habit Retention',
          },
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            placeholder: 'Thanks to our ADHD forgiveness buffer algorithm.',
          },
        },
      ],
    },
  ],
}
