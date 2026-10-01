'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@/lib/types'
import { ProductGallery } from './ProductGallery'
import { PriceTag } from './PriceTag'

/**
 * Catalogue card.
 *
 * The whole card links to the item, and the "add" control is a separate button
 * nested inside that link region. To avoid the button being swallowed by the
 * link, the link is not stretched over the card via a pseudo-element; instead the
 * title is the primary link and the card remains a clickable region via
 * `group-hover` styling on the title only. This keeps the DOM valid and keeps
 * keyboard focus predictable - one tab stop to the item, one to add.
 */
export function ProductCard({
  categoryName,
  product,
}: {
  categoryName: string
  product: Product
}) {
  const add = useCartStore((state) => state.add)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-200 hover:shadow-lg">
      <Link
        aria-label={`View ${product.title}`}
        className="block overflow-hidden"
        href={`/products/${product.slug}`}
      >
        <ProductGallery
          alt={product.title}
          className="rounded-none"
          images={product.images}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-fore truncate text-xs font-medium uppercase tracking-wide">
            {categoryName}
          </span>

          {product.inStock ? (
            <Badge tone="success">In stock</Badge>
          ) : (
            <Badge tone="muted">On request</Badge>
          )}
        </div>

        <h3 className="font-display font-semibold leading-snug">
          <Link
            className="transition-colors group-hover:text-accent"
            href={`/products/${product.slug}`}
          >
            {product.title}
          </Link>
        </h3>

        <p className="text-muted-fore line-clamp-2 text-sm leading-relaxed">{product.summary}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <PriceTag price={product.price} priceType={product.priceType} />

          <button
            aria-label={`Add ${product.title} to basket`}
            className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            onClick={() => add(product)}
            type="button"
          >
            <Plus aria-hidden="true" size={16} />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
