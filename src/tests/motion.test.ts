import { afterEach, describe, expect, it, vi } from 'vitest'

import { onReducedMotionChange, prefersReducedMotion } from '../lib/motion'

/**
 * Reduced motion is an accessibility obligation (FR-017), not a preference.
 *
 * The gallery reads this through `useSyncExternalStore` rather than copying it into
 * state, which is why the subscribe path matters as much as the read path: the
 * preference must be known *before* the carousel's first tick, and must stay live if
 * the visitor changes it while the page is open.
 *
 * The server snapshot is `false`, so the first client render matches the server and
 * there is no hydration mismatch; React re-renders with the real value before the
 * carousel is permitted to start.
 */

type TestQuery = ReturnType<typeof createQuery>

function createQuery(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const query = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    dispatchEvent: () => false,
    /** Test affordance: simulate the OS setting changing. */
    __emit(next: boolean) {
      query.matches = next
      for (const listener of [...listeners]) {
        listener({ matches: next } as MediaQueryListEvent)
      }
    },
    __listenerCount: () => listeners.size,
  }

  return query as typeof query & MediaQueryList
}

const originalMatchMedia = window.matchMedia

function install(query: TestQuery | undefined) {
  if (query === undefined) {
    // @ts-expect-error - deliberately removing the API to test the fallback path
    window.matchMedia = undefined
    return
  }

  window.matchMedia = vi.fn().mockReturnValue(query) as unknown as typeof window.matchMedia
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
})

describe('prefersReducedMotion', () => {
  it('returns true when the visitor has asked for reduced motion', () => {
    install(createQuery(true))
    expect(prefersReducedMotion()).toBe(true)
  })

  it('returns false when reduced motion is not requested', () => {
    install(createQuery(false))
    expect(prefersReducedMotion()).toBe(false)
  })

  it('queries the correct media feature', () => {
    install(createQuery(false))
    prefersReducedMotion()
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('returns false when matchMedia is unavailable rather than throwing', () => {
    // Must not crash server-side, where window does not exist, and must not crash in
    // an old browser. Defaulting to false means motion plays, which is the ordinary
    // case; the accessibility path only engages when a visitor opts in.
    install(undefined)
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns false when window itself is absent, for server rendering', () => {
    const original = globalThis.window
    // @ts-expect-error - deliberately simulating a non-browser environment
    delete globalThis.window
    try {
      expect(prefersReducedMotion()).toBe(false)
    } finally {
      globalThis.window = original
    }
  })

  it('returns false when matchMedia throws, rather than propagating', () => {
    // A throwing media query must not be able to take the gallery down with it.
    window.matchMedia = vi.fn().mockImplementation(() => {
      throw new Error('matchMedia unavailable')
    }) as unknown as typeof window.matchMedia

    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('onReducedMotionChange', () => {
  it('reports preference changes to the subscriber', () => {
    // The gallery uses this to stop motion the moment a visitor opts in, rather than
    // only on the next page load.
    const query = createQuery(false)
    install(query)

    const seen: boolean[] = []
    onReducedMotionChange((reduced) => seen.push(reduced))

    query.__emit(true)
    query.__emit(false)

    expect(seen).toEqual([true, false])
  })

  it('returns an unsubscribe function that detaches the listener', () => {
    const query = createQuery(false)
    install(query)

    const seen: boolean[] = []
    const unsubscribe = onReducedMotionChange((reduced) => seen.push(reduced))
    expect(query.__listenerCount()).toBe(1)

    unsubscribe()
    expect(query.__listenerCount()).toBe(0)

    query.__emit(true)
    expect(seen).toEqual([])
  })

  it('is a safe no-op when matchMedia is unavailable', () => {
    install(undefined)
    const unsubscribe = onReducedMotionChange(() => {
      throw new Error('callback must not run when the API is missing')
    })
    expect(() => unsubscribe()).not.toThrow()
  })

  it('falls back to the deprecated listener API for older Safari', () => {
    // Safari below 14 has addListener/removeListener but not addEventListener.
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    const legacy = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: (l: (event: MediaQueryListEvent) => void) => {
        listeners.add(l)
      },
      removeListener: (l: (event: MediaQueryListEvent) => void) => {
        listeners.delete(l)
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList

    window.matchMedia = vi.fn().mockReturnValue(legacy) as unknown as typeof window.matchMedia

    const seen: boolean[] = []
    const unsubscribe = onReducedMotionChange((reduced) => seen.push(reduced))
    expect(listeners.size).toBe(1)

    for (const listener of [...listeners]) {
      listener({ matches: true } as MediaQueryListEvent)
    }
    expect(seen).toEqual([true])

    unsubscribe()
    expect(listeners.size).toBe(0)
  })
})
