'use client'

import { Menu, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { useCartStore } from '@/lib/cart-store'
import { Sheet } from '@/components/ui/Sheet'
import { useSiteSettings } from './SiteSettingsProvider'

const LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const settings = useSiteSettings()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  /**
   * Reads the persisted basket through useSyncExternalStore rather than
   * subscribing and calling setState inside an effect.
   *
   * Three problems this avoids at once: Zustand's `subscribe` fires
   * synchronously on registration, which React flags as a cascading render; an
   * effect-based subscription is unnecessary because the store already IS the
   * external source of truth; and by supplying a server snapshot of `[]`, the
   * server and client render the same count on first paint, so there is no
   * hydration mismatch while the basket is being read from localStorage.
   */
  const items = useSyncExternalStore(
    (onStoreChange) => useCartStore.subscribe(onStoreChange),
    () => useCartStore.getState().items,
    () => [],
  )

  // Rehydration is a side effect on the persisted store, not a render concern.
  useEffect(() => {
    void useCartStore.persist.rehydrate()
  }, [])

  const count = items.reduce((total, item) => total + item.qty, 0)

  /**
   * The mobile menu closes via each link's own onClick rather than an effect
   * watching the pathname. An effect calling setState on route change causes an
   * extra render of the whole header on every navigation, and the handler sits
   * closer to the interaction that actually needs it.
   */
  const closeMobile = () => setMobileOpen(false)

  const isActive = (href: string) =>
    href === '/products' ? pathname?.startsWith('/products') : pathname === href

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link className="flex items-center gap-2.5" href="/">
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-8 rounded" src={settings.logo} />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded bg-primary font-display text-sm font-bold text-white"
            >
              YB
            </span>
          )}
          <span className="font-display text-base font-semibold">{settings.businessName}</span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-muted text-text'
                  : 'text-muted-fore hover:bg-muted hover:text-text'
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            aria-label={`Open basket, ${count} item${count === 1 ? '' : 's'}`}
            className="relative flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted"
            onClick={onOpenCart}
            type="button"
          >
            <ShoppingBag aria-hidden="true" size={20} />
            {/*
              aria-live so a screen reader hears the basket change after
              "add to basket", rather than the user having to go looking.
            */}
            <span
              aria-live="polite"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white"
            >
              {count > 9 ? '9+' : count}
            </span>
          </button>

          <button
            aria-expanded={mobileOpen}
            aria-label="Open menu"
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>
      </div>

      <Sheet onClose={() => setMobileOpen(false)} open={mobileOpen} side="right" title="Menu">
        <nav aria-label="Mobile" className="flex flex-col p-3">
          {LINKS.map((link) => (
            <Link
              className="min-h-12 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
              href={link.href}
              key={link.href}
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Sheet>
    </header>
  )
}
