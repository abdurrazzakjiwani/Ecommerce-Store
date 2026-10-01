'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'

import { formatPKR } from '@/lib/currency'
import { priceTypeAllowsTotal, useCartStore } from '@/lib/cart-store'
import { ProductImage } from '@/components/product/ProductImage'

export function CartLine({ slug }: { slug: string }) {
  const item = useCartStore((state) => state.items.find((entry) => entry.slug === slug))
  const remove = useCartStore((state) => state.remove)
  const setQty = useCartStore((state) => state.setQty)

  if (!item) return null

  const priced = priceTypeAllowsTotal(item.priceType, item.price)

  return (
    <li className="flex gap-3 border-b border-border p-4 last:border-b-0">
      <a className="w-16 shrink-0 overflow-hidden rounded-lg" href={`/products/${item.slug}`}>
        <ProductImage alt={item.title} src={item.image} />
      </a>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium">{item.title}</p>

        {priced ? (
          <p className="text-muted-fore text-xs">{formatPKR(item.price ?? 0)} each</p>
        ) : (
          <p className="text-xs font-medium text-accent">Request a quote</p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              aria-label={`Reduce quantity of ${item.title}`}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
              onClick={() => setQty(item.slug, item.qty - 1)}
              type="button"
            >
              <Minus aria-hidden="true" size={14} />
            </button>

            <span aria-live="polite" className="w-8 text-center text-sm font-medium tabular-nums">
              {item.qty}
            </span>

            <button
              aria-label={`Increase quantity of ${item.title}`}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
              onClick={() => setQty(item.slug, item.qty + 1)}
              type="button"
            >
              <Plus aria-hidden="true" size={14} />
            </button>
          </div>

          <button
            aria-label={`Remove ${item.title} from basket`}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-fore transition-colors hover:bg-danger/10 hover:text-danger"
            onClick={() => remove(item.slug)}
            type="button"
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      {priced ? (
        <p className="shrink-0 text-sm font-semibold tabular-nums">
          {formatPKR((item.price ?? 0) * item.qty)}
        </p>
      ) : null}
    </li>
  )
}
