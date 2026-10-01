import { ArrowRight, CheckCircle2, Package, ShieldCheck, UserRound } from 'lucide-react'

import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductGrid } from '@/components/product/ProductGrid'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink, ButtonExternal } from '@/components/ui/Button'
import {
  getCategoryTree,
  getCategoryNameMap,
  getFeaturedProducts,
  getPosts,
  getSiteSettings,
} from '@/lib/catalog'
import { formatPKR } from '@/lib/currency'
import { buildWaLink } from '@/lib/whatsapp'

export const metadata: Metadata = {
  description:
    'Hardware, software and IT services for growing businesses. Enquire directly on WhatsApp.',
}

const TRUST = [
  {
    body: 'We will tell you plainly if something is not worth buying, including equipment we sell.',
    Icon: ShieldCheck,
    title: 'Honest advice',
  },
  {
    body: 'Every enquiry is answered by a person, usually the same one who will do the work.',
    Icon: UserRound,
    title: 'You talk to us',
  },
  {
    body: 'Warranties and support handled locally, without shipping equipment across the country.',
    Icon: Package,
    title: 'Local support',
  },
]

export default async function HomePage() {
  const [settings, featured, categories, posts, categoryNames] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(6),
    getCategoryTree(),
    getPosts(),
    getCategoryNameMap(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">
          <div className="flex flex-col gap-5">
            <Badge tone="accent" className="w-fit">
              Nationwide across Pakistan
            </Badge>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {settings.businessName}
            </h1>

            <p className="text-muted-fore max-w-prose text-lg leading-relaxed">
              {settings.tagline}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" size="lg">
                Browse the catalogue
                <ArrowRight aria-hidden="true" size={18} />
              </ButtonLink>

              <ButtonExternal
                href={buildWaLink(
                  settings.whatsappNumber,
                  `Hello ${settings.businessName}, I would like to ask about your services.`,
                )}
                size="lg"
                variant="whatsapp"
              >
                <WhatsAppIcon size={20} />
                Ask on WhatsApp
              </ButtonExternal>
            </div>

            <p className="text-muted-fore text-sm">
              No online checkout. Browse, then send your enquiry straight to us.
            </p>
          </div>

          {/* Decorative panel */}
          <div
            aria-hidden="true"
            className="hidden aspect-4/3 rounded-2xl border border-border bg-gradient-to-br from-bg via-surface to-muted md:block"
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 md:px-6">
          {TRUST.map(({ body, Icon, title }) => (
            <div className="flex gap-3" key={title}>
              <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-accent" size={22} />
              <div>
                <h2 className="font-display font-semibold">{title}</h2>
                <p className="text-muted-fore mt-1 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">What we do</h2>
            <p className="text-muted-fore mt-2 max-w-prose">
              Hardware, licensed software and the technical work to keep both running.
            </p>
          </div>

          <Link
            className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent underline underline-offset-4"
            href="/products"
          >
            See everything
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ children, parent }) => (
            <div
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
              key={parent.id}
            >
              <h3 className="font-display font-semibold">{parent.title}</h3>
              <p className="text-muted-fore text-sm leading-relaxed">{parent.description}</p>

              <ul className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
                {children.map((child) => (
                  <li key={child.id}>
                    <Link
                      className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted-fore transition-colors hover:text-accent"
                      href={`/products?category=${child.slug}`}
                    >
                      <CheckCircle2 aria-hidden="true" className="text-accent" size={14} />
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Featured</h2>
          <p className="text-muted-fore mt-2 max-w-prose">
            A few things we supply most often. Prices are indicative until confirmed.
          </p>

          <div className="mt-8">
            <ProductGrid categoryNames={categoryNames} products={featured} />
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              How ordering works
            </h2>
            <p className="text-muted-fore mt-3 max-w-prose leading-relaxed">
              There is no payment step on this site. You build a list, we confirm stock and
              price, and you deal with us directly. That keeps prices honest and means you
              are talking to the person who will actually do the work.
            </p>

            <ol className="mt-6 flex flex-col gap-4">
              {[
                'Add what you need to your basket.',
                'Enter your delivery details and review the message.',
                'Send it to us on WhatsApp and we reply with confirmation and a final price.',
              ].map((step, index) => (
                <li className="flex gap-3" key={step}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-muted-fore text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6">
              <ButtonLink href="/products">Start browsing</ButtonLink>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featured.slice(0, 2).map((product) => (
              <div
                className="rounded-xl border border-border bg-surface p-5"
                key={product.id}
              >
                <p className="font-display font-semibold">{product.title}</p>
                <p className="text-muted-fore mt-1 text-sm">
                  {product.priceType === 'quote' || product.price === null
                    ? 'Quoted per enquiry'
                    : `From ${formatPKR(product.price)}`}
                </p>
              </div>
            ))}

            <div className="rounded-xl border border-border bg-bg p-5 sm:col-span-2">
              <p className="text-muted-fore text-sm leading-relaxed">
                {settings.deliveryTimeframe}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                About {settings.businessName}
              </h2>
              <p className="text-muted-fore mt-3 max-w-prose leading-relaxed">
                {settings.aboutContent.split('\n\n')[0]}
              </p>
              <Link
                className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent underline underline-offset-4"
                href="/about"
              >
                Read more about us
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-display font-semibold">Latest from the blog</h3>
              <ul className="flex flex-col gap-3">
                {posts.slice(0, 3).map((post) => (
                  <li key={post.id}>
                    <Link
                      className="flex flex-col text-sm transition-colors hover:text-accent"
                      href={`/blog/${post.slug}`}
                    >
                      <span className="font-medium">{post.title}</span>
                      <span className="text-muted-fore text-xs">
                        {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact call to action */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            Need something that is not listed?
          </h2>
          <p className="text-muted-fore mx-auto mt-3 max-w-prose leading-relaxed">
            Tell us what you are trying to do. If we can help, we will say so. If we cannot,
            we will point you to someone who can.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact">Send an enquiry</ButtonLink>
            <ButtonLink href="/products" variant="secondary">
              Browse catalogue
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
