/**
 * Resolves the origin this site should advertise for itself, and refuses to build if
 * that answer would be wrong in production.
 *
 * WHY THIS EXISTS
 * ---------------
 * A live defect was found during feature 002: the deployed site advertised
 * `localhost` in its own `robots.txt` and `sitemap.xml`, while the old Vercel domain had
 * been deleted and returned 404. Search engines were being sent to an address that
 * could not serve them, which costs credibility invisibly.
 *
 * The root cause is NOT a hardcoded string. Both metadata routes correctly read
 * `NEXT_PUBLIC_SERVER_URL` with a localhost fallback - the variable simply was not set
 * on the Vercel project, so the fallback was used in production.
 *
 * A GREEN BUILD IS NOT EVIDENCE
 * -----------------------------
 * The build passed while emitting unusable addresses, so a build-time check is the
 * only place this can be caught before deployment. `assertUsableOrigin` throws rather
 * than warning: a site that publishes the wrong address is worse than a build that
 * fails, because a failed build is noticed and a wrong address is not.
 *
 * The guard fires only for production builds. Local development legitimately runs on
 * localhost, and failing there would make the guard useless by making it impossible to
 * keep switched on.
 */

const PRODUCTION_GUARD_ENABLED = process.env.NODE_ENV === 'production'

/** Hosts that must never be advertised by a production build. */
const FORBIDDEN_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  // Deleted. It returned 404 after the domain change, so advertising it sends crawlers
  // to a dead page - the exact defect this module prevents.
  'ecommerce-storefront-phi.vercel.app',
])

export function resolveOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const trimmed = raw.trim().replace(/\/$/, '')

  if (trimmed) {
    return trimmed
  }

  // No value supplied. In production that is the bug, and the assert below turns it
  // into a failed build rather than a silently wrong sitemap.
  return 'http://localhost:3000'
}

/**
 * Throws in a production build when the resolved origin is not a real public address.
 *
 * @returns the origin, so it can be called inline.
 */
export function assertUsableOrigin(origin: string): string {
  if (!PRODUCTION_GUARD_ENABLED) {
    return origin
  }

  let host: string
  try {
    host = new URL(origin).hostname.toLowerCase()
  } catch {
    throw new Error(
      `[metadata] NEXT_PUBLIC_SERVER_URL is not a valid absolute URL: "${origin}". ` +
        'Set it to the production origin, for example ' +
        'https://yourecommercestore.vercel.app, before building for production.',
    )
  }

  if (FORBIDDEN_HOSTS.has(host)) {
    throw new Error(
      `[metadata] Refusing to build: the site would advertise "${host}" as its own ` +
        'address. Set NEXT_PUBLIC_SERVER_URL to the production domain before deploying. ' +
        'A build that publishes a wrong address is not detectable after the fact, so it ' +
        'fails here instead.',
    )
  }

  return origin
}

/** Convenience: resolve and assert in one call. */
export function productionOrigin(): string {
  return assertUsableOrigin(resolveOrigin())
}
