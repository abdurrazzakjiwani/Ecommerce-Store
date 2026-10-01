'use client'

import { ArrowLeft, ShoppingBag } from 'lucide-react'

import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import Link from 'next/link'
import { useState } from 'react'

import { AddressForm } from '@/components/cart/AddressForm'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'
import { priceTypeAllowsTotal, useCartStore, type SavedAddress } from '@/lib/cart-store'
import { formatPKR } from '@/lib/currency'
import { buildOrderMessage, buildWaLink } from '@/lib/whatsapp'
import { CartLine } from './CartLine'

type Step = 'basket' | 'address'

export function CartDrawer({ onClose, open }: { onClose: () => void; open: boolean }) {
  const settings = useSiteSettings()
  const items = useCartStore((state) => state.items)
  const savedAddress = useCartStore((state) => state.savedAddress)
  const clear = useCartStore((state) => state.clear)

  const [step, setStep] = useState<Step>('basket')
  const [address, setAddress] = useState<SavedAddress | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const pricedLines = items.filter((item) => priceTypeAllowsTotal(item.priceType, item.price))
  const quoteCount = items.length - pricedLines.length

  const subtotal = pricedLines.reduce(
    (sum, item) => sum + item.qty * (item.price ?? 0),
    0,
  )

  /**
   * Client-side preview of the exact message the business receives.
   *
   * Uses the same `buildOrderMessage` the server will use, so the preview cannot
   * drift from what is actually sent.
   */
  const previewMessage = buildOrderMessage(
    items.map((item) => ({
      priceType: item.priceType,
      qty: item.qty,
      title: item.title,
      unitPrice: item.price,
    })),
    { name: name || 'Your name', phone: phone || 'Your number' },
    address,
    settings.businessName,
  )

  const canSend = name.trim().length >= 2 && phone.trim().length >= 10

  const sendToWhatsApp = () => {
    if (!canSend) return

    const href = buildWaLink(settings.whatsappNumber, previewMessage)

    clear()
    window.open(href, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const isEmpty = items.length === 0

  return (
    <Sheet onClose={onClose} open={open} title={step === 'basket' ? 'Your basket' : 'Delivery details'}>
      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <ShoppingBag aria-hidden="true" className="text-muted-fore" size={32} />
          <div>
            <p className="font-medium">Your basket is empty</p>
            <p className="text-muted-fore mt-1 text-sm">
              Add something from the catalogue and it will appear here.
            </p>
          </div>
          <Button onClick={onClose} variant="secondary">
            Continue browsing
          </Button>
        </div>
      ) : null}

      {!isEmpty && step === 'basket' ? (
        <div className="flex h-full flex-col">
          <ul className="flex-1 overflow-y-auto">
            {items.map((item) => (
              <CartLine key={item.slug} slug={item.slug} />
            ))}
          </ul>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-bg p-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-fore">Subtotal</span>
              <span className="tabular-nums font-display text-lg font-semibold" data-numeric>
                {formatPKR(subtotal)}
              </span>
            </div>

            {/*
              When any line awaits a quote, the subtotal is explicitly labelled as
              partial so it is never read as the final order value.
            */}
            {quoteCount > 0 ? (
              <p className="text-muted-fore -mt-1 text-xs leading-relaxed">
                Covers priced items only. {quoteCount} item{quoteCount === 1 ? '' : 's'}{' '}
                {quoteCount === 1 ? 'needs' : 'need'} a quote, so this is not the final
                total.
              </p>
            ) : null}

            <Button onClick={() => setStep('address')} size="lg">
              Continue to delivery details
            </Button>
          </div>
        </div>
      ) : null}

      {!isEmpty && step === 'address' ? (
        <div className="flex flex-col gap-5 p-4">
          <button
            className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-fore hover:text-text"
            onClick={() => setStep('basket')}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Back to basket
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="customer-name">
                Your name
              </label>
              <input
                className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                id="customer-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Ahmed Khan"
                value={name}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="customer-phone">
                Your number
              </label>
              <input
                className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                id="customer-phone"
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0300 1234567"
                value={phone}
              />
            </div>
          </div>

          <AddressForm
            onSubmit={(value) => setAddress(value)}
            onUseSaved={savedAddress ? () => setAddress(savedAddress) : null}
          />

          {address ? (
            <section aria-live="polite" className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Message preview</h3>
              <p className="text-muted-fore text-xs">
                This is what {settings.businessName} will receive. You can still edit it in
                WhatsApp before sending.
              </p>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed">
                {previewMessage}
              </pre>
            </section>
          ) : (
            <p className="text-muted-fore text-sm">
              Fill in your delivery details to see the message preview and continue.
            </p>
          )}

          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-bg pt-4">
            <Button
              disabled={!address || !canSend}
              onClick={sendToWhatsApp}
              size="lg"
            >
              <WhatsAppIcon size={20} />
              Send enquiry on WhatsApp
            </Button>

            {!canSend ? (
              <p className="text-muted-fore text-center text-xs">
                Add your name and contact number to continue.
              </p>
            ) : null}

            <p className="text-muted-fore text-center text-xs">
              Nothing is charged on this site. You will be able to review the message
              before it sends.
            </p>
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}

export function CartLink() {
  return (
    <Link className="underline" href="/products">
      Browse products
    </Link>
  )
}
