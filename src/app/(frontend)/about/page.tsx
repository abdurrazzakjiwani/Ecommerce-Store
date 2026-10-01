import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

import { ButtonLink } from '@/components/ui/Button'
import { getSiteSettings } from '@/lib/catalog'

export const metadata: Metadata = {
  description: 'Who we are, how we work, and why we will tell you when something is not worth buying.',
  title: 'About',
}

const COMMITMENTS = [
  'We will tell you when something is not worth buying, including equipment we sell.',
  'We quote a final price in conversation, not as a number that changes at checkout.',
  'One person handles your enquiry, so you are not explaining your setup repeatedly.',
  'Warranties and faults are handled locally rather than shipped away and forgotten.',
  'We tell you when your problem does not need us, and who to ask instead.',
]

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          About {settings.businessName}
        </h1>
        <p className="text-muted-fore mt-3 text-lg leading-relaxed">{settings.tagline}</p>
      </header>

      <div className="mt-8 flex flex-col gap-4 leading-relaxed">
        {settings.aboutContent.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">How we work</h2>

        <ul className="mt-4 flex flex-col gap-3">
          {COMMITMENTS.map((item) => (
            <li className="flex gap-3" key={item}>
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent"
                size={18}
              />
              <span className="text-muted-fore leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Delivery and coverage</h2>
        <p className="text-muted-fore mt-3 leading-relaxed">
          We supply nationwide across Pakistan. Hardware is dispatched with a tracked
          courier, and on-site work such as network installation is scheduled with you in
          advance. {settings.deliveryTimeframe}
        </p>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/products">Browse the catalogue</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Ask us a question
        </ButtonLink>
      </div>
    </div>
  )
}
