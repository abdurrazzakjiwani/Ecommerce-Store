import type { Metadata } from 'next'
import Link from 'next/link'

import { getPosts } from '@/lib/catalog'

export const metadata: Metadata = {
  description: 'Practical notes on hardware, software and keeping business systems running.',
  title: 'Blog',
}

export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
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
        <ul className="flex flex-col divide-y divide-border">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="flex flex-col gap-2 py-6">
                <time
                  className="text-muted-fore text-xs font-medium uppercase tracking-wide"
                  dateTime={post.publishedAt}
                >
                  {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>

                <h2 className="font-display text-xl font-semibold leading-snug">
                  <Link
                    className="transition-colors hover:text-accent"
                    href={`/blog/${post.slug}`}
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="text-muted-fore leading-relaxed">{post.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
