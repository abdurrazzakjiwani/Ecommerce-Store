'use client'

import { Check, MessageCircle, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button, ButtonExternal } from '@/components/ui/Button'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'
import { useCartStore } from '@/lib/cart-store'
import { formatPKR } from '@/lib/currency'
import type { Product } from '@/lib/types'
import { buildProductEnquiryMessage, buildWaLink } from '@/lib/whatsapp'

/**
 * Purchase panel: quantity, add to basket, and enquire on WhatsApp.
 *
 * Shows a confirmation state after adding rather than silently doing nothing, so
 * a screen-reader user and a sighted user both know the tap registered.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const settings = useSiteSettings()
  const add = useCartStore((state) => state.add)

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const priced = product.priceType !== 'quote' && product.price !== null

  const message = buildProductEnquiryMessage(product, settings.businessName)
  const waHref = buildWaLink(settings.whatsappNumber, message)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        {product.priceType === 'quote' || product.price === null ? (
          <p className="font-display text-xl font-semibold text-accent">Request a quote</p>
        ) : (
          <p className="font-display text-2xl font-semibold">
            {product.priceType === 'from' ? (
              <span className="text-muted-fore text-base font-normal">From </span>
            ) : null}
            {formatPKR(product.price)}
          </p>
        )}

        {product.inStock ? (
          <Badge tone="success">
            <Check aria-hidden="true" size={12} />
            In stock
          </Badge>
        ) : (
          <Badge tone="muted">Available on request</Badge>
        )}
      </div>

      {priced ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-1">
            <button
              aria-label="Reduce quantity"
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:opacity-50"
              disabled={qty <= 1}
              onClick={() => setQty((value) => Math.max(1, value - 1))}
              type="button"
            >
              &minus;
            </button>
            <span aria-live="polite" className="w-10 text-center font-medium tabular-nums">
              {qty}
            </span>
            <button
              aria-label="Increase quantity"
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
              onClick={() => setQty((value) => Math.min(999, value + 1))}
              type="button"
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => {
            add(product, qty)
            setAdded(true)
            window.setTimeout(() => setAdded(false), 2500)
          }}
          size="lg"
        >
          <ShoppingBag aria-hidden="true" size={18} />
          {added ? 'Added to basket' : 'Add to basket'}
        </Button>

        <ButtonExternal href={waHref} size="lg" variant="secondary">
          <MessageCircle aria-hidden="true" size={18} />
          Enquire on WhatsApp
        </ButtonExternal>

        <p aria-live="polite" className="sr-only">
          {added ? `${product.title} added to basket` : ''}
        </p>
      </div>

      <p className="text-muted-fore text-xs leading-relaxed">
        No payment is taken on this site. Adding to your basket creates a list you can send
        to us on WhatsApp, where we confirm stock and a final price.
      </p>
    </div>
  )
}
