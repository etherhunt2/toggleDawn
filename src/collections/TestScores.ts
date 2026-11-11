import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * TestScores collection — exam performance tracking.
 * Links to Study missions for subject-wise weakness mapping.
 */
export const TestScores: CollectionConfig = {
  slug: 'test-scores',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'examName',
    defaultColumns: ['examName', 'subject', 'scoreObtained', 'totalScore', 'percentage', 'examDate'],
    group: 'Tracking',
    description: 'Record exam results for trend analysis and weakness mapping.',
  },
  hooks: {
    beforeChange: [
      setOwner,
      // Auto-calculate percentage
      ({ data }) => {
        if (data.scoreObtained != null && data.totalScore && data.totalScore > 0) {
          data.percentage = Math.round((data.scoreObtained / data.totalScore) * 100 * 100) / 100
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'examName',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the exam or test.',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Subject area tested.',
      },
    },
    {
      name: 'scoreObtained',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Marks/score obtained.',
      },
    },
    {
      name: 'totalScore',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Maximum possible marks/score.',
      },
    },
    {
      name: 'percentage',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated percentage.',
        position: 'sidebar',
      },
    },
    {
      name: 'examDate',
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
      name: 'examType',
      type: 'select',
      defaultValue: 'test',
      options: [
        { label: 'Quiz', value: 'quiz' },
        { label: 'Test', value: 'test' },
        { label: 'Mid-Term', value: 'midterm' },
        { label: 'Final', value: 'final' },
        { label: 'Mock', value: 'mock' },
        { label: 'Practice', value: 'practice' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Reflections, mistakes to review, weak areas.',
      },
    },
    // Link to the study mission this exam relates to
    {
      name: 'mission',
      type: 'relationship',
      relationTo: 'missions',
      admin: {
        description: 'Link to the study mission this exam belongs to.',
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      filterOptions: {
        type: { in: ['exam', 'general'] },
      },
      admin: {
        position: 'sidebar',
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
