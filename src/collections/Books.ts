import type { CollectionConfig } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'
import { revalidateContent, revalidateContentDelete } from '../hooks/revalidateContent'

/**
 * Books collection — SEO-enabled study material container.
 * URL pattern: /books/{book-slug}
 * Belongs to a Mission. Has many Chapters.
 */
export const Books: CollectionConfig<'books'> = {
  slug: 'books',
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subject', 'mission', 'completionPercent', 'updatedAt'],
    group: 'Study',
    description: 'Books and study materials organized by subject.',
  },
  hooks: {
    beforeChange: [setOwner],
    afterChange: [revalidateContent],
    afterDelete: [revalidateContentDelete],
  },
  defaultPopulate: {
    title: true,
    slug: true,
    subject: true,
    meta: {
      description: true,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'author',
              type: 'text',
              admin: {
                description: 'Author of the book.',
              },
            },
            {
              name: 'subject',
              type: 'text',
              required: true,
              admin: {
                description: 'Subject area (e.g. Mathematics, Physics, History).',
              },
            },
            {
              name: 'totalPages',
              type: 'number',
              min: 0,
              admin: {
                description: 'Total number of pages in the book.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Brief summary of the book content.',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Relations',
          fields: [
            {
              name: 'mission',
              type: 'relationship',
              relationTo: 'missions',
              required: true,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: {
                type: { in: ['book', 'exam', 'general'] },
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    // Progress tracking
    {
      name: 'completionPercent',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-calculated from chapter completion.',
      },
    },
    {
      name: 'progressStatus',
      type: 'select',
      defaultValue: 'not-started',
      options: [
        { label: 'Not Started', value: 'not-started' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Reverse relationship — chapters in this book
    {
      name: 'chapters',
      type: 'join',
      collection: 'chapters',
      on: 'book',
    },
    // Owner — auto-set
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
    slugField(),
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
  timestamps: true,
}
