import type { Block } from 'payload'

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlockType',
  labels: {
    singular: 'Feature Grid',
    plural: 'Feature Grids',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        placeholder: 'Built for Neurodivergent Minds',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Section Heading',
      admin: {
        placeholder: 'Everything you need to focus, track, and conquer',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Section Description',
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'zap',
          options: [
            { label: 'Zap / Energy', value: 'zap' },
            { label: 'Target / Mission', value: 'target' },
            { label: 'Clock / Time Log', value: 'clock' },
            { label: 'Book / Study', value: 'book' },
            { label: 'Brain / ADHD Focus', value: 'brain' },
            { label: 'Check Circle / Habit', value: 'check' },
            { label: 'Bar Chart / Analytics', value: 'barChart' },
            { label: 'Sparkles / AI', value: 'sparkles' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'tag',
          type: 'text',
          label: 'Optional Tag / Highlight',
        },
      ],
    },
  ],
}
