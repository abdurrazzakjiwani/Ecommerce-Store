import { describe, expect, it } from 'vitest'

import { formatLineTotal, formatPKR, summariseBasket } from '../lib/currency'

describe('formatPKR', () => {
  it('prefixes with Rs and groups thousands', () => {
    expect(formatPKR(185000)).toBe('Rs 185,000')
  })

  it('handles zero', () => {
    expect(formatPKR(0)).toBe('Rs 0')
  })

  it('handles negative amounts without producing malformed output', () => {
    expect(formatPKR(-500)).toBe('Rs -500')
  })

  it('rounds paisa to the nearest rupee rather than displaying them', () => {
    // Rounding, not truncation. Truncating would understate a price, so
    // 185000.6 rounding up to 185,001 is the intended behaviour.
    expect(formatPKR(185000.4)).toBe('Rs 185,000')
    expect(formatPKR(185000.6)).toBe('Rs 185,001')
  })

  it('handles values below one thousand without a separator', () => {
    expect(formatPKR(999)).toBe('Rs 999')
  })

  it('returns a usable string for NaN instead of "Rs NaN"', () => {
    expect(formatPKR(Number.NaN)).toBe('Rs 0')
  })

  it('returns a usable string for Infinity', () => {
    expect(formatPKR(Number.POSITIVE_INFINITY)).toBe('Rs 0')
  })

  it('handles very large values', () => {
    expect(formatPKR(123456789)).toBe('Rs 123,456,789')
  })
})

describe('formatLineTotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(formatLineTotal(2, 185000)).toBe('Rs 370,000')
  })

  it('returns zero for a zero quantity', () => {
    expect(formatLineTotal(0, 185000)).toBe('Rs 0')
  })

  it('does not throw when the unit price is non-finite', () => {
    expect(formatLineTotal(2, Number.NaN)).toBe('Rs 0')
  })
})

describe('summariseBasket', () => {
  it('sums only priced lines and flags quote lines', () => {
    const result = summariseBasket([
      { qty: 2, unitPrice: 185000 },
      { qty: 1, unitPrice: null },
      { qty: 3, unitPrice: 5000 },
    ])

    expect(result.subtotal).toBe(385000)
    expect(result.quoteCount).toBe(1)
    expect(result.hasQuoteItems).toBe(true)
  })

  it('reports no quote items when every line is priced', () => {
    const result = summariseBasket([{ qty: 1, unitPrice: 1000 }])

    expect(result.subtotal).toBe(1000)
    expect(result.quoteCount).toBe(0)
    expect(result.hasQuoteItems).toBe(false)
  })

  it('returns a zero subtotal for a basket of only quote items', () => {
    // Spec FR-016: with every line awaiting a quotation there is no total to
    // claim, so the subtotal must be zero and the caller must label it.
    const result = summariseBasket([
      { qty: 2, unitPrice: null },
      { qty: 1, unitPrice: null },
    ])

    expect(result.subtotal).toBe(0)
    expect(result.quoteCount).toBe(2)
    expect(result.hasQuoteItems).toBe(true)
  })

  it('treats a non-finite unit price as a quote line rather than adding NaN', () => {
    const result = summariseBasket([{ qty: 1, unitPrice: Number.NaN }])

    expect(result.subtotal).toBe(0)
    expect(result.quoteCount).toBe(1)
  })

  it('handles an empty basket', () => {
    const result = summariseBasket([])

    expect(result.subtotal).toBe(0)
    expect(result.hasQuoteItems).toBe(false)
  })
})
