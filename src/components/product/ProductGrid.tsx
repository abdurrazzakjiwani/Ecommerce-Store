import { cn } from '@/lib/cn'
import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

/**
 * Responsive catalogue grid: 1 column on phones, up to 3 on desktop.
 * No fixed pixel widths anywhere, so nothing can force horizontal scroll.
 *
 * Card heights are equalised per row with `items-stretch` and each card fills its
 * grid cell, so a row of cards with different title lengths still presents a flat
 * bottom edge. Without this, a two-line title beside a one-line title leaves the
 * price and add button sitting at different heights, which is the "unfinished"
 * impression FR-010 exists to remove.
 *
 * `content-start` is deliberately NOT used: a short final row should not stretch its
 * cards to the height of a full one.
 */
export function ProductGrid({
  categoryNames,
  products,
}: {
  categoryNames: Record<string, string>
  products: Product[]
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          categoryName={categoryNames[product.categoryId] ?? ''}
          key={product.id}
          product={product}
        />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="h-96 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none"
          // Placeholder skeleton, not a list item: no meaningful ordering to expose.
          key={index}
        />
      ))}
    </div>
  )
}
