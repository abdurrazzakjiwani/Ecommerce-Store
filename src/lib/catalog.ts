/**
 * Read layer for catalogue content.
 *
 * ============================================================================
 * SEAM: swap to Payload when the database is available.
 * ============================================================================
 * Every function here currently reads from `lib/fixtures/data.ts` so the storefront
 * renders for client review without a database.
 *
 * When Neon is provisioned, change ONLY this file. Every function becomes a
 * Payload Local API call, for example:
 *
 *   const payload = await getPayload({ config })
 *   const { docs } = await payload.find({ collection: 'products', where: {...} })
 *
 * The collection configs already exist in `src/collections/` and mirror the types
 * in `lib/types.ts` exactly, so the signatures below do not change and no
 * component is affected.
 *
 * IMPORTANT: nothing outside this file may import `getPayload` or `@payload-config`.
 * Keeping the boundary here is what makes the swap a one-file change.
 */

import { CATEGORIES, POSTS, PRODUCTS, SITE_SETTINGS } from './fixtures/data'
import type { Category, Post, Product, SiteSettings } from './types'

export async function getSiteSettings(): Promise<SiteSettings> {
  return SITE_SETTINGS
}

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES
}

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS
}

export async function getPosts(): Promise<Post[]> {
  return POSTS
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return PRODUCTS.find((product) => product.slug === slug) ?? null
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return POSTS.find((post) => post.slug === slug) ?? null
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return CATEGORIES.find((category) => category.slug === slug) ?? null
}

/** Top-level categories, each with its direct children. Used for the category rail. */
export async function getCategoryTree(): Promise<{
  children: Category[]
  parent: Category
}[]> {
  return CATEGORIES.filter((category) => category.parentId === null).map((parent) => ({
    parent,
    children: CATEGORIES.filter((category) => category.parentId === parent.id),
  }))
}

/**
 * The given category plus every descendant, at any depth.
 *
 * Needed because selecting a parent category must include its sub-categories
 * (spec FR-002). Written as a breadth-first walk rather than assuming two levels,
 * because the category depth is set by the business owner and is not fixed at one.
 */
export async function getCategoryWithDescendantIds(categoryId: string): Promise<string[]> {
  const ids = [categoryId]
  const queue = [categoryId]

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId) continue

    const children = CATEGORIES.filter((category) => category.parentId === currentId)

    for (const child of children) {
      if (!ids.includes(child.id)) {
        ids.push(child.id)
        queue.push(child.id)
      }
    }
  }

  return ids
}

export async function getCategoryName(categoryId: string): Promise<string> {
  return CATEGORIES.find((category) => category.id === categoryId)?.title ?? ''
}

/** Every category id mapped to its title, for labelling cards in one lookup. */
export async function getCategoryNameMap(): Promise<Record<string, string>> {
  return Object.fromEntries(CATEGORIES.map((category) => [category.id, category.title]))
}

/** Resolves a product's `relatedSlugs` to products, skipping anything unknown. */
export async function getRelatedProducts(product: Product): Promise<Product[]> {
  return product.relatedSlugs
    .map((slug) => PRODUCTS.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is Product => Boolean(candidate))
}

export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  const featured = PRODUCTS.filter((product) => product.featured)

  return typeof limit === 'number' ? featured.slice(0, limit) : featured
}

/**
 * Products in one category or any of its descendants.
 *
 * `subCategories: false` lets the product detail page show siblings within the
 * exact category, while the catalogue filter uses the descendant form.
 */
export async function getProductsByCategory(
  categoryId: string,
  options: { includeSubCategories?: boolean } = {},
): Promise<Product[]> {
  if (options.includeSubCategories === false) {
    return PRODUCTS.filter((product) => product.categoryId === categoryId)
  }

  const ids = await getCategoryWithDescendantIds(categoryId)

  return PRODUCTS.filter((product) => ids.includes(product.categoryId))
}
