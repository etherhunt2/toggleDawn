import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'
import { withCacheHooks, CacheTTL } from '../lib/payloadCacheHooks'

/**
 * MissionTypes collection — user-defined mission categories.
 *
 * Each type defines HOW a mission is measured / scored.
 * The measurement system is block-based for maximum flexibility:
 * users pick which "measurement dimensions" apply to this type.
 *
 * FK relationships:
 *   mission-types.icon  → media.id  (optional icon upload)
 *   mission-types.owner → users.id
 *   missions.missionType → mission-types.id  (reverse)
 */
export const MissionTypes: CollectionConfig = {
  slug: 'mission-types',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'presetIcon', 'owner', 'updatedAt'],
    group: 'Core',
    description:
      'User-defined mission types. Each type defines its measurement strategy — timer hours, streaks, notes, tasks, time-slots, or any combination.',
  },
  hooks: withCacheHooks('mission-types', {
    beforeChange: [setOwner],
  }, CacheTTL.REFERENCE),
  fields: [
    // ─────────────────────────────────────────────────────────────
    // 1. IDENTITY
    // ─────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of this mission type (e.g. Study, Habit, Hobby, Coding, Lead Gen).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional explanation of what this mission type is for.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 2. ICON — select a preset OR upload a custom icon
    //    FK: mission-types.icon → media.id
    // ─────────────────────────────────────────────────────────────
    {
      name: 'iconMode',
      label: 'Icon Source',
      type: 'select',
      defaultValue: 'preset',
      options: [
        { label: '🎨 Preset Icon', value: 'preset' },
        { label: '📤 Upload Custom Icon', value: 'upload' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Choose a built-in icon or upload your own.',
      },
    },
    {
      name: 'presetIcon',
      label: 'Preset Icon',
      type: 'select',
      options: [
        { label: '📚 Study / Book', value: 'study' },
        { label: '🏋️ Habit / Fitness', value: 'habit' },
        { label: '🎨 Hobby / Creative', value: 'hobby' },
        { label: '💻 Coding / Dev', value: 'coding' },
        { label: '📞 Lead Gen / Sales', value: 'lead-gen' },
        { label: '✍️ Writing', value: 'writing' },
        { label: '🎵 Music', value: 'music' },
        { label: '🧘 Meditation', value: 'meditation' },
        { label: '🗣️ Communication', value: 'communication' },
        { label: '🔬 Research', value: 'research' },
        { label: '📊 Analytics', value: 'analytics' },
        { label: '🎯 General', value: 'general' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.iconMode !== 'upload',
        description: 'Select a built-in icon to represent this type.',
      },
    },
    {
      name: 'icon',
      label: 'Custom Icon Upload',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        position: 'sidebar',
        condition: (data) => data?.iconMode === 'upload',
        description: 'Upload a custom icon image (PNG, SVG, or WebP preferred).',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 3. MEASUREMENT DIMENSIONS — the core flexible scoring system
    //
    //    Each block type represents a different "axis" of measurement.
    //    Users combine any number of them when creating a mission type.
    //    The scoring engine reads these to decide WHAT data to fetch
    //    and HOW to weight each dimension in the final score.
    // ─────────────────────────────────────────────────────────────
    {
      name: 'measurementDimensions',
      label: 'Measurement Dimensions',
      type: 'blocks',
      minRows: 1,
      admin: {
        description:
          'Define HOW missions of this type are measured. Add one or more dimensions. Each dimension contributes to the overall progress and score card.',
      },
      blocks: [
        // ─── A. TIMER HOURS ───
        // Measured by OPS Timer / time-log data linked to the mission.
        // Used by: Study, Hobby, Coding, Lead Gen
        {
          slug: 'timer-hours',
          labels: { singular: 'Timer Hours', plural: 'Timer Hours' },
          fields: [
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Time Logged',
              admin: {
                description: 'Display label for this dimension on the scorecard.',
              },
            },
            {
              name: 'weight',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 50,
              admin: {
                description:
                  'Weight (%) of this dimension in overall progress. All weights should sum to 100 across all dimensions.',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'How timer hours factor into scoring for this type.',
              },
            },
          ],
        },

        // ─── B. STREAK TRACKING ───
        // Days followed vs days missed. Generates a scorecard.
        // Used by: Habit, Hobby
        {
          slug: 'streak-tracking',
          labels: { singular: 'Streak Tracking', plural: 'Streak Tracking' },
          fields: [
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Streak Score',
              admin: {
                description: 'Display label (e.g. "Daily Streak", "Consistency Score").',
              },
            },
            {
              name: 'weight',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 50,
              admin: {
                description: 'Weight (%) in overall progress.',
              },
            },
            {
              name: 'trackCheatedDays',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Whether to track and penalize "cheated" or missed days.',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'How streak data factors into the report card.',
              },
            },
          ],
        },

        // ─── C. NOTE TRACKING ───
        // Notes reading completed + notes created & edited.
        // Used by: Study
        {
          slug: 'note-tracking',
          labels: { singular: 'Note Tracking', plural: 'Note Tracking' },
          fields: [
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Notes Progress',
              admin: {
                description: 'Display label (e.g. "Study Notes", "Reading Progress").',
              },
            },
            {
              name: 'weight',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 30,
              admin: {
                description: 'Weight (%) in overall progress.',
              },
            },
            {
              name: 'trackCreated',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Count notes created by the user.',
              },
            },
            {
              name: 'trackRead',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Count notes marked as read/completed.',
              },
            },
            {
              name: 'trackEdited',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Count notes edited/revised by the user.',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'How note activity factors into the scorecard.',
              },
            },
          ],
        },

        // ─── D. TASK COMPLETION ───
        // Number of tasks completed vs total tasks.
        // Used by: Coding (future Tasks system)
        {
          slug: 'task-completion',
          labels: { singular: 'Task Completion', plural: 'Task Completion' },
          fields: [
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Tasks Completed',
              admin: {
                description: 'Display label (e.g. "Sprint Tasks", "Coding Tasks").',
              },
            },
            {
              name: 'weight',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 40,
              admin: {
                description: 'Weight (%) in overall progress.',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description:
                  'How task completion factors into scoring (future Tasks collection integration).',
              },
            },
          ],
        },

        // ─── E. TIME-SLOT TRACKING ───
        // Flexible time-of-day scheduling: morning / afternoon / evening / night.
        // Reports which slots were met and which were missed.
        // Used by: Lead Gen
        {
          slug: 'time-slot-tracking',
          labels: { singular: 'Time-Slot Tracking', plural: 'Time-Slot Tracking' },
          fields: [
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Schedule Adherence',
              admin: {
                description: 'Display label (e.g. "Daily Slots", "Time Schedule").',
              },
            },
            {
              name: 'weight',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 60,
              admin: {
                description: 'Weight (%) in overall progress.',
              },
            },
            {
              name: 'slots',
              type: 'array',
              minRows: 1,
              admin: {
                description:
                  'Define the time slots to track. Each slot has a name, target minutes, and time window.',
              },
              fields: [
                {
                  name: 'slotName',
                  type: 'select',
                  required: true,
                  options: [
                    { label: '🌅 Morning (6am–12pm)', value: 'morning' },
                    { label: '☀️ Afternoon (12pm–5pm)', value: 'afternoon' },
                    { label: '🌆 Evening (5pm–9pm)', value: 'evening' },
                    { label: '🌙 Night (9pm–12am)', value: 'night' },
                    { label: '🔧 Custom', value: 'custom' },
                  ],
                },
                {
                  name: 'customSlotName',
                  type: 'text',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.slotName === 'custom',
                    description: 'Name for your custom time slot.',
                  },
                },
                {
                  name: 'targetMinutes',
                  type: 'number',
                  required: true,
                  defaultValue: 60,
                  min: 1,
                  admin: {
                    description: 'Target minutes to log within this slot each day.',
                  },
                },
                {
                  name: 'startHour',
                  type: 'number',
                  min: 0,
                  max: 23,
                  admin: {
                    description: 'Start hour (24h, e.g. 6 = 6am, 17 = 5pm). Used for custom slots.',
                  },
                },
                {
                  name: 'endHour',
                  type: 'number',
                  min: 0,
                  max: 23,
                  admin: {
                    description: 'End hour (24h, e.g. 12 = 12pm, 21 = 9pm). Used for custom slots.',
                  },
                },
              ],
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description:
                  'How time-slot adherence factors into the report card and missed-slot alerts.',
              },
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // 4. REVERSE JOINS
    // ─────────────────────────────────────────────────────────────
    {
      name: 'missions',
      type: 'join',
      collection: 'missions',
      on: 'missionType',
      admin: {
        description: 'All missions using this type (computed join — read only).',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 5. OWNER — auto-set
    //    FK: mission-types.owner → users.id
    // ─────────────────────────────────────────────────────────────
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.owner),
        description: 'Owner is set automatically on creation.',
      },
    },
  ],
  timestamps: true,
}
