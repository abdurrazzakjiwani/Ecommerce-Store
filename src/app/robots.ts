import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')

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
