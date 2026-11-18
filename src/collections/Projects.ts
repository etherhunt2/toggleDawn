import type { CollectionConfig, Field } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { adminOnly, adminOnlyField, authenticatedField } from '../access/adminOnly'
import { setOwner } from '../hooks/setOwner'
import { computeProjectProgress } from '../hooks/computeProjectProgress'
import { checkRole } from '../access/checkRole'

/**
 * Projects collection — top-level organizational container.
 *
 * Relationships (FK structure):
 *   projects.owner         → users.id
 *   projects.categories    → categories.id[]
 *   projects.featuredImage → media.id  (image)
 *   projects.videoResource → media.id  (video)
 *   projects.plannerId     → planners.id  (future — placeholder)
 *   missions.project       → projects.id  (reverse join shown below)
 *
 * Access control:
 *   - Normal users:  create / read-own / update-own (restricted fields) / delete-own
 *   - Admins:        full CRUD + admin-only fields (adminStatus, adminForcedProgress)
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    read: ownOnly,
    // Update: authenticated but field-level rules restrict sensitive fields to admin
    update: ownOnly,
    // Only admins can hard-delete projects; users use status:'archived'
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole('admin', user)) return true
      // Regular users can delete their own projects
      return { owner: { equals: user.id } }
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'adminStatus', 'computedProgress', 'deadline', 'owner', 'updatedAt'],
    group: 'Core',
    description: 'Top-level containers for organizing missions and goals.',
    listSearchableFields: ['title', 'description'],
  },
  hooks: {
    beforeChange: [setOwner, computeProjectProgress],
  },
  fields: [
    // ─────────────────────────────────────────────────────────────
    // 1. CORE IDENTITY
    // ─────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Project name displayed across the HUD dashboard.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short summary or objective of this project.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 2. FEATURED IMAGE
    //    FK: projects.featuredImage → media.id
    // ─────────────────────────────────────────────────────────────
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        // Accept image MIME types only (JPG, PNG, WebP, GIF, SVG)
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Featured banner image shown on the project detail page and project cards.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 3. VIDEO RESOURCE
    //    FK: projects.videoResource → media.id  (video only)
    //    Visible in user dashboard on /projects/[id]
    // ─────────────────────────────────────────────────────────────
    {
      name: 'videoResource',
      label: 'Project Video Resource',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        // Accept video MIME types only (MP4, WebM, OGG, MOV, AVI)
        mimeType: { contains: 'video' },
      },
      admin: {
        description:
          'An instructional or reference video for this project. Only visible on the individual project detail page in the user dashboard.',
      },
    },
    {
      name: 'videoTitle',
      label: 'Video Title / Label',
      type: 'text',
      admin: {
        description: 'Optional label for the video shown beneath the player.',
        condition: (data) => Boolean(data?.videoResource),
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 4. STATUS — User-controlled lifecycle
    //    Normal users:  can set planning / active / on-hold / paused
    //    Admins:        can also set completed / archived via adminStatus
    // ─────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '📋 Planning', value: 'planning' },
        { label: '🚀 Active', value: 'active' },
        { label: '⏸ Paused', value: 'on-hold' },
        { label: '✅ Completed', value: 'completed' },
        { label: '🗄 Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Your own lifecycle status for this project.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 5. ADMIN STATUS — Admin-only override
    //    Admins can forcefully terminate or mark complete
    //    Normal users cannot see or modify this field
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
        // Only admins can read/write this field
        read: adminOnlyField,
        update: adminOnlyField,
        create: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description:
          '⚠️ Admin only. Use to forcefully terminate or verify completion of a project. Overrides the user status in the dashboard display.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 6. PROGRESS TRACKING
    //    computedProgress — auto-calculated by hook (read-only for users)
    //    adminForcedProgress — admin can pin a specific % to override computation
    // ─────────────────────────────────────────────────────────────
    {
      name: 'computedProgress',
      label: 'Progress (%)',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      access: {
        // Users can read (shown in dashboard progress bar), but cannot write
        read: authenticatedField,
        update: adminOnlyField,
        create: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Auto-computed from time logs vs mission target hours. Updated on every save. Use "Admin Forced Progress" below to override.',
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
          '⚠️ Admin only. Enter 0–100 to pin progress to a specific value, bypassing automatic computation. Leave blank to use auto-computation.',
        condition: () => true,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 7. TIMELINE
    // ─────────────────────────────────────────────────────────────
    {
      name: 'deadline',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
        description: 'Target completion date. Shown in progress bars and countdown labels.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
        description: 'When work on this project officially began.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 8. VISUAL IDENTITY — Color Picker (custom UI component)
    // ─────────────────────────────────────────────────────────────
    {
      name: 'color',
      type: 'text',
      defaultValue: '#00f0ff',
      validate: (value: any) => {
        if (!value) return true // optional
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return 'Color must be a valid 6-digit hex code (e.g. #6C5CE7)'
        }
        return true
      },
      admin: {
        position: 'sidebar',
        description: 'Hex color for visual tagging in the HUD dashboard.',
        // Custom color picker component registered in payload.config.ts importMap
        components: {
          Field: '@/components/fields/ColorPickerField#ColorPickerField',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 9. CATEGORIES
    //    FK: projects.categories → categories.id[]
    // ─────────────────────────────────────────────────────────────
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
        description: 'Tag this project with one or more categories.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 10. PLANNER LINK (placeholder for future feature)
    //     FK: projects.plannerId → planners.id  (future collection)
    //     This field is a text UUID placeholder until the Planner
    //     collection is created. Rename to a relationship once ready.
    // ─────────────────────────────────────────────────────────────
    {
      name: 'plannerId',
      label: 'Planner ID (Future)',
      type: 'text',
      admin: {
        position: 'sidebar',
        description:
          '🔗 Reserved for future Planner / Mind-Map feature. Store the planner document ID here to link this project to a planner board.',
        condition: () => false, // Hidden in admin UI for now — field exists in DB for future migration
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 11. REVERSE RELATIONSHIPS (JOIN — no FK in projects table)
    //     missions.project → projects.id  (virtual join)
    // ─────────────────────────────────────────────────────────────
    {
      name: 'missions',
      type: 'join',
      collection: 'missions',
      on: 'project',
      admin: {
        description: 'All missions linked to this project (computed join — read only).',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 12. NOTES — Optional project-level notes
    // ─────────────────────────────────────────────────────────────
    {
      name: 'notes',
      label: 'Project Notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes visible only to the project owner and admins.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 13. PRIORITY
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
        description: 'Priority level for queue ordering in the HUD.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 14. OWNER — auto-set by setOwner hook
    //     FK: projects.owner → users.id
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
