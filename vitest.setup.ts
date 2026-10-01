import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Global test setup.
 *
 * Registers the jest-dom matchers so component tests can assert on presence and
 * visibility directly, and unmounts between tests so a leftover DOM tree cannot make
 * the next test pass for the wrong reason.
 *
 * The `matchMedia` stub matters for the carousel specifically. jsdom does not
 * implement it, so `lib/motion` returns false and reduced motion stays off - which is
 * the ordinary case. Tests that need the preference on install their own stub and
 * restore it; see `src/tests/motion.test.ts`.
 */
/**
 * jsdom does not implement `window.matchMedia`, and `embla-carousel` calls
 * `matchMedia(...).addEventListener` while activating a carousel. Without this stub
 * any component test that mounts a gallery throws `undefined is not a function`
 * before it can assert anything.
 *
 * Default reports no reduced-motion preference, which is the ordinary case. Tests
 * that need it enabled install their own stub and restore it afterwards - see
 * `src/tests/motion.test.ts` and `src/tests/cycling.test.ts`.
 */
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

/**
 * `IntersectionObserver` is also absent from jsdom. `embla-carousel` uses it for
 * `slidesInView` and for lazy-loading decisions, so a gallery cannot mount without a
 * stub. The observer never fires: tests drive slide changes through the API, not by
 * simulating scrolling, and a firing observer would introduce timing-dependent
 * assertions.
 */
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class NoopIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds: ReadonlyArray<number> = [0]

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  globalThis.IntersectionObserver = NoopIntersectionObserver
}

/**
 * `ResizeObserver` is the third browser API `embla-carousel` requires and jsdom lacks.
 * It is how the carousel recalculates slide positions on layout change. The stub
 * deliberately never fires a callback: tests assert on rendered structure and on
 * behaviour driven through the API, and a resize storm would make assertions
 * timing-dependent.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  class NoopResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = NoopResizeObserver
}

afterEach(() => {
  cleanup()
})
