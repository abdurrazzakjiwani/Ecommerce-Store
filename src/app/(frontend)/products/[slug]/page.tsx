import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductPurchase } from '@/components/product/ProductPurchase'
import { Badge } from '@/components/ui/Badge'
import {
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
} from '@/lib/catalog'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const { getProducts } = await import('@/lib/catalog')
  const products = await getProducts()

  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product not found' }
  }

  return {
    description: product.summary,
    openGraph: {
      description: product.summary,
      images: product.images[0] ? [product.images[0]] : undefined,
      title: product.title,
    },
    title: product.title,
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  // notFound() renders the 404 state. Returning a 403 here would confirm the
  // product exists, letting visitors probe for unpublished slugs.
  if (!product) notFound()

  const [settings, categories, related] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getRelatedProducts(product),
  ])

  const categoryNames = Object.fromEntries(
    categories.map((category) => [category.id, category.title]),
  )

  /**
   * Product structured data, so shared links render a rich preview and search
   * engines can read price and availability.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/PreOrder',
    brand: { '@type': 'Brand', name: settings.businessName },
    category: categoryNames[product.categoryId],
    description: product.summary,
    image: product.images,
    name: product.title,
    offers:
      product.price !== null
        ? {
            '@type': 'Offer',
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/PreOrder',
            price: product.price,
            priceCurrency: product.currency,
            url: `/products/${product.slug}`,
          }
        : undefined,
    sku: product.slug,
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Link
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-fore transition-colors hover:text-text"
        href="/products"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to products
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/*
          THE ONLY PLACE IN THE APPLICATION THAT OPTS INTO CYCLING (FR-015).

          Cards deliberately do not, so a catalogue page cannot mount 24 concurrent
          autoplaying carousels - which would mean 24 timers, 24 looping live-region
          announcements, and 24 pause controls needed to satisfy WCAG 2.2.2.

          `ProductGallery` defaults autoPlay to false for exactly this reason. If a
          second call site ever needs motion, it must be a deliberate change carrying
          the same justification, not an inherited default.
        */}
        <ProductGallery
          alt={product.title}
          autoPlay
          images={product.images}
          maxCycledImages={5}
        />

        <div className="flex flex-col gap-5">
          <div>
            <Link
              className="text-muted-fore text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent"
              href={`/products?category=${categorySlug(categories, product.categoryId)}`}
            >
              {categoryNames[product.categoryId]}
            </Link>

            <h1 className="font-display mt-1 text-3xl font-semibold md:text-4xl">
              {product.title}
            </h1>

            <p className="text-muted-fore mt-3 leading-relaxed">{product.summary}</p>
          </div>

          <ProductPurchase product={product} />

          {product.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li key={tag}>
                  <Badge>{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Description */}
      <section className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold">About this item</h2>
          <div className="text-muted-fore mt-3 flex flex-col gap-3 leading-relaxed">
            {product.description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {product.specs.length > 0 ? (
          <div>
            <h2 className="font-display text-xl font-semibold">Specifications</h2>
            <dl className="mt-3 flex flex-col">
              {product.specs.map((spec) => (
                <div
                  className="flex justify-between gap-4 border-b border-border py-2.5 last:border-b-0"
                  key={spec.label}
                >
                  <dt className="text-muted-fore text-sm">{spec.label}</dt>
                  <dd className="text-right text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-display text-xl font-semibold">You may also need</h2>
          <div className="mt-6">
            <ProductGrid categoryNames={categoryNames} products={related} />
          </div>
        </section>
      ) : null}

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
    </div>
  )
}

function categorySlug(
  categories: { id: string; slug: string }[],
  categoryId: string,
): string {
  return categories.find((category) => category.id === categoryId)?.slug ?? ''
}
