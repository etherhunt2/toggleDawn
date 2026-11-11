import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

/**
 * Categories collection — shared taxonomy for Projects, Missions, Books,
 * Chapters, Notes, and Exams. Users can freely CRUD any category.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'slug', 'updatedAt'],
    group: 'Taxonomy',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Project', value: 'project' },
        { label: 'Mission', value: 'mission' },
        { label: 'Exam', value: 'exam' },
        { label: 'Book', value: 'book' },
        { label: 'Chapter', value: 'chapter' },
        { label: 'Note', value: 'note' },
        { label: 'General', value: 'general' },
      ],
      defaultValue: 'general',
      admin: {
        description: 'What kind of content this category applies to.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description for this category.',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for visual identification (e.g. #6C5CE7).',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
  timestamps: true,
}
