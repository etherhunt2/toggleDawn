import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * Habits collection — streak tracking, daily routine management.
 * Owned by a user, optionally linked to a Mission.
 */
export const Habits: CollectionConfig = {
  slug: 'habits',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'frequency', 'streak', 'bestStreak', 'isActive', 'updatedAt'],
    group: 'Tracking',
    description: 'Track daily habits, streaks, and completion rates.',
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
        description: 'Name of the habit to track (e.g. Morning Workout, Read 20 pages).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Why this habit matters or execution details.',
      },
    },
    {
      name: 'frequency',
      type: 'select',
      required: true,
      defaultValue: 'daily',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'streak',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Current active streak in days.',
      },
    },
    {
      name: 'bestStreak',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Longest streak achieved.',
      },
    },
    {
      name: 'completedDates',
      type: 'json',
      defaultValue: [],
      admin: {
        description: 'List of ISO date strings (YYYY-MM-DD) when this habit was completed.',
      },
    },
    {
      name: 'color',
      type: 'text',
      defaultValue: '#00ff9d',
      admin: {
        description: 'Hex color for the HUD badge (e.g. #00ff9d, #6C5CE7).',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Whether this habit is actively tracked.',
      },
    },
    {
      name: 'mission',
      type: 'relationship',
      relationTo: 'missions',
      admin: {
        description: 'Optionally link to a mission.',
        position: 'sidebar',
      },
    },
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

