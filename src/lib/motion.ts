/**
 * Reduced-motion preference.
 *
 * WCAG 2.2.2 requires that any automatically moving content can be paused, and this
 * project goes further: when a visitor has asked their device to reduce motion, the
 * image carousel must never begin at all (FR-017). Not "begin and then stop" - never
 * begin. The gallery therefore creates the carousel with `playOnInit: false` and calls
 * this before deciding whether to start.
 *
 * Defaults to `false` when the API is unavailable, which is the ordinary case: motion
 * plays unless a visitor has explicitly opted out.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Whether the visitor's device has requested reduced motion.
 *
 * Safe to call during server rendering and in browsers without `matchMedia`.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  } catch {
    // A throwing matchMedia is treated as "no preference" rather than allowed to take
    // the gallery down with it.
    return false
  }
}

/**
 * Subscribes to changes in the preference, so a visitor who enables reduced motion
 * while the page is open stops seeing motion immediately.
 *
 * @returns an unsubscribe function. Safe to call when subscriptions are unsupported.
 */
export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }

  let query: MediaQueryList
  try {
    query = window.matchMedia(REDUCED_MOTION_QUERY)
  } catch {
    return () => {}
  }

  const handler = (event: MediaQueryListEvent) => callback(event.matches)

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }

  // Safari below 14 only has the deprecated listener API.
  if (typeof query.addListener === 'function') {
    query.addListener(handler)
    return () => query.removeListener(handler)
  }

  return () => {}
}
