import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faqBlock',
  interfaceName: 'FAQBlockType',
  labels: {
    singular: 'FAQ Section',
    plural: 'FAQ Sections',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        placeholder: 'Got Questions?',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
      admin: {
        placeholder: 'Frequently Asked Questions',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
