import type { MetadataRoute } from 'next'

import { getPosts, getProducts } from '@/lib/catalog'
import { productionOrigin } from '@/lib/origin'

/** Covers every public route so search engines can discover the catalogue. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Throws in a production build if the origin would be localhost or the deleted
  // domain. See `lib/origin.ts` for why a green build alone is not evidence.
  const base = productionOrigin()

  const [products, posts] = await Promise.all([getProducts(), getPosts()])

  const staticRoutes = ['', '/products', '/about', '/blog', '/contact', '/privacy'].map(
    (route) => ({
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.7,
      url: `${base}${route}`,
    }),
  )

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      url: `${base}/products/${product.slug}`,
    })),
    ...posts.map((post) => ({
      changeFrequency: 'monthly' as const,
      lastModified: new Date(post.publishedAt),
      priority: 0.6,
      url: `${base}/blog/${post.slug}`,
    })),
  ]
}
