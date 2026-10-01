/**
 * Shared domain types.
 *
 * These mirror the Payload collection shapes defined in `src/collections/`, so
 * swapping the fixture data layer for Payload's Local API is a change to
 * `src/lib/catalog.ts` alone and requires no changes to any component.
 */

export type PriceType = 'fixed' | 'from' | 'quote'

export type ProductSpec = {
  label: string
  value: string
}

export type Product = {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  /** Category id, matching `Category.id`. */
  categoryId: string
  /** Ordered image paths. 3-5 per spec; the UI also tolerates an empty list. */
  images: string[]
  /** Null whenever `priceType` is 'quote'. Enforced by a Payload hook in production. */
  price: number | null
  priceType: PriceType
  currency: string
  specs: ProductSpec[]
  tags: string[]
  featured: boolean
  inStock: boolean
  relatedSlugs: string[]
}

export type Category = {
  id: string
  slug: string
  title: string
  description: string
  /** Parent category id, or null for a top-level category. Enables sub-categories. */
  parentId: string | null
}

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  coverImage: string | null
  publishedAt: string
}

export type SocialLinks = {
  facebook?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

/**
 * Every business identity value.
 *
 * Nothing in the storefront may read a business value from anywhere else. It all
 * comes from here, which mirrors the `site-settings` Payload global. Changing the
 * business name must be a one-field edit, not a code change.
 */
export type SiteSettings = {
  businessName: string
  tagline: string
  logo: string | null
  /** Digits only, no +, spaces or dashes. See `lib/whatsapp.ts`. */
  whatsappNumber: string
  notificationEmail: string
  phone: string
  address: string
  socials: SocialLinks
  currency: string
  deliveryCharge: number | null
  deliveryTimeframe: string
  aboutContent: string
  contactIntro: string
}
