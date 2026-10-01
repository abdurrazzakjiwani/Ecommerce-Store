import type { Metadata } from 'next'

import { ArticleCard } from '@/components/article/ArticleCard'
import { getPosts } from '@/lib/catalog'

export const metadata: Metadata = {
  description: 'Practical notes on hardware, software and keeping business systems running.',
  title: 'Blog',
}

export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Blog</h1>
        <p className="text-muted-fore mt-2 leading-relaxed">
          Practical notes from the work. No sales pitches.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="font-display font-semibold">No posts yet</p>
          <p className="text-muted-fore mt-2 text-sm">
            Articles will appear here once they are published.
          </p>
        </div>
      ) : (
        /*
          Cards rather than a divided list, held to the same standard as the product
          cards (FR-015). With the catalogue expanded to ~24 items, the blog needs to
          look equally substantive - a plain list beside a card grid is exactly the
          inconsistency this release exists to remove.
        */
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <ArticleCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
