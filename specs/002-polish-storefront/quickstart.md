# Quickstart: Storefront Polish and Professional Upgrade

Verification and deployment runbook for feature 002. Follow in order — several gates are
deliberately sequenced so an earlier failure is cheaper to diagnose than a later one.

> **Windows**: this machine's PowerShell execution policy blocks `npm.ps1`. Invoke npm as
> **`npm.cmd`** throughout (Constitution, operational constraints).

## Prerequisites

```bash
npm.cmd --version          # 24.x LTS toolchain
node --version
```

Expected baseline on a clean branch: **58 tests passing**, typecheck and lint clean, build
producing 23 static pages.

## 1. Install the one new dependency

```bash
npm.cmd install embla-carousel-autoplay@8.6.0
```

**Verify the pin took.** The package declares `peerDependencies: { embla-carousel: "8.6.0" }` —
an exact version, not a range (`research.md` D3). Confirm no peer warning appears, and that
`package.json` pins it exactly rather than with a caret:

```bash
npm.cmd ls embla-carousel embla-carousel-autoplay embla-carousel-react
```

Expect all three at **8.6.0**.

## 2. Run the standing gates

```bash
npm.cmd test          # unit + component
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

A green build is **not** evidence that the site advertises the right address — see step 6.
Build requires a database connection (Constitution, operational constraints); without Neon,
expect the build to fail at static generation and that is a known, deferred state, not a
regression from this release.

## 3. Verify the brand contrast (do this by measurement, not by eye)

```bash
npm.cmd test -- contrast
```

The measurements in `research.md` D2 are the acceptance values. Confirm they still hold:

| Pair | Expected | Meaning |
|---|---|---|
| `#25D366` on `#FFFBEB` | **1.91** — FAILS | The mark must never sit on cream |
| `#25D366` on `#075E54` | **3.87** — passes UI | Legal placement |
| `#FFFFFF` on `#075E54` | **7.67** — passes AA | Button label |

If the first row ever changes, the token contract in `contracts/composition-contract.md` is
violated. Re-measure before changing anything.

## 4. Manual visual and interaction checklist

### Cards
- [ ] Product cards: imagery, category, availability, name, summary, price-or-quote, add-to-basket — in that order
- [ ] Article cards: imagery, category, publication date, title, summary, read action — and **no price, no quote state, no add-to-basket**
- [ ] Category cards: consistent radii and type, but visibly subordinate to products (FR-016)
- [ ] A quote-status product shows no figure anywhere (FR-011)
- [ ] One product has **no imagery**: still reachable, labelled placeholder, no broken frame
- [ ] Long titles and large prices hold their shape without overflow (FR-010)

### Carousel — item detail pages only
- [ ] Open an item with 2+ images: cycling starts within 5 seconds
- [ ] **Open the catalogue: no card image moves on its own**
- [ ] Pause control is visible, keyboard-operable, 44×44 minimum, with visible focus
- [ ] **Pause, then move the pointer away: it stays paused** (FR-019 — the one most likely to be broken)
- [ ] Drag the carousel after pausing: it does **not** restart itself
- [ ] OS reduced motion on: cycling never starts, manual controls still work
- [ ] Item with >5 images: first five cycle, remainder reachable as thumbnails, none dropped
- [ ] Current position is announced to assistive tech

### Brand
- [ ] Official mark, not the generic speech bubble
- [ ] Mark is never on the cream surface
- [ ] Keyboard focus order reaches every control with a visible ring

### Behaviour frozen (FR-038 / SC-013)
- [ ] Add to basket works
- [ ] Checkout opens WhatsApp with the **same** message as before
- [ ] Delivery form, filters, search, contact form all behave as they did

## 5. Performance gate (SC-016)

Test on a **mid-range phone over a throttled connection**:

- [ ] LCP ≤ 2.5s
- [ ] CLS ≤ 0.1 — measure specifically while a full page of cards loads
- [ ] INP ≤ 200ms

CLS on a full grid of 24 cards is the condition this release is most likely to break, and it
is the one FR-024 exists to prevent. If CLS regresses, space is not being reserved for imagery
before load.

## 6. Address correctness — assert the built output, not the build

The root cause is that `NEXT_PUBLIC_SERVER_URL` is unset in the Vercel project, so
`sitemap.ts:7` and `robots.ts:4` both fall back to `http://localhost:3000`
(`research.md` D5).

```bash
npm.cmd run build
# then assert the generated files contain the production host and no other host
```

The built `sitemap.xml` and `robots.txt` must contain `yourecommercestore.vercel.app` and must
**not** contain `localhost` or `ecommerce-storefront-phi.vercel.app` (deleted, returns 404).

## 7. Deploy

```bash
vercel --prod --yes
```

- [ ] `vercel.json` still contains `"framework": "nextjs"` — load-bearing, it fixed an earlier
      mis-detection that served `public/` and produced 404s
- [ ] Post-deploy: `NEXT_PUBLIC_SERVER_URL` set on the project, or the assertion in step 6
      cannot pass

## 8. Post-deploy verification

```bash
curl -sI https://yourecommercestore.vercel.app | Select-String 'HTTP'
```

Check the **production alias**, not a preview URL. Some recent deployment URLs returned a Vercel
login wall (`research.md` D6), and a preview-scoped protection setting would not show on the
alias — verifying the preview would produce a false green.

- [ ] Site returns 200, correct `<title>`, no login wall
- [ ] `https://yourecommercestore.vercel.app/robots.txt` names only the production host
- [ ] `https://yourecommercestore.vercel.app/sitemap.xml` names only the production host
- [ ] Every route 200: `/`, `/products`, a product detail page, `/blog`, `/about`, `/contact`, `/privacy`
- [ ] WhatsApp button renders the official mark and opens a `wa.me` link with a digits-only number
- [ ] Catalogue shows ~24 products, blog shows 8 articles
- [ ] Old domain `ecommerce-storefront-phi.vercel.app` still 404s

## Known deferred states

Not regressions from this release:

- `/admin` returns 500 — no database provisioned
- Contact form does not deliver email — no Resend credentials
- Image uploads unavailable — no S3/Blob credentials

## Rollback

Presentational only, so revert is a redeploy of the previous commit. No migration, no schema
change, no data to restore. The only environment change to undo is
`NEXT_PUBLIC_SERVER_URL`.
