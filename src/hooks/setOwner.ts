import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Automatically sets the `owner` field to the current authenticated user on creation.
 * Ensures users can only create documents owned by themselves.
 */
export const setOwner: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user) {
    data.owner = req.user.id
  }
  return data
}
