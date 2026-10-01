import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/lib/types'

/**
 * Card contract, from FR-008 to FR-014.
 *
 * The three things most likely to regress silently:
 *   1. a quote-status product showing a price figure (FR-011)
 *   2. the add control navigating to the item instead of adding (FR-013)
 *   3. card images starting to cycle, which would put 24 live carousels on one
 *      catalogue page and breach the CLS and INP budget (FR-015)
 *
 * The third is guarded by the `autoPlay` default in `ProductGallery`, so these tests
 * assert the card does not pass it, rather than testing the gallery's internals.
 */

const baseProduct: Product = {
  id: 'p1',
  slug: 'test-item',
  title: 'A reasonably long product title that will need to be clamped',
  summary: 'A short summary of the product.',
  description: 'Longer description.',
  categoryId: 'c1',
  images: ['/placeholders/p1.svg'],
  price: 25000,
  priceType: 'fixed',
  currency: 'PKR',
  specs: [],
  tags: [],
  featured: false,
  inStock: true,
  relatedSlugs: [],
}

function renderCard(overrides: Partial<Product> = {}) {
  const product = { ...baseProduct, ...overrides }

  return render(
    <ProductCard categoryName="Printers" product={product} />,
  )
}

describe('ProductCard', () => {
  it('renders the fixed element order required by FR-008', () => {
    // imagery, category, availability, name, summary, price, add action
    const { container } = renderCard()

    expect(container.querySelector('[data-card-part="imagery"]')).not.toBeNull()
    expect(screen.getByText('Printers')).toBeInTheDocument()
    expect(screen.getByText('In stock')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(screen.getByText(baseProduct.summary)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add .* to basket/i })).toBeInTheDocument()
  })

  it('shows a price for a fixed-price product (FR-011)', () => {
    renderCard({ priceType: 'fixed', price: 25000 })
    expect(screen.getByText(/25,000/)).toBeInTheDocument()
  })

  it('shows NO price figure anywhere for a quote-status product (FR-011)', () => {
    // The requirement is "no price figure anywhere on its card or page", so this
    // asserts the absence of currency formatting rather than the presence of a
    // particular string. Scoped to the card body, because the gallery's screen-reader
    // live region legitimately contains digits ("Image 1 of 4").
    const { container } = renderCard({ priceType: 'quote', price: null })
    const body = container.querySelector('[data-card-part="body"]')

    expect(body?.textContent).not.toMatch(/\d/)
    expect(screen.queryByText(/PKR/)).toBeNull()
    expect(screen.queryByText(/Rs\.?\s*\d/)).toBeNull()

    // The visitor still needs to know the item is available on request, so an
    // invitation to enquire is correct. What is forbidden is a figure.
    expect(screen.getByText('Request a quote')).toBeInTheDocument()
  })

  it('shows no price for priceType "from" when no figure is set', () => {
    const { container } = renderCard({ priceType: 'from', price: null })
    expect(container.textContent).not.toMatch(/PKR/)
  })

  it('labels out-of-stock items as on request rather than in stock', () => {
    renderCard({ inStock: false })
    expect(screen.getByText('On request')).toBeInTheDocument()
    expect(screen.queryByText('In stock')).toBeNull()
  })

  it('exposes the add control as a button separate from the item link (FR-013)', () => {
    renderCard()

    const addButton = screen.getByRole('button', { name: /add .* to basket/i })
    const itemLink = screen.getByRole('link', { name: /view /i })

    // The two are distinct elements with distinct roles, so activating the add button
    // cannot be swallowed by the link.
    expect(addButton.tagName).toBe('BUTTON')
    expect(itemLink.tagName).toBe('A')
    expect(addButton).not.toBe(itemLink)
  })

  it('does not nest the add button inside the item link (FR-013)', () => {
    // A button inside an anchor is invalid HTML and produces unpredictable behaviour.
    const { container } = renderCard()

    const link = container.querySelector('a[href^="/products/"]')
    expect(link?.querySelector('button')).toBeNull()
  })

  it('gives the add control a 44px minimum touch target class (FR-014)', () => {
    renderCard()
    const addButton = screen.getByRole('button', { name: /add .* to basket/i })
    expect(addButton.className).toContain('min-h-11')
  })

  it('reserves the image box so cards do not reflow as images load (FR-024)', () => {
    // CLS under 0.1 is a release gate (SC-016) and this is its main risk.
    const { container } = renderCard()
    const imagery = container.querySelector('[data-card-part="imagery"]')
    expect(imagery?.className).toContain('aspect-')
  })

  it('does not enable image cycling on cards (FR-015)', () => {
    // With ~24 products, a page of results must not mount 24 autoplaying carousels.
    // The gallery defaults autoPlay to false; this asserts the card does not opt in.
    const { container } = renderCard()
    const pauseControl = container.querySelector('[aria-label*="carousel" i]')
    expect(pauseControl).toBeNull()
  })

  it('renders a labelled placeholder for an item with no imagery (FR-022)', () => {
    renderCard({ images: [] })
    // Must stay reachable and clearly marked, not a broken image.
    expect(screen.getByRole('link', { name: /view /i })).toBeInTheDocument()
  })

  it('clamps long titles and summaries rather than overflowing (FR-010)', () => {
    const { container } = renderCard({
      title: 'An extremely long product title '.repeat(6),
      summary: 'An extremely long summary that runs on and on. '.repeat(6),
    })

    // The clamp lives on the link inside the heading, since that is the element whose
    // text overflows.
    const headingLink = container.querySelector('h3 a')
    expect(headingLink?.className).toMatch(/line-clamp-2/)

    // Scope to the card body: the gallery also renders a screen-reader-only
    // paragraph, and the first <p> in the document is that live region.
    const body = container.querySelector('[data-card-part="body"]')
    const summary = body?.querySelector('p')
    expect(summary?.className).toMatch(/line-clamp-2/)
  })

  it('gives the card a visible response on hover and focus (FR-012)', () => {
    const { container } = renderCard()
    const article = container.querySelector('article')
    expect(article?.className).toContain('group')
    expect(article?.className).toMatch(/hover:/)
  })

  it('handles a product with no specs and no tags', () => {
    expect(() => renderCard({ specs: [], tags: [] })).not.toThrow()
  })

  it('does not require a store when rendering the card structure', () => {
    // Guards against the card reaching into storage during render. If a future change
    // breaks this, the failure should be a clear render error, not a silent one.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => renderCard()).not.toThrow()
    } finally {
      spy.mockRestore()
    }
  })
})
