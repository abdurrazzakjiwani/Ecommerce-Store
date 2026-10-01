import { CalendarDays } from 'lucide-react'
import Link from 'next/link'

import { ProductImage } from '@/components/product/ProductImage'
import { cn } from '@/lib/cn'
import type { Post } from '@/lib/types'

/**
 * Article card, held to the same standard as the product card (FR-015).
 *
 * An article list that looks half-finished undermines a site whose product cards
 * look considered, so this matches ProductCard rather than being a lighter variant.
 * Same order, same radii, same clamping, same reserved image box.
 *
 * WHAT IT DELIBERATELY DOES NOT RENDER (FR-015)
 * ---------------------------------------------
 * No price, no quotation state, no add-to-basket action. Those are not hidden with
 * CSS - the components are simply not mounted - so an article can never be mistaken
 * for a product, and a screen reader is not offered a control that does nothing
 * useful on a blog entry.
 *
 * `coverImage` is nullable, so an article published without a photograph gets the same
 * clearly-labelled placeholder a product gets, rather than a broken frame.
 */
export function ArticleCard({
  categoryName,
  className,
  post,
}: {
  categoryName?: string
  className?: string
  post: Post
}) {
  const published = new Date(post.publishedAt)
  const dateLabel = published.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      {/*
        Imagery. The aspect ratio sits on the wrapper so the box is reserved before
        the image loads (FR-024, and the CLS half of SC-016).
      */}
      <Link
        aria-label={`Read ${post.title}`}
        className="relative block aspect-4/5 overflow-hidden"
        data-card-part="imagery"
        href={`/blog/${post.slug}`}
      >
        <ProductImage alt="" src={post.coverImage} />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4" data-card-part="body">
        <div className="flex items-start justify-between gap-2">
          {categoryName ? (
            <span className="text-muted-fore truncate text-xs font-medium tracking-wide uppercase">
              {categoryName}
            </span>
          ) : (
            <span />
          )}

          <time
            className="text-muted-fore flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap"
            dateTime={post.publishedAt}
          >
            <CalendarDays aria-hidden="true" size={12} />
            {dateLabel}
          </time>
        </div>

        <h3 className="font-display text-base font-semibold leading-snug">
          <Link
            className="line-clamp-2 transition-colors after:absolute after:inset-0 group-hover:text-accent"
            href={`/blog/${post.slug}`}
          >
            {post.title}
          </Link>
        </h3>

        <p className="text-muted-fore line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>

        <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-accent">
          Read article
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  )
}
