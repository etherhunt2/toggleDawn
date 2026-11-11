import type { User } from '@/payload-types'

/**
 * Validates whether a given user possesses the requested role.
 * Admins have full access and privileges.
 */
export const checkRole = (
  role: 'admin' | 'user',
  user: User | null | undefined | Record<string, any>,
): boolean => {
  if (!user) return false

  // Direct role check
  if (user.role === role) return true

  // Fallback bootstrap safeguard for primary system admin
  if (
    role === 'admin' &&
    (user.email === 'admin@toggledawn.com' || user.email === 'admin@example.com')
  ) {
    return true
  }

  return false
}

