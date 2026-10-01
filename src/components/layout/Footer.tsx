import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import { buildWaLink } from '@/lib/whatsapp'
import type { SiteSettings } from '@/lib/types'

/**
 * Footer.
 *
 * Takes settings as a prop rather than reading the client context, which keeps
 * this a server component: no JavaScript is shipped for content that is static
 * per request.
 *
 * Unsupplied contact details are OMITTED from the layout rather than rendered as
 * a placeholder. Spec SC-011 forbids showing a visitor text like "Coming soon"
 * for details the business has not supplied - a missing phone number should be
 * absent, not visible and empty.
 */
export function Footer({ settings }: { settings: SiteSettings }) {

  const hasPhone = settings.phone.trim() !== ''
  const hasAddress = settings.address.trim() !== ''

  const socials = Object.entries(settings.socials).filter(([, value]) => Boolean(value))

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-semibold">{settings.businessName}</p>
          <p className="text-muted-fore mt-2 max-w-sm text-sm leading-relaxed">
            {settings.tagline}
          </p>

          <Link
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4"
            href="/products"
          >
            Browse the catalogue
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {[
              { href: '/products', label: 'Products' },
              { href: '/blog', label: 'Blog' },
              { href: '/about', label: 'About us' },
              { href: '/contact', label: 'Contact' },
              { href: '/privacy', label: 'Privacy policy' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  className="inline-flex min-h-9 items-center text-sm text-muted-fore transition-colors hover:text-text"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Get in touch</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-fore">
            <li>
              <a
                className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-text"
                href={buildWaLink(settings.whatsappNumber, `Hello ${settings.businessName},`)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="sr-only">WhatsApp: </span>
                WhatsApp
              </a>
            </li>

            {hasPhone ? (
              <li>
                <a
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-text"
                  href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                >
                  <Phone aria-hidden="true" size={15} />
                  {settings.phone}
                </a>
              </li>
            ) : null}

            <li>
              <a
                className="inline-flex min-h-9 items-center gap-2 break-all transition-colors hover:text-text"
                href={`mailto:${settings.notificationEmail}`}
              >
                <Mail aria-hidden="true" size={15} />
                {settings.notificationEmail}
              </a>
            </li>

            {hasAddress ? (
              <li className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
                <span>{settings.address}</span>
              </li>
            ) : null}
          </ul>

          {socials.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-3">
              {socials.map(([name, href]) => (
                <li key={name}>
                  <a
                    className="inline-flex min-h-9 items-center text-sm text-muted-fore capitalize underline underline-offset-4 hover:text-text"
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted-fore md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          {settings.deliveryTimeframe ? <p>{settings.deliveryTimeframe}</p> : null}
        </div>
      </div>
    </footer>
  )
}
