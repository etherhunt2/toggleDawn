import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const RichContentBlock: Block = {
  slug: 'richContent',
  interfaceName: 'RichContentBlockType',
  labels: {
    singular: 'Rich Content',
    plural: 'Rich Content Sections',
  },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      label: 'Content',
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard Single Column', value: 'standard' },
        { label: 'Content Left + Media Right', value: 'mediaRight' },
        { label: 'Media Left + Content Right', value: 'mediaLeft' },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.layout === 'mediaRight' || siblingData?.layout === 'mediaLeft',
      },
      label: 'Associated Image/Media',
    },
  ],
}
