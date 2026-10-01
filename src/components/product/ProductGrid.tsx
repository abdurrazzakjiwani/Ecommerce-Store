import { cn } from '@/lib/cn'
import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

/**
 * Responsive catalogue grid: 1 column on phones, up to 3 on desktop.
 * No fixed pixel widths anywhere, so nothing can force horizontal scroll.
 */
export function ProductGrid({
  categoryNames,
  products,
}: {
  categoryNames: Record<string, string>
  products: Product[]
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          className="h-96 animate-pulse rounded-xl border border-border bg-muted"
          // Placeholder skeleton, not a list item: no meaningful ordering to expose.
          key={index}
        />
      ))}
    </div>
  )
}
