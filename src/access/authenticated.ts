import type { Access } from 'payload'

/**
 * Requires a signed-in user. Used for every write in the project.
 *
 * Must be verified in BOTH directions before release: a rule confirmed only as
 * permissive has not been tested (constitution, Testing Discipline).
 */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
