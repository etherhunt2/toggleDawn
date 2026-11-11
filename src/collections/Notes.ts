import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
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
import { Banner } from '../blocks/Banner/config'
import { Code } from '../blocks/Code/config'
import { MediaBlock } from '../blocks/MediaBlock/config'

/**
 * Notes collection — leaf-level SEO content within a Chapter.
 * URL pattern: /books/{book-slug}/{chapter-slug}/{note-slug}
 * Contains rich text content (the actual study notes / flashcards).
 */
export const Notes: CollectionConfig<'notes'> = {
  slug: 'notes',
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'chapter', 'noteType', 'isCompleted', 'updatedAt'],
    group: 'Study',
    description: 'Study notes, flashcards, and summaries within a chapter.',
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data

        // Auto-generate slug if missing
        if (!data.slug) {
          const base = data.title || 'untitled-note'
          data.slug =
            base
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || `note-${Date.now()}`
        }

        // Ensure richText lexical content structure
        if (!data.content || typeof data.content === 'string' || !data.content?.root) {
          const textContent = typeof data.content === 'string' ? data.content : data.title || ''
          data.content = {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  direction: 'ltr',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: textContent,
                      version: 1,
                    },
                  ],
                },
              ],
            },
          }
        }

        // If chapter is not provided, attempt to auto-link to the first available chapter
        if (!data.chapter && req?.payload) {
          try {
            const firstChapter = await req.payload.find({
              collection: 'chapters',
              limit: 1,
              depth: 0,
            })
            if (firstChapter.docs && firstChapter.docs.length > 0) {
              data.chapter = firstChapter.docs[0].id
            }
          } catch {
            // Ignore if no chapters exist
          }
        }

        return data
      },
    ],
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
              name: 'content',
              type: 'richText',
              required: false,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
            },
            {
              name: 'noteType',
              type: 'select',
              defaultValue: 'note',
              options: [
                { label: 'Note', value: 'note' },
                { label: 'Flashcard', value: 'flashcard' },
                { label: 'Summary', value: 'summary' },
                { label: 'Formula Sheet', value: 'formula' },
              ],
              admin: {
                description: 'Type of study note for micro-chunking.',
              },
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Order of this note within the chapter.',
              },
            },
          ],
        },
        {
          label: 'Relations',
          fields: [
            {
              name: 'chapter',
              type: 'relationship',
              relationTo: 'chapters',
              required: false,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: {
                type: { in: ['note', 'exam', 'general'] },
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
    // Study tracking
    {
      name: 'isCompleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as completed when you have reviewed this note.',
      },
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
