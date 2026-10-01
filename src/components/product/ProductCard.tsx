'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@/lib/types'
import { ProductGallery } from './ProductGallery'
import { PriceTag } from './PriceTag'

/**
 * Catalogue card. Element order is fixed by FR-008 and must not be rearranged:
 *
 *   imagery, category, availability, name, summary, price-or-quote, add action
 *
 * A visitor comparing items scans that order top to bottom, so a card that moves its
 * price above the name, or drops the category because it ran out of room, breaks the
 * comparison the card exists to support.
 *
 * LINK AND BUTTON SEPARATION (FR-013)
 * ------------------------------------
 * The whole card is clickable, but the "add" control is a real `<button>` that is NOT
 * nested inside the card's anchor. A button inside an anchor is invalid HTML and
 * behaves unpredictably: activating it can follow the link, so a visitor trying to add
 * an item navigates away instead. The card is made clickable with a stretched
 * pseudo-element on the title link, which keeps the DOM valid and keeps focus order
 * predictable - one tab stop to the item, one to add.
 *
 * IMAGERY NEVER CYCLES HERE (FR-015)
 * ----------------------------------
 * `ProductGallery` defaults `autoPlay` to false and this card does not opt in. With
 * ~24 products a catalogue page would otherwise mount 24 concurrent carousels, which
 * means 24 timers, 24 live-region announcements on a loop, and 24 pause controls
 * needed to satisfy WCAG 2.2.2.
 *
 * CLS (FR-024): the image area carries a fixed aspect ratio, so the box is reserved
 * before any image loads and cards do not reflow as they arrive.
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
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/*
        Imagery. The link wraps the reserved box so the whole image area is clickable,
        and the aspect ratio holds the layout steady before load.
      */}
      <Link
        aria-label={`View ${product.title}`}
        // The aspect ratio sits on this wrapper, not only on the image, so the box is
        // reserved from first paint. Putting it on the <img> alone leaves the
        // container at zero height until the file arrives, which is the reflow that
        // FR-024 and the CLS budget exist to prevent.
        className="relative block aspect-4/5 overflow-hidden"
        data-card-part="imagery"
        href={`/products/${product.slug}`}
      >
        <ProductGallery
          alt={product.title}
          className="rounded-none"
          images={product.images}
          showControls={product.images.length > 1}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4" data-card-part="body">
        <div className="flex items-start justify-between gap-2">
          <span className="text-muted-fore truncate text-xs font-medium tracking-wide uppercase">
            {categoryName}
          </span>

          {product.inStock ? (
            <Badge tone="success">In stock</Badge>
          ) : (
            <Badge tone="muted">On request</Badge>
          )}
        </div>

        {/*
          Clamped to two lines. `line-clamp` also fixes the minimum height, so a card
          with a short title and a card with a long one stay the same height and the
          grid rows align (FR-010).
        */}
        <h3 className="font-display text-base font-semibold leading-snug">
          <Link
            className="line-clamp-2 transition-colors after:absolute after:inset-0 group-hover:text-accent"
            href={`/products/${product.slug}`}
          >
            {product.title}
          </Link>
        </h3>

        <p className="text-muted-fore line-clamp-2 text-sm leading-relaxed">{product.summary}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          {/*
            Renders nothing at all for a quote-status item rather than a placeholder
            figure, so no price number appears anywhere on the card (FR-011).
          */}
          <PriceTag price={product.price} priceType={product.priceType} />

          <button
            aria-label={`Add ${product.title} to basket`}
            // Relative positioning lifts this above the stretched title link, so
            // clicking add never triggers navigation.
            className="relative z-10 flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
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
