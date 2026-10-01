import { formatPKR } from '@/lib/currency'
import { cn } from '@/lib/cn'

/**
 * Renders a product's price according to its `priceType`.
 *
 * `quote` deliberately shows no number. Spec FR-016 and the collection hook both
 * treat a quote-priced item as having no price, so the card must never imply one.
 */
export function PriceTag({
  className,
  price,
  priceType,
}: {
  className?: string
  price: number | null
  priceType: 'fixed' | 'from' | 'quote'
}) {
  if (priceType === 'quote' || price === null) {
    return (
      <p className={cn('font-display text-base font-semibold text-accent', className)}>
        Request a quote
      </p>
    )
  }

  return (
    <p className={cn('font-display text-base font-semibold', className)}>
      {priceType === 'from' ? <span className="text-muted-fore text-sm font-normal">From </span> : null}
      {formatPKR(price)}
      {priceType === 'from' ? (
        <span className="text-muted-fore ml-1.5 text-xs font-normal">
          (indicative, confirmed on quote)
        </span>
      ) : null}
    </p>
  )
}
