import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * Projects collection — top-level organizational container.
 * Each project belongs to a user and contains many missions.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'deadline', 'updatedAt'],
    group: 'Core',
    description: 'Top-level containers for organizing missions and goals.',
  },
  hooks: {
    beforeChange: [setOwner],
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
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Planning', value: 'planning' },
        { label: 'Active', value: 'active' },
        { label: 'On Hold', value: 'on-hold' },
        { label: 'Completed', value: 'completed' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'deadline',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      filterOptions: {
        type: { in: ['project', 'general'] },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color for visual tagging in the dashboard (e.g. #6C5CE7).',
        position: 'sidebar',
      },
    },
    // Reverse relationship — shows all missions in this project
    {
      name: 'missions',
      type: 'join',
      collection: 'missions',
      on: 'project',
    },
    // Owner relationship — auto-set by setOwner hook
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
