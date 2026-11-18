import type { Access, FieldAccess } from 'payload'
import { checkRole } from './checkRole'

/**
 * Admin-only access control for collections.
 * Only users with the 'admin' role can read/write this document.
 */
export const adminOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  return checkRole('admin', user)
}

/**
 * Admin-only access control for individual fields.
 */
export const adminOnlyField: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return checkRole('admin', user)
}

/**
 * Authenticated access control for individual fields.
 */
export const authenticatedField: FieldAccess = ({ req: { user } }) => {
  return Boolean(user)
}
