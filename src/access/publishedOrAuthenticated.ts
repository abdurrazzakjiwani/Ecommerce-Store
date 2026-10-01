import type { Access } from 'payload'

/**
 * Public read for published documents; signed-in users see everything,
 * including drafts.
 *
 * An anonymous request must NOT be able to distinguish a draft from a missing
 * document, or unpublished items could be enumerated by slug. Payload handles
 * that by returning nothing for a draft, which the storefront renders as a 404.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
