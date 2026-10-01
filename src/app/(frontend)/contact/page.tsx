import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'

import { ContactForm } from '@/components/contact/ContactForm'
import { ButtonExternal } from '@/components/ui/Button'
import { getSiteSettings } from '@/lib/catalog'
import { buildWaLink } from '@/lib/whatsapp'

export const metadata: Metadata = {
  description: 'Ask a question, request a quote, or tell us what you are trying to do.',
  title: 'Contact',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold md:text-4xl">Contact us</h1>
            <p className="text-muted-fore mt-3 max-w-prose leading-relaxed">
              {settings.contactIntro}
            </p>
          </header>

          <ContactForm />
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display font-semibold">Faster than a form</h2>
            <p className="text-muted-fore mt-2 text-sm leading-relaxed">
              WhatsApp is the quickest route. Send a message and you will normally get a
              reply the same working day.
            </p>

            <ButtonExternal
              className="mt-4 w-full"
              href={buildWaLink(
                settings.whatsappNumber,
                `Hello ${settings.businessName}, I have an enquiry.`,
              )}
            >
              <MessageCircle aria-hidden="true" size={18} />
              Message on WhatsApp
            </ButtonExternal>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display font-semibold">Other ways to reach us</h2>

            <ul className="mt-3 flex flex-col gap-3 text-sm">
              <li>
                <a
                  className="inline-flex min-h-9 items-center gap-2 break-all text-muted-fore transition-colors hover:text-text"
                  href={`mailto:${settings.notificationEmail}`}
                >
                  <Mail aria-hidden="true" size={15} />
                  {settings.notificationEmail}
                </a>
              </li>

              {/*
                Omitted rather than rendered empty when the business has not
                supplied a number (spec SC-011).
              */}
              {settings.phone.trim() !== '' ? (
                <li>
                  <a
                    className="inline-flex min-h-9 items-center gap-2 text-muted-fore transition-colors hover:text-text"
                    href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                  >
                    <Phone aria-hidden="true" size={15} />
                    {settings.phone}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-bg p-5">
            <h2 className="font-display text-sm font-semibold">What happens next</h2>
            <ol className="mt-3 flex flex-col gap-2 text-sm text-muted-fore">
              <li className="flex gap-2">
                <span className="font-medium text-text">1.</span>
                We read your enquiry and check what we actually have.
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-text">2.</span>
                We reply on WhatsApp or email with an honest answer and a price.
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-text">3.</span>
                You decide. No pressure and no follow-up chasing.
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}
