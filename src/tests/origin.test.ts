import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { assertUsableOrigin, productionOrigin, resolveOrigin } from '../lib/origin'

/**
 * The origin guard (FR-035, FR-036, SC-012).
 *
 * A live defect was found in feature 002: the deployed site advertised `localhost` in
 * its own robots.txt and sitemap.xml, because NEXT_PUBLIC_SERVER_URL was not set on the
 * Vercel project and both routes fell back to localhost. The old domain had been deleted
 * and returned 404, so crawlers were pointed at a dead page.
 *
 * The important property is not that the guard exists, but that it makes a BAD BUILD
 * rather than a warning. A build that publishes a wrong address succeeds and the
 * mistake is invisible; a build that fails is noticed.
 *
 * The guard reads NODE_ENV at module load, so each case re-imports the module with
 * `vi.resetModules()` rather than mutating an exported constant.
 */

const ORIGINAL_ENV = { ...process.env }

function setEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

async function loadModule(nodeEnv: string) {
  vi.resetModules()
  setEnv({ NODE_ENV: nodeEnv })
  return import('../lib/origin')
}

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.resetModules()
})

describe('resolveOrigin', () => {
  it('uses NEXT_PUBLIC_SERVER_URL when set', async () => {
    const { resolveOrigin: resolve } = await loadModule('development')
    setEnv({ NEXT_PUBLIC_SERVER_URL: 'https://yourecommercestore.vercel.app' })

    expect(resolve()).toBe('https://yourecommercestore.vercel.app')
  })

  it('strips a trailing slash so no URL ends in a double slash', async () => {
    const { resolveOrigin: resolve } = await loadModule('development')
    setEnv({ NEXT_PUBLIC_SERVER_URL: 'https://yourecommercestore.vercel.app/' })

    expect(resolve()).toBe('https://yourecommercestore.vercel.app')
  })

  it('trims surrounding whitespace', async () => {
    const { resolveOrigin: resolve } = await loadModule('development')
    setEnv({ NEXT_PUBLIC_SERVER_URL: '  https://yourecommercestore.vercel.app  ' })

    expect(resolve()).toBe('https://yourecommercestore.vercel.app')
  })

  it('falls back to localhost when the variable is unset', async () => {
    // Correct for local development. The production assert is what catches it
    // becoming a deployed value.
    const { resolveOrigin: resolve } = await loadModule('development')
    setEnv({ NEXT_PUBLIC_SERVER_URL: undefined })

    expect(resolve()).toBe('http://localhost:3000')
  })
})

describe('assertUsableOrigin in production', () => {
  const production = 'production'

  it('accepts the real production domain', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(() => assert('https://yourecommercestore.vercel.app')).not.toThrow()
  })

  it('REJECTS localhost, which is the defect that shipped', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(() => assert('http://localhost:3000')).toThrow(/advertise/i)
  })

  it('rejects 127.0.0.1', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(() => assert('http://127.0.0.1:3000')).toThrow()
  })

  it('rejects the deleted Vercel domain, which returns 404', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(() => assert('https://ecommerce-storefront-phi.vercel.app')).toThrow()
  })

  it('rejects a value that is not an absolute URL', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(() => assert('yourecommercestore.vercel.app')).toThrow(/absolute URL/i)
  })

  it('names the variable to set, so the failure is actionable', async () => {
    // A build error that does not say what to do produces a ticket instead of a fix.
    const { assertUsableOrigin: assert } = await loadModule(production)
    try {
      assert('http://localhost:3000')
      expect.unreachable('should have thrown')
    } catch (error) {
      expect(String(error)).toContain('NEXT_PUBLIC_SERVER_URL')
    }
  })

  it('matches the host case-insensitively', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(() => assert('http://LOCALHOST:3000')).toThrow()
  })

  it('returns the origin so it can be called inline', async () => {
    const { assertUsableOrigin: assert } = await loadModule(production)
    expect(assert('https://yourecommercestore.vercel.app')).toBe(
      'https://yourecommercestore.vercel.app',
    )
  })
})

describe('assertUsableOrigin outside production', () => {
  it('does not throw in development, so the guard can stay enabled', async () => {
    // A guard that fires locally would be switched off, and then it would not be there
    // for the deployment it exists to catch.
    const { assertUsableOrigin: assert } = await loadModule('development')
    expect(() => assert('http://localhost:3000')).not.toThrow()
  })

  it('does not throw in test', async () => {
    const { assertUsableOrigin: assert } = await loadModule('test')
    expect(() => assert('http://localhost:3000')).not.toThrow()
  })
})

describe('productionOrigin', () => {
  it('resolves and asserts in one call', async () => {
    const { productionOrigin: origin } = await loadModule('production')
    setEnv({ NEXT_PUBLIC_SERVER_URL: 'https://yourecommercestore.vercel.app' })

    expect(origin()).toBe('https://yourecommercestore.vercel.app')
  })

  it('throws in production when the variable is unset', async () => {
    // This is the exact production state that shipped the defect.
    const { productionOrigin: origin } = await loadModule('production')
    setEnv({ NEXT_PUBLIC_SERVER_URL: undefined })

    expect(() => origin()).toThrow()
  })
})

describe('statically imported helpers', () => {
  it('exposes the three functions the metadata routes use', () => {
    expect(typeof resolveOrigin).toBe('function')
    expect(typeof assertUsableOrigin).toBe('function')
    expect(typeof productionOrigin).toBe('function')
  })
})
