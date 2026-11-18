import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Automatically sets the `owner` field to the current authenticated user on creation.
 * Ensures users can only create documents owned by themselves.
 */
export const setOwner: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (req.user) {
    if (operation === 'create' || !data.owner) {
      data.owner = req.user.id
    }
  }
  return data
}
