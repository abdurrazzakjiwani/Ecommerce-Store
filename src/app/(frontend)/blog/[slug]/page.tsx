import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductImage } from '@/components/product/ProductImage'
import { getPostBySlug, getPosts, getSiteSettings } from '@/lib/catalog'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return { title: 'Post not found' }

  return {
    description: post.excerpt,
    openGraph: {
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
      title: post.title,
      type: 'article',
    },
    title: post.title,
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  // Drafts are absent from the catalogue, so they 404 rather than 403. A 403
  // would confirm the post exists.
  if (!post) notFound()

  const settings = await getSiteSettings()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <Link
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-fore transition-colors hover:text-text"
        href="/blog"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to blog
      </Link>

      <header className="mt-6">
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

        <h1 className="font-display mt-2 text-3xl font-semibold leading-tight md:text-4xl">
          {post.title}
        </h1>

        <p className="text-muted-fore mt-4 text-lg leading-relaxed">{post.excerpt}</p>
      </header>

      {post.coverImage ? (
        <ProductImage alt={post.title} className="mt-8 rounded-xl" src={post.coverImage} />
      ) : null}

      {/*
        Article body, using the shared prose rules (FR-029, FR-030). Paragraph spacing
        comes from the token in the base layer, so it is identical regardless of
        paragraph length, and the measure cap keeps lines at a readable width.
      */}
      <div className="prose-body prose-measure mt-8 leading-relaxed">
        {post.body.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <footer className="mt-12 flex flex-col gap-2 border-t border-border pt-6">
        <p className="text-muted-fore text-sm">
          Need advice on something specific?{' '}
          <Link
            className="font-medium text-accent underline underline-offset-4"
            href="/contact"
          >
            Ask {settings.businessName} directly
          </Link>
          .
        </p>
      </footer>
    </article>
  )
}
