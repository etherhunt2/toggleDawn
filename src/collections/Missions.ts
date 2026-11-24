import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { adminOnly, adminOnlyField, authenticatedField } from '../access/adminOnly'
import { setOwner } from '../hooks/setOwner'
import { computeMissionProgress } from '../hooks/computeMissionProgress'
import { checkRole } from '../access/checkRole'
import { withCacheHooks, CacheTTL } from '../lib/payloadCacheHooks'

/**
 * Missions collection — focused goals within a Project.
 *
 * Enhanced with:
 *   - Flexible mission type (FK to mission-types)
 *   - Flexible target scheduling (daily/weekly/time-slots/total/custom)
 *   - Admin force-status (terminate/completed)
 *   - Computed progress from time-logs, streaks, notes, and time-slots
 *   - Streak data for habit/hobby scoring
 *   - Mission planners (reverse join)
 *
 * FK relationships:
 *   missions.missionType → mission-types.id
 *   missions.project     → projects.id
 *   missions.categories  → categories.id[]
 *   missions.owner       → users.id
 *   time-logs.mission    → missions.id      (reverse)
 *   habits.mission       → missions.id      (reverse)
 *   books.mission        → missions.id      (reverse)
 *   mission-planners.mission → missions.id  (reverse)
 *
 * Access control:
 *   - Normal users:  create / read-own / update-own / delete-own
 *   - Admins:        full CRUD + admin-only fields (adminStatus, adminForcedProgress)
 */
