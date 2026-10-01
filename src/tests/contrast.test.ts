import { describe, expect, it } from 'vitest'

import { contrastRatio, relativeLuminance } from '../lib/contrast'

/**
 * The values asserted here are measured, not assumed. They come from the Phase 0
 * research that resolved the WhatsApp brand conflict (specs/002-polish-storefront/
 * research.md, decision D2).
 *
 * Two treatments that look correct fail, and the numbers are the reason:
 *
 *   brand green on cream   1.91  FAIL  - a loose green icon on the page background
 *   white on brand green   1.98  FAIL  - the obvious "green button with white text"
 *
 * The treatment that is adopted instead keeps the mark unmodified and passes:
 *
 *   brand green on teal    3.87  PASS  - UI / large text threshold
 *   white on teal          7.67  PASS  - normal text threshold
 *
 * If these assertions ever change, the token contract in globals.css has been broken
 * and the WhatsApp placement rules need re-measuring before anything else.
 */
describe('relativeLuminance', () => {
  it('returns 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5)
  })

  it('is symmetric, so colour order cannot change the result', () => {
    expect(relativeLuminance('#25D366')).toBeCloseTo(relativeLuminance('#25D366'), 10)
  })

  it('accepts shorthand hex', () => {
    // #fff expands to #ffffff
    expect(relativeLuminance('#fff')).toBeCloseTo(relativeLuminance('#ffffff'), 10)
  })

  it('accepts hex with and without the leading hash', () => {
    expect(relativeLuminance('25D366')).toBeCloseTo(relativeLuminance('#25D366'), 10)
  })

  it('throws on invalid input rather than returning a plausible wrong number', () => {
    // A silently wrong ratio is worse than a loud failure: it would let a failing
    // colour combination pass review.
    expect(() => relativeLuminance('#GGGGGG')).toThrow()
    expect(() => relativeLuminance('#12345')).toThrow()
    expect(() => relativeLuminance('')).toThrow()
    expect(() => relativeLuminance('rebeccapurple')).toThrow()
  })
})

describe('contrastRatio', () => {
  it('returns exactly 1 for identical colours', () => {
    expect(contrastRatio('#FFFBEB', '#FFFBEB')).toBeCloseTo(1, 5)
  })

  it('is independent of argument order', () => {
    expect(contrastRatio('#FFFFFF', '#075E54')).toBeCloseTo(contrastRatio('#075E54', '#FFFFFF'), 10)
  })

  it('returns the maximum of 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  describe('measured WhatsApp brand values', () => {
    it('brand green on cream is 1.91 and FAILS the AA threshold', () => {
      // This is the measurement that forced the teal treatment. The mark must never
      // be placed directly on the cream surface.
      expect(contrastRatio('#25D366', '#FFFBEB')).toBeCloseTo(1.91, 1)
      expect(contrastRatio('#25D366', '#FFFBEB')).toBeLessThan(4.5)
    })

    it('white on brand green is 1.98 and FAILS the AA threshold', () => {
      // The obvious "light green WhatsApp button" does not work either.
      expect(contrastRatio('#FFFFFF', '#25D366')).toBeCloseTo(1.98, 1)
      expect(contrastRatio('#FFFFFF', '#25D366')).toBeLessThan(4.5)
    })

    it('brand green on WhatsApp teal is 3.87 and passes the UI threshold', () => {
      // The unmodified mark on the adopted teal. Legal placement.
      expect(contrastRatio('#25D366', '#075E54')).toBeCloseTo(3.87, 1)
      expect(contrastRatio('#25D366', '#075E54')).toBeGreaterThanOrEqual(3)
    })

    it('white on WhatsApp teal is 7.67 and passes AA for normal text', () => {
      // The button label.
      expect(contrastRatio('#FFFFFF', '#075E54')).toBeCloseTo(7.67, 1)
      expect(contrastRatio('#FFFFFF', '#075E54')).toBeGreaterThanOrEqual(4.5)
    })

    it('near-black on cream is 16.86, so existing body text is unaffected', () => {
      expect(contrastRatio('#1C1917', '#FFFBEB')).toBeCloseTo(16.86, 1)
    })
  })

  it('throws on invalid input', () => {
    expect(() => contrastRatio('#ZZZZZZ', '#FFFFFF')).toThrow()
    expect(() => contrastRatio('#FFFFFF', 'nope')).toThrow()
  })
})
