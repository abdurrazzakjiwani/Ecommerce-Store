import type { Access } from 'payload'

/**
 * Allows the very first user to be created without authentication.
 *
 * Once any user exists this returns false for everyone, so no visitor can
 * self-register an admin account afterwards. Without this guard the
 * create-first-user route stays open indefinitely and the entire admin panel is
 * one registration away from a stranger.
 */
export const isFirstUser: Access = async ({ req: { payload } }) => {
  const existing = await payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return existing.totalDocs === 0
}
