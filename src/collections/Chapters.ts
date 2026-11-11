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
 * Chapters collection — SEO-enabled subdivisions of a Book.
 * URL pattern: /books/{book-slug}/{chapter-slug}
 * Belongs to a Book. Has many Notes.
 */
export const Chapters: CollectionConfig<'chapters'> = {
  slug: 'chapters',
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'book', 'progressStatus', 'completionPercent', 'updatedAt'],
    group: 'Study',
    description: 'Chapter divisions within a book.',
  },
  hooks: {
    beforeChange: [setOwner],
    afterChange: [revalidateContent],
    afterDelete: [revalidateContentDelete],
  },
  defaultPopulate: {
    title: true,
    slug: true,
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
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Brief summary of chapter contents.',
              },
            },
            {
              name: 'pageCount',
              type: 'number',
              min: 0,
              admin: {
                description: 'Number of pages in this chapter.',
              },
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Order of this chapter within the book. Lower numbers come first.',
              },
            },
          ],
        },
        {
          label: 'Relations',
          fields: [
            {
              name: 'book',
              type: 'relationship',
              relationTo: 'books',
              required: true,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: {
                type: { in: ['chapter', 'exam', 'general'] },
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
    // Progress
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
    {
      name: 'completionPercent',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-calculated from note completion.',
      },
    },
    // Reverse relationship — notes in this chapter
    {
      name: 'notes',
      type: 'join',
      collection: 'notes',
      on: 'chapter',
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
