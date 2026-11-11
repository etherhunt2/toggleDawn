import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * FlashCards collection — micro-study cards linked to Books (and optionally Chapters).
 * Each card holds exactly ONE content type: rich text, an image upload, or a PDF upload.
 * Managed through the admin panel under the "Study" group.
 */
export const FlashCards: CollectionConfig = {
  slug: 'flash-cards',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'book', 'chapter', 'updatedAt'],
    group: 'Study',
    description: 'Flash cards for quick revision — text, image, or PDF per card.',
  },
  hooks: {
    beforeChange: [setOwner],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'A short label for this flash card.',
      },
    },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Rich Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'PDF', value: 'pdf' },
      ],
      admin: {
        description: 'Choose ONE content format for this card.',
      },
    },
    // --- Conditional content fields (only one shows at a time) ---
    {
      name: 'textContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
        ],
      }),
      admin: {
        condition: (data) => data?.contentType === 'text',
        description: 'Write or paste your flash card content here.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.contentType === 'image',
        description: 'Upload an image for this flash card.',
      },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.contentType === 'pdf',
        description: 'Upload a PDF for this flash card.',
      },
    },
    // --- Relationships ---
    {
      name: 'book',
      type: 'relationship',
      relationTo: 'books',
      required: true,
      admin: {
        description: 'Every flash card must belong to a book.',
      },
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      admin: {
        description: 'Optionally assign to a specific chapter within the book.',
        condition: (data) => Boolean(data?.book),
      },
      filterOptions: ({ data }) => {
        if (!data?.book) return false
        return { book: { equals: data.book } }
      },
    },
    // --- Ordering ---
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order for serial display (lower = first).',
      },
    },
    // --- Owner (auto-set) ---
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.owner),
      },
    },
  ],
  timestamps: true,
}

