/**
 * Catalogue filtering and search.
 *
 * Pure predicates, deliberately separated from any component, so the behaviour is
 * unit-testable. Runs client-side because the catalogue is small; the indexes in
 * the Payload schema exist so that moving to server-side faceting later does not
 * require a re-modelling exercise.
 */

import type { Product } from './types'

/** Fields a search term is matched against. Summary and tags are included because
 *  a visitor often searches for what a thing does rather than what it is called. */
export function matchesSearch(product: Product, query: string): boolean {
  const term = query.trim().toLowerCase()

  if (term === '') return true

  return (
    product.title.toLowerCase().includes(term) ||
    product.summary.toLowerCase().includes(term) ||
    product.tags.some((tag) => tag.toLowerCase().includes(term))
  )
}

export type FilterState = {
  categoryIds: string[]

  /** Max price, or null for no ceiling. Quote-priced items never match a ceiling. */
  priceMax: number | null

  inStockOnly: boolean

  query: string
}

export const EMPTY_FILTERS: FilterState = {
  categoryIds: [],
  inStockOnly: false,
  priceMax: null,
  query: '',
}

/**
 * A quote-priced item has no price, so it cannot satisfy a price ceiling.
 *
 * Treating it as zero would drag it into the cheapest price band and quietly
 * mislead a visitor comparing budgets. Excluding it is the honest behaviour.
 */
function matchesPrice(product: Product, priceMax: number | null): boolean {
  if (priceMax === null) return true
  if (product.price === null) return false

  return product.price <= priceMax
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    if (!matchesSearch(product, filters.query)) return false
    if (!matchesPrice(product, filters.priceMax)) return false

    if (filters.inStockOnly && !product.inStock) return false

    if (
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(product.categoryId)
    ) {
      return false
    }

    return true
  })
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.priceMax !== null ||
    filters.inStockOnly ||
    filters.categoryIds.length > 0
  )
}

/** Highest priced item, used to bound the price filter control. */
export function maxProductPrice(products: Product[]): number {
  return products.reduce((max, product) => {
    if (product.price === null) return max
    return Math.max(max, product.price)
  }, 0)
}

/** Prices a visitor can filter by, rounded to a readable step. */
export function priceBrackets(products: Product[]): number[] {
  const top = maxProductPrice(products)

  if (top <= 0) return []

  const step = top <= 50_000 ? 10_000 : top <= 300_000 ? 50_000 : 100_000
  const brackets: number[] = []

  for (let value = step; value < top; value += step) {
    brackets.push(value)
  }

  brackets.push(top)

  return brackets
}
