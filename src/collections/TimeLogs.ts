import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'
import { calculateDuration } from '../hooks/calculateDuration'

/**
 * TimeLogs collection — 24-hour block time tracking.
 * Logs active/retroactive time entries with categorical tagging.
 * Duration is auto-calculated from startTime and endTime.
 */
export const TimeLogs: CollectionConfig = {
  slug: 'time-logs',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'category',
    defaultColumns: ['category', 'startTime', 'endTime', 'duration', 'mission', 'createdAt'],
    group: 'Tracking',
    description: 'Hourly time blocks — tap to log, fill retroactively.',
  },
  hooks: {
    beforeChange: [setOwner, calculateDuration],
  },
  fields: [
    {
      name: 'startTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When this time block started.',
      },
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When this time block ended.',
      },
    },
    {
      name: 'duration',
      type: 'number',
      min: 0,
      admin: {
        readOnly: true,
        description: 'Auto-calculated duration in minutes.',
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Study', value: 'study' },
        { label: 'Work', value: 'work' },
        { label: 'Exercise', value: 'exercise' },
        { label: 'Hobby', value: 'hobby' },
        { label: 'Rest', value: 'rest' },
        { label: 'Social', value: 'social' },
        { label: 'Chores', value: 'chores' },
        { label: 'Commute', value: 'commute' },
        { label: 'Sleep', value: 'sleep' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'text',
      admin: {
        description: 'Optional note about what you did during this block.',
      },
    },
    // Optional link to a mission for tracking study/habit/hobby hours
    {
      name: 'mission',
      type: 'relationship',
      relationTo: 'missions',
      admin: {
        description: 'Optionally link this time block to a specific mission.',
        position: 'sidebar',
      },
    },
    {
      name: 'isRetroactive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Was this entry filled in after the fact?',
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
  ],
  timestamps: true,
}
