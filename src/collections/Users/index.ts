import type { CollectionConfig } from 'payload'
import { checkRole } from '../../access/checkRole'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Restrict access to /super-master dashboard exclusively to administrators
    admin: ({ req: { user } }) => checkRole('admin', user),
    // Normal registration is allowed for any user
    create: () => true,
    // Users can view their own profile; admins can view all users
    read: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole('admin', user)) return true
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Users can update their own profile; admins can update any user
    update: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole('admin', user)) return true
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Only administrators can delete users
    delete: ({ req: { user } }) => checkRole('admin', user),
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  hooks: {
    beforeChange: [
      ({ req, data, operation, originalDoc }) => {
        const isAdmin = checkRole('admin', req?.user)
        const isBootstrapAdmin =
          data?.email === 'admin@toggledawn.com' || originalDoc?.email === 'admin@toggledawn.com'

        // If not an admin and not the bootstrap admin, strictly lock role to 'user'
        if (!isAdmin && !isBootstrapAdmin) {
          if (operation === 'create') {
            data.role = 'user'
          }
          if (operation === 'update' && originalDoc) {
            data.role = originalDoc.role || 'user'
          }
        } else if (isBootstrapAdmin && !data.role) {
          data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      saveToJWT: true,
      options: [
        { label: 'Administrator (Full Access + /super-master)', value: 'admin' },
        { label: 'Normal User (Operator Dashboard)', value: 'user' },
      ],
      access: {
        // Only administrators can assign or update user roles
        create: ({ req: { user } }) => checkRole('admin', user),
        update: ({ req: { user } }) => checkRole('admin', user),
      },
      admin: {
        position: 'sidebar',
        description: 'Only administrators can modify roles or grant access to the /super-master dashboard.',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        description: 'User preferences for the ToggleDawn experience.',
      },
      fields: [
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'system',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System', value: 'system' },
          ],
        },
        {
          name: 'defaultProjectView',
          type: 'select',
          defaultValue: 'grid',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
          ],
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'Asia/Kolkata',
          admin: {
            description: 'IANA timezone string (e.g. Asia/Kolkata, America/New_York).',
          },
        },
        {
          name: 'dailyGoalHours',
          type: 'number',
          defaultValue: 8,
          min: 1,
          max: 24,
          admin: {
            description: 'Target productive hours per day.',
          },
        },
        {
          name: 'enableNotifications',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'streakForgivenessBuffer',
          type: 'number',
          defaultValue: 1,
          min: 0,
          max: 7,
          admin: {
            description:
              'Number of missed days before a streak resets. ADHD-friendly forgiveness buffer.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
