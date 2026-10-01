# API Contracts: Storefront Polish and Professional Upgrade

## No contract changes

This release introduces **no new endpoint, changes no existing endpoint, and changes no request
or response shape.** It is a presentational release over a fixture-backed read layer.

Verified against the current surface:

| Surface | Status this release |
|---|---|
| Payload REST API (`/api/products`, `/api/posts`, …) | Unchanged — not called by the storefront |
| Custom routes (`/api/enquiry`, `/api/contact`) | Unchanged — frozen by FR-038 |
| `src/lib/catalog.ts` read layer | Unchanged — signatures identical |
| `src/lib/whatsapp.ts` link builder | Unchanged — frozen by FR-038 |
| Contact form submission | Unchanged — excluded from scope |

## What the storefront actually calls

No HTTP at all. Every page reads through the local read layer, which currently returns fixture
data and is designed to become a Payload Local API call without changing any signature:

```text
getSiteSettings()          → SiteSettings
getCategories()            → Category[]
getProducts()              → Product[]
getPosts()                 → Post[]
getProductBySlug(slug)     → Product | null
getPostBySlug(slug)        → Post | null
```

This is why the plan needs no contract document beyond this statement, and why the database
swap remains a one-file change.

## Composition contracts

The new work is component-level, so the meaningful contracts are the props and the tokens
rather than endpoints. These are the interfaces components agree on.

### `ProductGallery` — modified

```ts
type ProductGalleryProps = {
  images: string[]
  title: string              // accessible name for the carousel region
  autoPlay?: boolean         // DEFAULT false — see contract note below
  maxCycledImages?: number   // default 5
}
```

**Contract on `autoPlay`.** The default is `false`, and this is load-bearing rather than
incidental. `ProductCard` passes `false` explicitly; only the item detail page passes `true`. A
future contributor adding a carousel to a card must opt **in** to motion, so FR-015's
prohibition survives contact with someone who has not read the specification. See
`research.md` D4.

**Contract on excess images.** `images` may contain more than `maxCycledImages`. The first five
cycle; the remainder must remain reachable as thumbnails. No image is ever dropped
(FR-017, edge case).

### `WhatsAppIcon` — new

```ts
type WhatsAppIconProps = {
  size?: number              // default 24, rendered width and height
  className?: string
  title?: string             // when absent the icon is aria-hidden
}
```

**Contract on colour.** The mark is never recoloured — the `fill` is fixed at `#25D366` inside
the component, and `className` may not override it. Meta's guidelines prohibit it, and
`research.md` D2 measured that every legal placement already passes against a white or teal
field. Any future change to the path data or the fill must re-run the contrast measurement
first.

**Contract on accessibility.** Decorative by default (`aria-hidden`); a `title` promotes it to
an accessible image. The visible label lives in the button, not the icon, so a
`title` duplicates text for screen reader users unless the icon is genuinely standalone.

### Design tokens — extended

Added to `globals.css` beside the existing tokens:

```css
--color-whatsapp: #25D366;        /* brand green. The mark only. Never a background. */
--color-whatsapp-deep: #075E54;   /* teal. Backgrounds behind the mark. */
```

**Contract.** `--color-whatsapp` is for the mark's fill and nothing else. Measured against the
cream surface `#FFFBEB` it is **1.91:1** and fails, so using it as a background is a contract
violation with a recorded number behind it (`research.md` D2). The frozen accent `#B45309` and
its rejected neighbour `#D97706` are untouched.

## Deployment-time contract

Not an API, but an interface that fails silently if ignored:

```text
NEXT_PUBLIC_SERVER_URL = https://yourecommercestore.vercel.app
```

Consumed by `src/app/sitemap.ts:7` and `src/app/robots.ts:4`. Both currently fall back to
`http://localhost:3000` when it is unset, which is why the deployed site advertises an address
that is not itself (`research.md` D5). A green build does **not** prove this is right — the
build passes today while emitting unusable addresses, so the assertion is made against the
built output.
