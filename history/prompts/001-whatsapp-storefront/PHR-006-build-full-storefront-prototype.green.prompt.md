---
id: PHR-006
title: Build Full Storefront Prototype
stage: green
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 001-whatsapp-storefront
branch: 001-whatsapp-storefront
user: abdurrazzakjiwani
command: sp.implement
labels: [storefront, prototype, whatsapp, cart, accessibility, fixtures, payload-schema, seo]
links:
  spec: specs/001-whatsapp-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - src/lib/types.ts
 - src/lib/catalog.ts
 - src/lib/fixtures/data.ts
 - src/lib/whatsapp.ts
 - src/lib/filters.ts
 - src/lib/address.ts
 - src/lib/currency.ts
 - src/lib/cart-store.ts
 - src/lib/cn.ts
 - src/components/ui/Button.tsx
 - src/components/ui/Field.tsx
 - src/components/ui/Badge.tsx
 - src/components/ui/Sheet.tsx
 - src/components/layout/Header.tsx
 - src/components/layout/Footer.tsx
 - src/components/layout/StorefrontShell.tsx
 - src/components/layout/SiteSettingsProvider.tsx
 - src/components/layout/WhatsAppButton.tsx
 - src/components/product/ProductImage.tsx
 - src/components/product/PriceTag.tsx
 - src/components/product/ProductGallery.tsx
 - src/components/product/ProductCard.tsx
 - src/components/product/ProductGrid.tsx
 - src/components/product/ProductPurchase.tsx
 - src/components/cart/CartLine.tsx
 - src/components/cart/CartDrawer.tsx
 - src/components/cart/AddressForm.tsx
 - src/components/filters/CatalogueBrowser.tsx
 - src/components/contact/ContactForm.tsx
 - src/app/(frontend)/layout.tsx
 - src/app/(frontend)/page.tsx
 - src/app/(frontend)/not-found.tsx
 - src/app/(frontend)/products/page.tsx
 - src/app/(frontend)/products/[slug]/page.tsx
 - src/app/(frontend)/blog/page.tsx
 - src/app/(frontend)/blog/[slug]/page.tsx
 - src/app/(frontend)/about/page.tsx
 - src/app/(frontend)/contact/page.tsx
 - src/app/(frontend)/privacy/page.tsx
 - src/app/robots.ts
 - src/app/sitemap.ts
 - src/collections/Categories.ts
 - src/collections/Products.ts
 - src/collections/Orders.ts
 - src/collections/Messages.ts
 - src/collections/Posts.ts
 - src/collections/Customers.ts
 - src/access/publishedOrAuthenticated.ts
 - src/globals/SiteSettings.ts
 - src/payload.config.ts
 - src/tests/whatsapp.test.ts
 - src/tests/filters.test.ts
 - scripts/generate-placeholders.ps1
 - public/media/*.svg (29 files)
 - specs/001-whatsapp-storefront/tasks.md
tests:
 - "npm run typecheck - PASS, 0 errors"
 - "npm run lint - PASS, 0 errors (fixed useCallback-after-return, setState-in-effect x2, refs-in-render)"
 - "npm run test - PASS, 58/58 across 3 files"
 - "npm run build - PASS, 23 static pages, 9 products + 3 posts prerendered"
 - "HTTP probe of all 11 routes on a production server - PASS, all 200; unknown product correctly 404"
 - "Homepage content assertions - PASS: business name, real WhatsApp number 923394299873, products, quote items present; zero dark: classes"
---

## Prompt

### Request under execution

User instruction: *"now implement and complete all phases, Leave the database for now;
we'll look into it later. You focus on designing the website so you can show the
prototype to the client."*

This is a deliberate, explicit scope change from the plan. It reorders the priority
from "correct backend" to "a demonstrable, well-designed prototype", and defers the
database rather than working around a missing one.

## Response snapshot

**137 of 140 tasks complete. All gates green. Every route verified serving real
content.**

Final state: typecheck 0 errors, lint 0 errors, 58/58 tests, build produces 23 static
pages. Verified against a running production server: all 11 public routes return 200
with substantial HTML, an unknown product slug correctly returns 404, and the homepage
contains the business name, the real WhatsApp number `923394299873`, product titles
and quote items, with zero `dark:` classes.

### The central design decision: a one-file seam

The instruction to leave the database raised an obvious problem - if every component
reads content from Payload's Local API, nothing renders without a database and there
is no prototype to show. The alternative, hardcoding content into components, would have
thrown away the entire data layer the previous four phases produced.

Instead, all reads funnel through **`src/lib/catalog.ts`**, currently backed by
`src/lib/fixtures/data.ts`. It is the only module permitted to import `getPayload` or
`@payload-config`, and when Neon is provisioned the change is confined to that file.
Component signatures, props and rendering stay identical. The fixtures deliberately
span all three pricing presentations and include an item with no images, so every
branch the schema supports is reviewable in the prototype.

This is the payoff of having planned the seam in `api-contract.md` before the data
layer existed.

### Bugs my own tests caught

**A real off-by-one in phone normalisation.** `normalisePakistaniPhone('00923001234567')`
returned the input unchanged. The `0092` branch tested `length === 15`, but `0092` plus
a 10-digit local number is 14. Anyone dialling with an international prefix would have
had a mangled number in the enquiry message the business receives.

**Two wrong test expectations, fixed rather than the code.** `Intl.NumberFormat` rounds
paisa rather than truncating, so `185000.6` renders `Rs 185,001` - rounding is correct
for money, and my comment saying "dropped" was wrong. Separately, a filter test asserted
a result that ignored a fixture's default price. In both cases the implementation was
right and the expectation was the defect.

### Lint caught genuine React defects

These were not style complaints:

- **`useCallback` called after an early return** in `ProductGallery`, a real
  rules-of-hooks violation that would break on any render where the image list changed
  length between renders.
- **`setState` synchronously inside an effect**, twice. In `Header` the cause was
  Zustand's `subscribe` firing on registration; the correct fix was
  `useSyncExternalStore`, which also eliminated the hydration mismatch by supplying a
  server snapshot. In `CatalogueBrowser` the cause was an effect mirroring state on
  every keystroke; fixed by debouncing through a single timer instead.
- **A ref read during render** in `ContactForm`, replaced with state.

### Embla v8 does not match the common pattern

Worth recording because it cost two correction rounds. Embla v8's `OptionsType` has no
`onSelect`; events are instance methods (`emblaApi.on('select', ...)`). I wrote the
v9-style options form, which typecheck correctly rejected. The fix subscribes to
`select` and `reInit` in an effect *without* a synchronous setState, which also
satisfies the lint rule.

### Two architectural corrections found by building

**`Footer` was a server component calling a client-only context hook**, which crashed
prerendering of `/about`. The better fix than adding `'use client'` was passing
`settings` as a prop, keeping the footer server-rendered and shipping no JavaScript for
static content.

**`robots.ts` must live at the app root, not inside a route group.** `sitemap.ts` in the
same folder worked, so this was not obvious; `robots.txt` 404ed and was absent from the
build output while `sitemap.xml` was present. Moving both to `src/app/` fixed it. Caught
only because I probed the route rather than trusting the build's exit code.

### Placeholder imagery, generated offline

29 SVG files produced by `scripts/generate-placeholders.ps1` - cream-toned panels with
the product name and frame number. No external placeholder service, so the demo renders
identically with no network, which matters when demonstrating in an office. Frame numbers
make the carousel visibly scrollable to a client.

### Accessibility choices, not compliance theatre

Every card is 44x44px minimum. Form errors attach with `aria-describedby` and
`role="alert"`. The carousel announces "Image 2 of 4" through a polite live region, so
position is not conveyed by dot colour alone. The basket count is also a live region, so
a screen-reader user hears "added to basket" without hunting for the change. The Sheet
traps focus, closes on Escape, and restores focus to the invoking control. There is no
`prefers-color-scheme` block anywhere, so a visitor whose OS is dark finds nothing to
switch to and the cream theme cannot be inverted out from under the brand.

### Payload schema is written and ready

All eight collections and the `SiteSettings` global are authored, with access control in
both directions, the `priceType` invariant enforced in a `beforeValidate` hook,
whatsappNumber normalised to digits on write, honeypot and timing guards on `Messages`,
and drafts that are invisible to anonymous requests. When the database arrives the
schema needs no work - only the `catalog.ts` swap and the enquiry/contact endpoints.

## Outcome

- ✅ Impact: A complete, navigable, accessible storefront that can be shown to a client
  today. Catalogue with filters and search, product pages with scrollable galleries,
  basket with WhatsApp checkout and a live message preview, contact form, blog, about,
  privacy, and the whole admin schema ready for when a database exists.
- 🧪 Tests: 58/58 unit tests including 14 adversarial WhatsApp encoding cases. All
  four quality gates green. Every route verified by HTTP probe against a production
  build, not by inspection.
- 📁 Files: 56 created, plus 29 generated SVGs, plus the task list updated.
- 🔁 Next prompts: Three gates remain (T044, T045, T071), all requiring real Neon and
  Vercel accounts. After that, swap `src/lib/catalog.ts` to Payload and add the
  `/api/enquiry` and `/api/contact` endpoints.
- 🧠 Reflection: The most valuable decision was refusing to hardcode content into
  components to get a demo. That would have looked like progress and would have meant
  rewriting every page later. Confining the database coupling to one file cost a little
  discipline and preserved all the work of the previous four phases.

## Evaluation notes (flywheel)

- Failure modes observed: Seven real defects, of which the most instructive were the
  `robots.ts` route-group issue and the Embla v8 API mismatch. Both were invisible to
  typecheck and lint, and both were caught only by exercising the built application -
  `robots.txt` by an HTTP probe that returned 404, Embla by the compiler. This
  reinforces the earlier finding from PHR-005: build success is not proof of runtime
  behaviour, and the checks that matter are the ones performed against a running server.
  Two of the seven were my own test expectations being wrong, which is the third time in
  this project that writing the assertion first was more error-prone than the code.
- Graders run and results: PASS - typecheck clean; PASS - lint clean; PASS - 58/58 tests;
  PASS - build produces 23 static pages; PASS - 11/11 routes return 200; PASS - unknown
  slug returns 404 rather than leaking existence; PASS - no dark-mode classes emitted.
- Prompt variant (if applicable): Not an empty-input variant. The user gave an explicit
  scope change that overrode a plan the previous four phases had produced, and the
  correct response was to adapt the plan rather than ask them to confirm the deviation.
- Next experiment (smallest change to try): Ask the user to open the prototype and click
  through the basket checkout on a real phone. The message preview, the WhatsApp handoff
  and the address form are the parts most likely to feel wrong on a small screen, and they
  are also the parts a client will try first. That feedback is worth more before the
  database work than another self-review.