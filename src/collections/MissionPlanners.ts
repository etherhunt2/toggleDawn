import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownOnly } from '../access/ownOnly'
import { setOwner } from '../hooks/setOwner'

/**
 * MissionPlanners collection — mission-specific planners / mind-maps.
 *
 * Users can create MULTIPLE planners per mission.
 * Each planner holds structured plan data (outline, checklist, mind-map nodes, etc.).
 *
 * FK relationships:
 *   mission-planners.mission → missions.id
 *   mission-planners.owner   → users.id
 *
 * Future: This same structure can be extended for project-level planners
 * by adding a polymorphic `linkedTo` or separate `project` FK field.
 */
export const MissionPlanners: CollectionConfig = {
  slug: 'mission-planners',
  access: {
    create: authenticated,
    read: ownOnly,
    update: ownOnly,
    delete: ownOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'mission', 'status', 'updatedAt'],
    group: 'Core',
    description:
      'Mission-specific planners. Create checklists, outlines, or mind-map nodes for a mission.',
  },
  hooks: {
    beforeChange: [setOwner],
  },
  fields: [
    // ─────────────────────────────────────────────────────────────
    // 1. IDENTITY
    // ─────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of this planner (e.g. "Week 1 Sprint Plan", "Study Roadmap").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'What this planner covers or how it structures the mission work.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 2. MISSION LINK
    //    FK: mission-planners.mission → missions.id
    // ─────────────────────────────────────────────────────────────
    {
      name: 'mission',
      type: 'relationship',
      relationTo: 'missions',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The mission this planner belongs to.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 3. STATUS
    // ─────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '📝 Draft', value: 'draft' },
        { label: '🚀 Active', value: 'active' },
        { label: '✅ Completed', value: 'completed' },
        { label: '🗄 Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 4. PLAN CONTENT — structured blocks for flexible planning
    // ─────────────────────────────────────────────────────────────
    {
      name: 'planType',
      label: 'Plan Type',
      type: 'select',
      defaultValue: 'checklist',
      options: [
        { label: '☑️ Checklist', value: 'checklist' },
        { label: '📋 Outline / Steps', value: 'outline' },
        { label: '🧠 Mind-Map Nodes', value: 'mindmap' },
        { label: '📝 Free-form Notes', value: 'freeform' },
      ],
      admin: {
        description: 'Structure format for this planner.',
      },
    },

    // Checklist items — simple array of tasks with completion status
    {
      name: 'checklistItems',
      type: 'array',
      admin: {
        condition: (data) => data?.planType === 'checklist',
        description: 'Checklist items. Mark each as done when completed.',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'isCompleted',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'priority',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
          ],
        },
        {
          name: 'dueDate',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayOnly' },
          },
        },
      ],
    },

    // Outline / Steps — ordered list of steps with descriptions
    {
      name: 'outlineSteps',
      type: 'array',
      admin: {
        condition: (data) => data?.planType === 'outline',
        description: 'Ordered steps or phases.',
      },
      fields: [
        {
          name: 'stepTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'stepDescription',
          type: 'textarea',
        },
        {
          name: 'isCompleted',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'estimatedHours',
          type: 'number',
          min: 0,
        },
      ],
    },

    // Mind-Map Nodes — tree structure stored as flat array with parentId
    {
      name: 'mindmapNodes',
      type: 'array',
      admin: {
        condition: (data) => data?.planType === 'mindmap',
        description: 'Mind-map nodes. Use parentNodeId for tree hierarchy.',
      },
      fields: [
        {
          name: 'nodeId',
          type: 'text',
          required: true,
          admin: {
            description: 'Unique identifier for this node (auto-generated or manual).',
          },
        },
        {
          name: 'parentNodeId',
          type: 'text',
          admin: {
            description: 'Parent node ID. Leave empty for root nodes.',
          },
        },
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            description: 'Hex color for this node branch.',
          },
        },
        {
          name: 'isExpanded',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },

    // Free-form notes — plain textarea for unstructured planning
    {
      name: 'freeformContent',
      type: 'textarea',
      admin: {
        condition: (data) => data?.planType === 'freeform',
        description: 'Free-form planning notes, brainstorming, or scratchpad.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 5. METADATA
    // ─────────────────────────────────────────────────────────────
    {
      name: 'color',
      type: 'text',
      defaultValue: '#00f0ff',
      admin: {
        position: 'sidebar',
        description: 'Visual color tag for HUD display.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order among planners for the same mission.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // 6. OWNER — auto-set
    //    FK: mission-planners.owner → users.id
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
