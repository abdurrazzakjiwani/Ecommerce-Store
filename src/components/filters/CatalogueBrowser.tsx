'use client'

import { RotateCcw, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ProductGrid } from '@/components/product/ProductGrid'
import { Badge } from '@/components/ui/Badge'
import { Input, Select, fieldA11y } from '@/components/ui/Field'
import type { Category } from '@/lib/types'
import {
  applyFilters,
  hasActiveFilters,
  priceBrackets,
  EMPTY_FILTERS,
  type FilterState,
} from '@/lib/filters'
import type { Product } from '@/lib/types'

/**
 * Client-side filtering and search.
 *
 * Runs entirely in the browser because the catalogue is small. Debounced at
 * 250ms so a fast typist does not trigger a re-filter on every keystroke, and the
 * result count is announced politely so a screen-reader user hears the catalogue
 * change.
 */
export function CatalogueBrowser({
  categories,
  categoryNames,
  initialCategoryIds,
  products,
}: {
  categories: Category[]
  categoryNames: Record<string, string>
  initialCategoryIds?: string[]
  products: Product[]
}) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    categoryIds: initialCategoryIds ?? [],
  }))
  const [rawQuery, setRawQuery] = useState('')

  /**
   * The typed value is debounced into the filter state by a timer, set up once
   * via the lazy initialiser rather than an effect that calls setState on every
   * keystroke, which would re-render twice per character.
   */
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    debounceRef.current = window.setTimeout(() => setDebouncedQuery(rawQuery), 250)

    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    }
  }, [rawQuery])

  const filtersWithQuery = useMemo(
    () => ({ ...filters, query: debouncedQuery }),
    [filters, debouncedQuery],
  )

  const visible = useMemo(
    () => applyFilters(products, filtersWithQuery),
    [products, filtersWithQuery],
  )
  const brackets = useMemo(() => priceBrackets(products), [products])
  const active = hasActiveFilters(filtersWithQuery)

  const toggleCategory = (id: string) =>
    setFilters((state) => ({
      ...state,
      categoryIds: state.categoryIds.includes(id)
        ? state.categoryIds.filter((value) => value !== id)
        : [...state.categoryIds, id],
    }))

  const reset = () => {
    setFilters(EMPTY_FILTERS)
    setRawQuery('')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Filters</h2>
            {active ? (
              <button
                className="inline-flex min-h-9 cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline"
                onClick={reset}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={13} />
                Clear all
              </button>
            ) : null}
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Category</legend>
            {categories.map((category) => (
              <label
                className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm"
                key={category.id}
              >
                <input
                  checked={filters.categoryIds.includes(category.id)}
                  className="size-4 cursor-pointer accent-[var(--color-accent)]"
                  onChange={() => toggleCategory(category.id)}
                  type="checkbox"
                />
                {category.title}
              </label>
            ))}
          </fieldset>

          {brackets.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="price-max">
                Maximum price
              </label>
              <Select
                {...fieldA11y('price-max')}
                id="price-max"
                onChange={(event) =>
                  setFilters((state) => ({
                    ...state,
                    priceMax: event.target.value === '' ? null : Number(event.target.value),
                  }))
                }
                value={filters.priceMax === null ? '' : String(filters.priceMax)}
              >
                <option value="">Any price</option>
                {brackets.map((value) => (
                  <option key={value} value={value}>
                    Up to {value.toLocaleString('en-PK')}
                  </option>
                ))}
              </Select>
              <p className="text-muted-fore text-xs">
                Items quoted on request are not shown against a price limit.
              </p>
            </div>
          ) : null}

          <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
            <input
              checked={filters.inStockOnly}
              className="size-4 cursor-pointer accent-[var(--color-accent)]"
              onChange={(event) =>
                setFilters((state) => ({ ...state, inStockOnly: event.target.checked }))
              }
              type="checkbox"
            />
            In stock only
          </label>
        </div>
      </aside>

      {/* Results */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="text-muted-fore pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              size={18}
            />
            <Input
              {...fieldA11y('search')}
              className="pl-10"
              id="search"
              onChange={(event) => setRawQuery(event.target.value)}
              placeholder="Search products, services or tags"
              type="search"
              value={rawQuery}
            />
          </div>

          <div aria-live="polite" className="flex items-center gap-3">
            <p className="text-muted-fore text-sm">
              {visible.length} of {products.length} item{products.length === 1 ? '' : 's'}
            </p>

            {filters.categoryIds.map((id) => {
              const category = categories.find((item) => item.id === id)
              if (!category) return null

              return (
                <button
                  className="cursor-pointer"
                  key={id}
                  onClick={() => toggleCategory(id)}
                  type="button"
                >
                  <Badge tone="accent">
                    {category.title}
                    <X aria-hidden="true" size={12} />
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        {visible.length > 0 ? (
          <ProductGrid categoryNames={categoryNames} products={visible} />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="font-display font-semibold">Nothing matches those filters</p>
            <p className="text-muted-fore max-w-sm text-sm">
              Try removing a filter or searching for a different term. If you cannot find
              what you need, ask us directly and we will tell you whether we can help.
            </p>
            <button
              className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-medium text-accent underline underline-offset-4"
              onClick={reset}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={14} />
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
