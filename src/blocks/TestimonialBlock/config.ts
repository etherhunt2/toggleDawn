import type { Block } from 'payload'

export const TestimonialBlock: Block = {
  slug: 'testimonialBlock',
  interfaceName: 'TestimonialBlockType',
  labels: {
    singular: 'Testimonial Section',
    plural: 'Testimonial Sections',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        placeholder: 'Loved by Neurodivergent Students & Professionals',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
      admin: {
        placeholder: 'What our users are saying',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'testimonials',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'authorName',
          type: 'text',
          required: true,
        },
        {
          name: 'authorRole',
          type: 'text',
          admin: {
            placeholder: 'e.g. Med Student / ADHD Advocate',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'rating',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 5,
        },
      ],
    },
  ],
}
