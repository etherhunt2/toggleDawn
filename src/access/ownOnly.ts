import type { Access } from 'payload'
import { checkRole } from './checkRole'

/**
 * Row-level access control: only allow users to access their own documents.
 * Administrators have full access across all documents in admin panel & API.
 */
export const ownOnly: Access = ({ req: { user } }) => {
  if (!user) return false

  // Administrators have global access to all records
  if (checkRole('admin', user)) {
    return true
  }

  return {
    owner: {
      equals: user.id,
    },
  }
}
