import type { Block } from 'payload'
import { link } from '@/fields/link'

export const CardGridBlock: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlockType',
  labels: {
    singular: 'Card Grid',
    plural: 'Card Grids',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
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
          name: 'badge',
          type: 'text',
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
        },
        link({
          appearances: false,
          disableLabel: true,
        }),
      ],
    },
  ],
}
