import type { Metadata } from 'next'

import { getSiteSettings } from '@/lib/catalog'

export const metadata: Metadata = {
  description: 'How this site handles the information you send us.',
  title: 'Privacy policy',
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Privacy policy</h1>
        <p className="text-muted-fore mt-2">Last updated: 1 October 2026</p>
      </header>

      <div className="mt-8 flex flex-col gap-4 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold">What we collect</h2>
          <p className="text-muted-fore mt-2">
            Only what you choose to send us. If you use the contact form we receive your
            name, email address, any phone number you provide and your message. If you send
            an enquiry from your basket we receive the items you selected, the delivery
            address you entered, and your name and contact number.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">What we do not collect</h2>
          <p className="text-muted-fore mt-2">
            There are no accounts on this site, so we do not hold a profile for you. We do
            not use advertising or analytics trackers, and we do not sell or share your
            details with anyone for marketing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Your basket and saved address</h2>
          <p className="text-muted-fore mt-2">
            Your basket and any delivery address you choose to remember are stored in your
            own browser, on your device. They are never sent to our servers. They are
            transmitted only at the moment you choose to send an enquiry, and you can clear
            them at any time by clearing your browser data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">How we use your details</h2>
          <p className="text-muted-fore mt-2">
            Solely to answer your enquiry, prepare a quote, arrange delivery and provide any
            support that follows from it. We keep the record of your enquiry for as long as
            the commercial relationship continues, and no longer than we need it for tax and
            warranty purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Where your data is stored</h2>
          <p className="text-muted-fore mt-2">
            Our website is hosted on managed infrastructure, and enquiry records are held in
            a hosted database. Neither is shared with third parties for their own purposes.
            Email notifications are delivered through a transactional email provider, which
            processes the message on our behalf only.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Contacting us</h2>
          <p className="text-muted-fore mt-2">
            To ask what we hold about you, or to ask for it to be corrected or deleted,
            email{' '}
            <a
              className="font-medium text-accent underline underline-offset-4"
              href={`mailto:${settings.notificationEmail}`}
            >
              {settings.notificationEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