export const Missions: CollectionConfig = {
  slug: 'missions',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole('admin', user)) return true
      return { owner: { equals: user.id } }
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'missionType', 'project', 'status', 'adminStatus', 'computedProgress', 'updatedAt'],
    group: 'Core',
    description:
      'Focused goals within a project. Flexibly measured by timer hours, streaks, notes, tasks, or time-slots.',
  },
  hooks: withCacheHooks('missions', {
    beforeChange: [setOwner, computeMissionProgress],
  }, CacheTTL.ACTIVE),
  fields: [
    // ─────────────────────────────────────────────────────────────
    // 1. CORE IDENTITY
    // ─────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Mission name displayed in the HUD dashboard.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'What this mission aims to achieve.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 2. MISSION TYPE — FK to user-defined MissionTypes
    //    FK: missions.missionType → mission-types.id
    //    Replaces the old hardcoded select field.
    //    Also keep legacy `type` for backward compatibility.
    // ─────────────────────────────────────────────────────────────
    {
      name: 'missionType',
      label: 'Mission Type',
      type: 'relationship',
      relationTo: 'mission-types',
      admin: {
        position: 'sidebar',
        description:
          'Choose a mission type to define how this mission is measured. Create new types in the Mission Types collection.',
      },
    },
    // Legacy type field — kept for backward compat. Hidden when missionType is set.
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Study', value: 'study' },
        { label: 'Habit', value: 'habit' },
        { label: 'Hobby', value: 'hobby' },
        { label: 'Coding', value: 'coding' },
        { label: 'Lead Gen', value: 'lead-gen' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Legacy type field. Use Mission Type (relationship) for flexible measurement.',
        condition: (data) => !data?.missionType,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 3. STATUS — user-controlled lifecycle
    // ─────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '📋 Planning', value: 'planning' },
        { label: '🚀 Active', value: 'active' },
        { label: '⏸ Paused', value: 'paused' },
        { label: '✅ Completed', value: 'completed' },
        { label: '🗄 Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Your own lifecycle status for this mission.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 4. ADMIN STATUS — admin-only override
    // ─────────────────────────────────────────────────────────────
    {
      name: 'adminStatus',
      label: 'Admin Override Status',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: '—  None (use user status)', value: 'none' },
        { label: '🛑 Terminated (admin force-stop)', value: 'terminated' },
        { label: '✅ Completed (admin verified)', value: 'admin-completed' },
      ],
      access: {
        read: adminOnlyField,
        update: adminOnlyField,
        create: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description:
          '⚠️ Admin only. Forcefully terminate or verify completion of a mission.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 5. FLEXIBLE TARGET CONFIGURATION
    //    Strike-rate targets like "2h/day Mon–Fri", "daily 1h", etc.
    // ─────────────────────────────────────────────────────────────
    {
      name: 'targetConfig',
      label: 'Target Schedule Configuration',
      type: 'group',
      admin: {
        description:
          'Define flexible time targets — daily hours, weekly schedule with active days, time-slot quotas, or a flat total.',
      },
      fields: [
        {
          name: 'mode',
          label: 'Target Mode',
          type: 'select',
          required: true,
          defaultValue: 'total',
          options: [
            { label: '📊 Total Hours (flat target)', value: 'total' },
            { label: '📅 Daily (same hours every day)', value: 'daily' },
            { label: '📆 Weekly (specific days)', value: 'weekly' },
            { label: '🕐 Time-Slot Schedule', value: 'time-slots' },
            { label: '🔧 Custom', value: 'custom' },
          ],
          admin: {
            description:
              'How the target is structured. Determines which sub-fields to show.',
          },
        },

        // ── TOTAL mode ──
        {
          name: 'totalTargetHours',
          label: 'Total Target Hours',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) =>
              data?.targetConfig?.mode === 'total' || data?.targetConfig?.mode === 'custom',
            description: 'Overall target hours for this mission (regardless of schedule).',
          },
        },

        // ── DAILY mode ──
        {
          name: 'dailyTargetHours',
          label: 'Daily Target (hours)',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) => data?.targetConfig?.mode === 'daily',
            description: 'Hours to log per day (e.g. 1 hour daily).',
          },
        },

        // ── WEEKLY mode ──
        {
          name: 'weeklyActiveDays',
          label: 'Active Days of the Week',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Monday', value: 'mon' },
            { label: 'Tuesday', value: 'tue' },
            { label: 'Wednesday', value: 'wed' },
            { label: 'Thursday', value: 'thu' },
            { label: 'Friday', value: 'fri' },
            { label: 'Saturday', value: 'sat' },
            { label: 'Sunday', value: 'sun' },
          ],
          admin: {
            condition: (data) => data?.targetConfig?.mode === 'weekly',
            description: 'Which days of the week are active for this mission.',
          },
        },
        {
          name: 'hoursPerActiveDay',
          label: 'Hours per Active Day',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) => data?.targetConfig?.mode === 'weekly',
            description: 'Hours to log on each active day (e.g. 2 hours per day Mon–Fri).',
          },
        },
        {
          name: 'weeklyTotalTarget',
          label: 'Weekly Total Target (hours)',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) => data?.targetConfig?.mode === 'weekly',
            description:
              'Auto-calculated or manually set total weekly target. E.g. 2h × 5 days = 10h/week.',
          },
        },

        // ── TIME-SLOTS mode ──
        {
          name: 'timeSlots',
          label: 'Time Slot Schedule',
          type: 'array',
          admin: {
            condition: (data) => data?.targetConfig?.mode === 'time-slots',
            description:
              'Define time-of-day slots (e.g. 1h morning, 1h afternoon, 1h evening, 1h night).',
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
              name: 'customSlotLabel',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.slotName === 'custom',
              },
            },
            {
              name: 'targetMinutes',
              type: 'number',
              required: true,
              defaultValue: 60,
              min: 1,
              admin: {
                description: 'Target minutes for this slot each active day.',
              },
            },
            {
              name: 'startHour',
              type: 'number',
              min: 0,
              max: 23,
              admin: {
                description: 'Start hour (24h format).',
              },
            },
            {
              name: 'endHour',
              type: 'number',
              min: 0,
              max: 23,
              admin: {
                description: 'End hour (24h format).',
              },
            },
          ],
        },

        // ── CUSTOM mode notes ──
        {
          name: 'customTargetDescription',
          label: 'Custom Target Notes',
          type: 'textarea',
          admin: {
            condition: (data) => data?.targetConfig?.mode === 'custom',
            description:
              'Describe the custom target schedule in plain text (for missions that do not fit standard modes).',
          },
        },
      ],
    },

    // Legacy targetHours — kept for backward compat and simple display
    {
      name: 'targetHours',
      type: 'number',
      min: 0,
      admin: {
        description:
          'Legacy flat target hours. When targetConfig is set, this is auto-computed from the schedule.',
        position: 'sidebar',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 6. PROGRESS TRACKING
    // ─────────────────────────────────────────────────────────────
    {
      name: 'computedProgress',
      label: 'Progress (%)',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      access: {
        read: authenticatedField,
        update: adminOnlyField,
        create: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Auto-computed based on mission type measurement dimensions. Admin can override via "Admin Force Progress".',
      },
    },
    {
      name: 'adminForcedProgress',
      label: 'Admin Force Progress (%)',
      type: 'number',
      min: 0,
      max: 100,
      access: {
        read: adminOnlyField,
        update: adminOnlyField,
        create: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description:
          '⚠️ Admin only. Enter 0–100 to pin progress, bypassing automatic computation.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 7. STREAK DATA — for habit/hobby scoring
    // ─────────────────────────────────────────────────────────────
    {
      name: 'streakData',
      label: 'Streak & Consistency Tracking',
      type: 'group',
      admin: {
        description:
          'Streak counters for habit/hobby type missions. Updated automatically or manually.',
      },
      fields: [
        {
          name: 'currentStreak',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Current active streak (consecutive days met).',
          },
        },
        {
          name: 'longestStreak',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Best streak ever achieved.',
          },
        },
        {
          name: 'totalFollowed',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total days the mission was followed/completed.',
          },
        },
        {
          name: 'totalMissed',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total days the mission was missed/cheated.',
          },
        },
        {
          name: 'streakHistory',
          type: 'json',
          defaultValue: [],
          admin: {
            description:
              'Array of { date: "YYYY-MM-DD", status: "completed" | "missed" | "partial" } entries.',
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // 8. TIMELINE
    // ─────────────────────────────────────────────────────────────
    {
      name: 'deadline',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        position: 'sidebar',
        description: 'Target completion date for this mission.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        position: 'sidebar',
        description: 'When work on this mission officially began.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 9. PRIORITY
    // ─────────────────────────────────────────────────────────────
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: '🔴 Critical', value: 'critical' },
        { label: '🟠 High', value: 'high' },
        { label: '🟡 Medium', value: 'medium' },
        { label: '🟢 Low', value: 'low' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Priority level for queue ordering.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 10. PROJECT LINK
    //     FK: missions.project → projects.id
    // ─────────────────────────────────────────────────────────────
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Parent project this mission belongs to.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 11. CATEGORIES
    //     FK: missions.categories → categories.id[]
    // ─────────────────────────────────────────────────────────────
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
        description: 'Tag this mission with categories.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 12. NOTES — Optional mission-level notes
    // ─────────────────────────────────────────────────────────────
    {
      name: 'notes',
      label: 'Mission Notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes visible only to the mission owner and admins.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 13. REVERSE RELATIONSHIPS (JOIN — read only)
    // ─────────────────────────────────────────────────────────────
    {
      name: 'books',
      type: 'join',
      collection: 'books',
      on: 'mission',
    },
    {
      name: 'planners',
      type: 'join',
      collection: 'mission-planners',
      on: 'mission',
      admin: {
        description: 'All planners linked to this mission (computed join — read only).',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 14. OWNER — auto-set by setOwner hook
    //     FK: missions.owner → users.id
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
    slugField(),
  ],
  timestamps: true,
}
