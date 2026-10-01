import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArticleCard } from '@/components/article/ArticleCard'
import { CategoryCard } from '@/components/category/CategoryCard'
import type { Category, Post } from '@/lib/types'

/**
 * Article and category card contracts.
 *
 * The article card is held to the product card's standard (FR-015), and the category
 * card is deliberately quieter (FR-016). Both are assertions about *absence* as much as
 * presence, because the failure modes are elements that should not be there:
 *
 *   - an article card showing a price, which would read as a product
 *   - an article card offering add-to-basket, which does nothing useful on a blog entry
 *   - a category card competing with the products it sits above
 */

const post: Post = {
  id: 'post-1',
  slug: 'choosing-a-printer',
  title: 'How to choose a printer for a small office',
  excerpt: 'A practical walk through the decisions that actually matter.',
  body: 'Longer body text.',
  coverImage: '/placeholders/post-1.svg',
  publishedAt: '2026-01-15T00:00:00.000Z',
}

const category: Category = {
  id: 'c1',
  slug: 'printers',
  title: 'Printers and scanners',
  description: 'Office printing and scanning.',
  parentId: null,
}

describe('ArticleCard', () => {
  it('renders the element order required by FR-015', () => {
    // imagery, category, publication date, title, summary, read action
    const { container } = render(<ArticleCard post={post} />)

    expect(container.querySelector('[data-card-part="imagery"]')).not.toBeNull()
    expect(container.querySelector('time')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(post.title)
    expect(screen.getByText(post.excerpt)).toBeInTheDocument()
    expect(screen.getByText('Read article')).toBeInTheDocument()
  })

  it('shows the publication date in words, not a raw timestamp', () => {
    render(<ArticleCard post={post} />)
    const time = screen.getByText(/January/)
    expect(time).toHaveTextContent('15 January 2026')
  })

  it('shows NO price and NO add-to-basket action (FR-015)', () => {
    // Not hidden with CSS - the components are not mounted at all, so an article can
    // never be mistaken for a product and a screen reader is offered no dead control.
    const { container } = render(<ArticleCard post={post} />)

    expect(container.textContent).not.toMatch(/PKR|Rs\.?\s*\d/)
    expect(screen.queryByRole('button', { name: /add .* basket/i })).toBeNull()
    expect(screen.queryByText(/request a quote/i)).toBeNull()
  })

  it('links to the article', () => {
    // Two links to the same destination by design: the image area and the title. The
    // stretched-link pattern means the title's pseudo-element covers the card, but both
    // remain real links so keyboard users have a predictable target.
    render(<ArticleCard post={post} />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)

    for (const link of links) {
      expect(link).toHaveAttribute('href', `/blog/${post.slug}`)
    }
  })

  it('renders a placeholder for a null cover image rather than a broken frame', () => {
    // coverImage is nullable, so this state is reachable for real content.
    render(<ArticleCard post={{ ...post, coverImage: null }} />)
    expect(screen.getByText('No photo yet')).toBeInTheDocument()
  })

  it('reserves the image box to protect CLS', () => {
    const { container } = render(<ArticleCard post={post} />)
    const imagery = container.querySelector('[data-card-part="imagery"]')
    expect(imagery?.className).toContain('aspect-')
  })

  it('clamps the title so long articles do not break the grid', () => {
    const { container } = render(
      <ArticleCard post={{ ...post, title: 'A very long article title '.repeat(8) }} />,
    )
    expect(container.querySelector('h3 a')?.className).toMatch(/line-clamp-2/)
  })

  it('does not render a category label when none is supplied', () => {
    const { container, rerender } = render(<ArticleCard post={post} />)
    expect(container.textContent).not.toMatch(/news/i)

    rerender(<ArticleCard categoryName="Guides" post={post} />)
    expect(screen.getByText('Guides')).toBeInTheDocument()
  })
})

describe('CategoryCard', () => {
  it('links to the filtered catalogue', () => {
    render(<CategoryCard category={category} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products?category=printers')
  })

  it('shows the item count when one is supplied', () => {
    render(<CategoryCard category={category} productCount={4} />)
    expect(screen.getByText('4 items')).toBeInTheDocument()
  })

  it('uses the singular form for a single item', () => {
    render(<CategoryCard category={category} productCount={1} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('stays visually subordinate to product cards (FR-016)', () => {
    // No hover lift, no accent-coloured title, and no image area. A category is a
    // browsing affordance; if it matched a product card's weight, products would
    // compete with their own navigation.
    const { container } = render(<CategoryCard category={category} productCount={4} />)
    const link = container.querySelector('a')

    // No lift, no shadow: a category tile must not rise off the page the way a
    // product card does.
    expect(link?.className).not.toMatch(/translate-y/)
    expect(link?.className).not.toMatch(/shadow-lg/)
    expect(container.querySelector('[data-card-part="imagery"]')).toBeNull()

    // The accent appears only on hover. A permanently accent-coloured title would make
    // a category read as a call to action, competing with the products below it.
    const heading = container.querySelector('h3')
    expect(heading?.className).toMatch(/group-hover:text-accent/)
    expect(heading?.className).not.toMatch(/(^|\s)text-accent(\s|$)/)
  })

  it('shares the card radii and surface with the other cards (FR-016 consistency)', () => {
    const { container } = render(<CategoryCard category={category} />)
    const link = container.querySelector('a')

    expect(link?.className).toContain('rounded-xl')
    expect(link?.className).toContain('border-border')
    expect(link?.className).toContain('bg-surface')

    // The display face is on the heading, matching the product and article cards.
    expect(container.querySelector('h3')?.className).toContain('font-display')
  })

  it('omits the description paragraph when there is none', () => {
    const { container } = render(<CategoryCard category={{ ...category, description: '' }} />)
    expect(container.querySelector('p')).toBeNull()
  })
})
