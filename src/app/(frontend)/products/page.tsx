import type { Metadata } from 'next'

import { CatalogueBrowser } from '@/components/filters/CatalogueBrowser'
import {
  getCategories,
  getCategoryBySlug,
  getCategoryWithDescendantIds,
  getProducts,
} from '@/lib/catalog'
import type { Category } from '@/lib/types'

export const metadata: Metadata = {
  description:
    'Browse hardware, software and IT services. Filter by category, price and availability.',
  title: 'Products',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  // Deep-linking from a category card, e.g. /products?category=laptops
  const categoryParam = params.category
  const slug = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam

  let initialCategoryIds: string[] = []
  let heading = 'All products'
  let intro = 'Everything we supply and install. Filter to narrow things down.'

  if (slug) {
    const category: Category | null = await getCategoryBySlug(slug)

    if (category) {
      // Selecting a parent must include its sub-categories (spec FR-002).
      initialCategoryIds = await getCategoryWithDescendantIds(category.id)
      heading = category.title
      intro = category.description
    }
  }

  const categoryNames = Object.fromEntries(
    categories.map((category) => [category.id, category.title]),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{heading}</h1>
        <p className="text-muted-fore mt-2 max-w-prose leading-relaxed">{intro}</p>
      </header>

      <CatalogueBrowser
        categories={categories}
        categoryNames={categoryNames}
        initialCategoryIds={initialCategoryIds}
        products={products}
      />
    </div>
  )
}
