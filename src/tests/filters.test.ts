import { describe, expect, it } from 'vitest'

import { PROVINCES, normalisePakistaniPhone } from '../lib/address'
import {
  applyFilters,
  hasActiveFilters,
  matchesSearch,
  maxProductPrice,
  priceBrackets,
  EMPTY_FILTERS,
} from '../lib/filters'
import type { Product } from '../lib/types'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    categoryId: 'cat-a',
    currency: 'PKR',
    description: 'A long description of the item.',
    featured: false,
    id: 'p1',
    images: ['/a.svg'],
    inStock: true,
    price: 1000,
    priceType: 'fixed',
    relatedSlugs: [],
    slug: 'item-one',
    specs: [],
    summary: 'A short summary of the item.',
    tags: ['alpha'],
    title: 'Item One',
    ...overrides,
  }
}

describe('PROVINCES', () => {
  it('has exactly seven top-level units', () => {
    // Verified against the Pakistan Post delivery directory.
    expect(PROVINCES).toHaveLength(7)
  })

  it('includes the northern territories and the federal capital', () => {
    // These are the ones most commonly dropped from a hand-written list, which is
    // precisely why the count and membership are asserted.
    expect(PROVINCES).toContain('Gilgit-Baltistan')
    expect(PROVINCES).toContain('Islamabad Capital Territory')
    expect(PROVINCES).toContain('Azad Jammu & Kashmir')
  })

  it('contains no duplicates', () => {
    expect(new Set(PROVINCES).size).toBe(PROVINCES.length)
  })
})

describe('normalisePakistaniPhone', () => {
  it('normalises the shapes people actually type to the local form', () => {
    expect(normalisePakistaniPhone('03001234567')).toBe('03001234567')
    expect(normalisePakistaniPhone('+923001234567')).toBe('03001234567')
    expect(normalisePakistaniPhone('00923001234567')).toBe('03001234567')
    expect(normalisePakistaniPhone('0300 1234567')).toBe('03001234567')
  })
})

describe('matchesSearch', () => {
  const product = makeProduct({
    summary: 'Dependable business notebook with all-day battery.',
    tags: ['laptop', 'hardware'],
    title: 'Business Laptop 14',
  })

  it('matches on title, summary and tags, case-insensitively', () => {
    expect(matchesSearch(product, 'LAPTOP')).toBe(true)
    expect(matchesSearch(product, 'battery')).toBe(true)
    expect(matchesSearch(product, 'hardware')).toBe(true)
  })

  it('returns true for an empty query so no search means no restriction', () => {
    expect(matchesSearch(product, '')).toBe(true)
    expect(matchesSearch(product, '   ')).toBe(true)
  })

  it('rejects a non-match', () => {
    expect(matchesSearch(product, 'submarine')).toBe(false)
  })
})

describe('applyFilters', () => {
  const priced = makeProduct({ id: 'p1', price: 1000, title: 'Cheap' })
  const dear = makeProduct({ id: 'p2', price: 500_000, title: 'Expensive' })
  const quoted = makeProduct({
    id: 'p3',
    price: null,
    priceType: 'quote',
    title: 'Service',
  })
  const outOfStock = makeProduct({ id: 'p4', inStock: false, title: 'Gone' })
  const all = [priced, dear, quoted, outOfStock]

  it('returns everything with empty filters', () => {
    expect(applyFilters(all, EMPTY_FILTERS)).toHaveLength(4)
  })

  it('excludes quote-priced items from a price ceiling rather than treating them as zero', () => {
    // Treating a quote as zero would drag services into the cheapest band and
    // mislead anyone comparing budgets.
    const result = applyFilters(all, { ...EMPTY_FILTERS, priceMax: 2000 })

    expect(result).not.toContainEqual(quoted)
    // Both priced items at 1,000 qualify regardless of availability, because
    // availability is not part of this filter.
    expect(result.map((product) => product.id)).toEqual(['p1', 'p4'])
  })

  it('includes quote-priced items when there is no ceiling', () => {
    const result = applyFilters(all, EMPTY_FILTERS)
    expect(result).toContainEqual(quoted)
  })

  it('filters by availability', () => {
    const result = applyFilters(all, { ...EMPTY_FILTERS, inStockOnly: true })
    expect(result.map((product) => product.id)).not.toContain('p4')
  })

  it('filters by category', () => {
    const inA = applyFilters(all, { ...EMPTY_FILTERS, categoryIds: ['cat-a'] })
    expect(inA).toHaveLength(4)

    const inB = applyFilters(all, { ...EMPTY_FILTERS, categoryIds: ['cat-b'] })
    expect(inB).toHaveLength(0)
  })

  it('combines filters conjunctively', () => {
    const result = applyFilters(all, {
      categoryIds: ['cat-a'],
      inStockOnly: true,
      priceMax: 100_000,
      query: 'cheap',
    })

    expect(result.map((product) => product.id)).toEqual(['p1'])
  })
})

describe('hasActiveFilters', () => {
  it('detects each filter independently', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: 'x' })).toBe(true)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, priceMax: 100 })).toBe(true)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, inStockOnly: true })).toBe(true)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, categoryIds: ['a'] })).toBe(true)
  })

  it('ignores whitespace-only search', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '   ' })).toBe(false)
  })
})

describe('price helpers', () => {
  it('ignores quote-priced items when finding the maximum', () => {
    const max = maxProductPrice([
      makeProduct({ price: 1000 }),
      makeProduct({ price: null, priceType: 'quote' }),
    ])

    expect(max).toBe(1000)
  })

  it('produces ascending brackets ending at the top price', () => {
    const brackets = priceBrackets([
      makeProduct({ price: 10_000 }),
      makeProduct({ price: 90_000 }),
    ])

    expect(brackets.length).toBeGreaterThan(0)
    expect(brackets[brackets.length - 1]).toBe(90_000)
    expect([...brackets].sort((a, b) => a - b)).toEqual(brackets)
  })

  it('returns no brackets when nothing is priced', () => {
    expect(priceBrackets([makeProduct({ price: null, priceType: 'quote' })])).toEqual([])
  })
})
