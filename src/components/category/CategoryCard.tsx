import Link from 'next/link'

import { cn } from '@/lib/cn'
import type { Category } from '@/lib/types'

/**
 * Category tile. Consistency changes only, and deliberately subordinate (FR-016).
 *
 * The category is a browsing affordance that sits above products, not a thing the
 * visitor is buying. Giving it the same visual weight as a product card would make an
 * individual product compete with its own navigation, so this shares the radii,
 * spacing and type of the other cards while staying quieter: no imagery, no hover
 * lift, a lighter border.
 *
 * That asymmetry is intentional and is the whole point of the requirement. Consistency
 * here means "part of the same design language", not "indistinguishable in weight".
 */
export function CategoryCard({
  category,
  className,
  productCount,
}: {
  category: Category
  className?: string
  productCount?: number
}) {
  return (
    <Link
      className={cn(
        'group flex flex-col justify-between gap-2 rounded-xl border border-border bg-surface p-4',
        'transition-colors hover:border-accent/40 hover:bg-muted/40',
        'motion-reduce:transition-none',
        className,
      )}
      href={`/products?category=${category.slug}`}
    >
      <div>
        <h3 className="font-display text-sm font-semibold leading-snug group-hover:text-accent">
          {category.title}
        </h3>

        {category.description ? (
          <p className="text-muted-fore line-clamp-2 mt-1 text-xs leading-relaxed">
            {category.description}
          </p>
        ) : null}
      </div>

      {typeof productCount === 'number' ? (
        <span className="text-muted-fore text-xs font-medium">
          {productCount} {productCount === 1 ? 'item' : 'items'}
        </span>
      ) : null}
    </Link>
  )
}
