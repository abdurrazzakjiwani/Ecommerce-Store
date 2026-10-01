import type { MetadataRoute } from 'next'

import { productionOrigin } from '@/lib/origin'

export default function robots(): MetadataRoute.Robots {
  // Same guard as the sitemap. Both routes previously fell back to localhost when
  // NEXT_PUBLIC_SERVER_URL was unset, which is how a live site came to advertise an
  // address that could not serve it. See `lib/origin.ts`.
  const base = productionOrigin()

  return {
    rules: [
      {
        allow: '/',
        // The admin panel and API must never be indexed.
        disallow: ['/admin', '/api/', '/graphql'],
        userAgent: '*',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
