import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * Schedules collection — time-blocked schedule and planner items.
 * Owned by a user, optionally linked to a Mission.
 */
export const Schedules: CollectionConfig = {
  slug: 'schedules',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'startTime', 'endTime', 'category', 'isCompleted', 'updatedAt'],
    group: 'Tracking',
    description: 'Time-blocked daily schedule and planner events.',
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
        description: 'Title of the event or scheduled block.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Details or checklist for this block.',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Start time in 24h format (e.g. 09:00).',
        position: 'sidebar',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      admin: {
        description: 'End time in 24h format (e.g. 10:30).',
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'study',
      options: [
        { label: 'Study', value: 'study' },
        { label: 'Work', value: 'work' },
        { label: 'Exercise', value: 'exercise' },
        { label: 'Social', value: 'social' },
        { label: 'Rest', value: 'rest' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isRecurring',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Does this block repeat weekly?',
      },
    },
    {
      name: 'recurringDays',
      type: 'json',
      defaultValue: [],
      admin: {
        description: 'Array of day numbers (0=Sun, 1=Mon, ..., 6=Sat) if recurring.',
        condition: (data) => Boolean(data?.isRecurring),
      },
    },
    {
      name: 'color',
      type: 'text',
      defaultValue: '#00ff9d',
      admin: {
        description: 'Hex color for the calendar block.',
        position: 'sidebar',
      },
    },
    {
      name: 'isCompleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark completed once done.',
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

