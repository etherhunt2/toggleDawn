import type { Block } from 'payload'

export const SpacerBlock: Block = {
  slug: 'spacerBlock',
  interfaceName: 'SpacerBlockType',
  labels: {
    singular: 'Spacer / Divider',
    plural: 'Spacers / Dividers',
  },
  fields: [
    {
      name: 'size',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Small (2rem / 32px)', value: 'small' },
        { label: 'Medium (4rem / 64px)', value: 'medium' },
        { label: 'Large (6rem / 96px)', value: 'large' },
        { label: 'Extra Large (8rem / 128px)', value: 'xlarge' },
      ],
    },
    {
      name: 'showDivider',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show horizontal divider line',
    },
  ],
}
