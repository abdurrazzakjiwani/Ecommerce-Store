import Link from 'next/link'

import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <div>
        <p className="text-muted-fore font-display text-sm font-semibold uppercase tracking-wide">
          404
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold md:text-4xl">
          We could not find that page
        </h1>
        <p className="text-muted-fore mt-3 leading-relaxed">
          The link may be out of date, or the item may no longer be published.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/products">Browse the catalogue</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Ask us directly
        </ButtonLink>
      </div>

      <Link className="text-muted-fore text-sm underline underline-offset-4" href="/">
        Back to the homepage
      </Link>
    </div>
  )
}
