import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * Missions collection — task grouping under a Project.
 * Types: Study, Habit, or Hobby — each with different tracking patterns.
 */
export const Missions: CollectionConfig = {
  slug: 'missions',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'project', 'targetHours', 'updatedAt'],
    group: 'Core',
    description: 'Focused goals within a project — Study, Habit, or Hobby.',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Study', value: 'study' },
        { label: 'Habit', value: 'habit' },
        { label: 'Hobby', value: 'hobby' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'targetHours',
      type: 'number',
      min: 0,
      admin: {
        description: 'Target hours to dedicate to this mission.',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Parent relationship
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      filterOptions: {
        type: { in: ['mission', 'general'] },
      },
      admin: {
        position: 'sidebar',
      },
    },
    // Reverse relationships
    {
      name: 'books',
      type: 'join',
      collection: 'books',
      on: 'mission',
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
  ],
  timestamps: true,
}
