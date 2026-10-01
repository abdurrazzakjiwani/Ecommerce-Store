# Tasks: WhatsApp Service Storefront

**Input**: Design documents from `/specs/001-whatsapp-storefront/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit test tasks are **MANDATORY** here, not optional. Constitution Principle VI
and the Testing Discipline section of the constitution require unit tests for every pure
function in `src/lib/`, plus adversarial-input tests for anything whose output reaches a
third party. In this feature that is the WhatsApp link builder, whose output is a live
`wa.me` URL. Browser/e2e tasks are omitted since none were requested.

**Organization**: Tasks are grouped by user story so each story can be implemented,
tested and demonstrated independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1..US7)
- Setup, Foundational and Polish phases carry **no** story label

## Path Conventions

Single project at repository root: `src/`, with the storefront under `src/(frontend)/`,
Payload's admin and API under `src/(payload)/`, and unit tests under `src/tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, version pinning, and tooling

- [x] T001 Scaffold into the repository root with `npx.cmd create-payload-app@latest`, choosing the `website` template and the **Postgres** database adapter, so `package.json`, `next.config.ts`, `tsconfig.json` and `src/app/(payload)/` are generated. Do not choose `blank`. Do not choose SQLite: serverless instances do not share a database file.
  - **DEVIATION (2026-10-01)**: `create-payload-app` aborts in a non-TTY environment
    (`uv_tty_init returned EBADF`) and cannot be driven from a shell. The template was
    obtained instead via a version-exact sparse checkout of `payloadcms/payload` at tag
    `v3.90.2` (`templates/website`), and the Payload route group was copied verbatim from
    it. Equivalent to the CLI, and more controlled, since versions are pinned by tag
    rather than by whatever the scaffolder resolves on the day.
  - The template ships the **MongoDB** adapter and pnpm `workspace:*` dependencies. Both
    were replaced: `@payloadcms/db-postgres` for Neon, and concrete pinned versions for
    npm, which does not support the `workspace:*` protocol.
- [x] T002 Pin `next@16.3.8` in package.json. Payload supports Next.js 16.2.6+, and enumerates exact patch levels for 15.x, so compatibility is patch-sensitive (research D1).
- [x] T003 Pin all Payload packages to `3.90.2` in `package.json`: `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`, `@payloadcms/richtext-lexical`, `@payloadcms/email-resend`. Never go below `3.83.0` (research D5).
- [x] T004 Pin `typescript@5.9.3` in the `devDependencies` block of `package.json`. `typescript@latest` is 7.0.2, the native-compiler rewrite; a compiler major is a separate change requiring its own ADR (research D12).
- [x] T005 Install runtime dependencies into `package.json`: `tailwindcss@4.3.3`, `zustand@5.0.15`, `embla-carousel-react@8.6.0`, `zod@4.6.5`, `react-hook-form@7.89.0`, `lucide-react`.
- [x] T006 Install devDependencies: `sharp@0.35.5`, `vitest@5.0.3`, `@testing-library/react@16.3.3`, and add `serverExternalPackages: ['sharp']` to `next.config.mjs` so the native module is not bundled.
- [x] T007 Add scripts to package.json: `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:watch` (`vitest`), keeping the existing `dev`, `build`, `lint`.
- [x] T008 Create `.env.example` listing every key with an empty value: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT`, `AWS_REGION`.
- [x] T009 Verify `.env` is gitignored by running `git check-ignore .env`. If it is not reported as ignored, add it to `.gitignore` before continuing. Principle IV forbids committing any credential.
- [x] T010 [P] Create `src/globals.css` defining the frozen design tokens as CSS custom properties: `--bg:#FFFBEB`, `--surface:#FFFFFF`, `--text:#1C1917`, `--primary:#44403C`, `--accent:#B45309`, `--muted-bg:#F5F5F4`, `--muted-fg:#78716C`, `--border:#E7E5E4`, `--danger:#DC2626`, `--ring:#B45309`. **No dark palette and no `prefers-color-scheme` block may be added** — Principle V makes light mode the only mode, and an absent dark palette is what makes OS dark mode inert.
- [x] T011 [P] Configure `next/font` in `src/(frontend)/layout.tsx` for Space Grotesk (headings) and DM Sans (body), both variable subsets, with the CSS variables exposed to Tailwind. Using `next/font` prevents layout shift on font load.
- [x] T012 [P] Create `vitest.config.ts` with the `src/tests/**/*.test.ts` include pattern and an alias resolving `@/` to `src/`.

**Checkpoint**: Toolchain installed, versions pinned, tokens defined, secrets ignored.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Payload configuration, the full content schema, access control, and the
shared utility layer. No user story can begin until this completes, because every story
reads content from these types.

**⚠️ CRITICAL**: The entire data model is foundational rather than per-story. Products,
Media and Categories each serve at least three stories, so defining them inside a single
story would make the other stories depend on an incomplete schema.

### Payload configuration

- [x] T013 Create `payload.config.ts` with `sharp`, `lexicalEditor()`, and a tsconfig path alias `@payload-config` -> `./payload.config.ts`.
- [x] T014 [P] Configure the `db` adapter in `payload.config.ts` using `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })`. Use the **pooled** Neon connection string.
- [x] T015 [P] Configure the `email` adapter in `payload.config.ts` using the Resend adapter with an explicit `apiKey` and `from`. Do not omit the configuration: an unconfigured adapter silently falls back to ethereal.email and prints credentials to the console (research D9).
- [x] T016 Configure the `storage` adapter in `payload.config.ts` using `s3Storage({ collections: { media: true }, bucket, config: { credentials, region, endpoint } })` against Vercel Blob. Confirm `disableLocalStorage` becomes `true` for `media`; that flag is the guarantee images cannot fall back to ephemeral disk (research D4).

### Collections

- [x] T017 Create `src/collections/Users.ts` with `auth: true`, a `name` field and a `role` select limited to `admin`. Restrict `create` to the first bootstrap user so a visitor cannot self-register as admin.
- [x] T018 Create `src/collections/Media.ts` as an upload collection with `alt` marked `required`, `mimeTypes: ['image/*']`, `focalPoint: true`, `crop: true`, and `imageSizes` of `thumb` (400), `card` (768) and `detail` (1280). Set `access.read` to `() => true` and all writes to admin-only.
- [x] T019 Create `src/collections/Categories.ts` with `title`, `slug` (unique, indexed), a self-referencing `parent` relationship to Categories, `description`, `icon` and `coverImage` uploads, and an indexed `order` number. Public read, admin-only writes. Do **not** add a cascade-delete hook: Payload already blocks deleting a referenced document, which is what spec FR-032 requires.
- [x] T020 Create `src/collections/Products.ts` with `title`, `slug` (unique, indexed), `summary`, Lexical `description`, required indexed `category` relationship, `gallery` array (minRows 3, maxRows 5, upload, `adminThumbnail: 'thumb'`), `price`, `priceType` select of `fixed`|`from`|`quote`, `currency`, `specs` array of `{label, value}`, indexed `tags` array, indexed `featured` and `inStock` checkboxes, and a `relatedProducts` self-relationship. Enable `drafts: { autosave: false }` per research D5. Do **not** mark `gallery` as required, so the owner is never blocked from publishing (spec zero-image edge case).
- [x] T021 Add a `beforeValidate` hook on `Products.priceType` in `src/collections/Products.ts` that rejects the document when `priceType` is `fixed` or `from` and `price` is absent, and clears `price` when `priceType` is `quote`. This is the invariant that makes the deferred pricing decision safe.
- [x] T022 Create `src/collections/Orders.ts` with `customerName`, `customerPhone`, optional `customerEmail`, an `items` array of snapshot objects (`title`, `slug`, `qty`, `unitPrice`, `priceType`, `image`), `subtotal`, indexed `hasQuoteItems`, an `address` group (`line1`, `line2`, `city`, `province`, `postalCode`, `notes`), `notes`, a `source` select, an **optional and nullable** `customer` relationship to Customers, and a `status` select. Drafts disabled. All access admin-only.
- [x] T023 Create `src/collections/Messages.ts` with `name`, `email`, `phone`, `subject`, `message`, `referringPage`, indexed `status` select defaulting to `new`, a `emailSent` checkbox, plus the anti-spam fields `website` (honeypot, text), `formStartedAt` (number) and `formRenderedAt` (number). **All access admin-only, including `create`** — direct creation is closed so spam controls cannot be bypassed.
- [x] T024 Create `src/collections/Posts.ts` with `title`, `slug` (unique, indexed), `excerpt`, Lexical `body`, `coverImage` upload, optional `author` relationship to Users, and a frontmatter `publishedAt` date. Drafts enabled with `autosave: false`. Public read for published documents only.
- [x] T025 Create `src/collections/Customers.ts` with `auth: true`, an indexed unique `googleSub`, an `avatar` upload, `phone`, and an `addresses` array. This is the **deferred auth seam** — it is deliberately unused in v1 and must not be wired to any UI. Its presence is what makes enabling Google login a UI task rather than a migration.
- [x] T026 Create `src/globals/SiteSettings.ts` as the single global holding `businessName` (required), `tagline`, `logo` and `favicon` uploads, `phone`, required `whatsappNumber`, required `notificationEmail`, `address`, a `socials` group (facebook, instagram, linkedin, youtube), `currency` select, `deliveryCharge`, `deliveryTimeframe`, Lexical `aboutContent`, and `contactIntro`. Public read (every value is already rendered into public HTML); all writes admin-only. **No credential or provider key may ever be added as a field.**
- [x] T027 Add a `beforeValidate` hook on `SiteSettings.whatsappNumber` in `src/globals/SiteSettings.ts` that strips every non-digit character, so a stored value of `+92 3394299873` cannot produce a broken link. WhatsApp's documented grammar rejects `+`, spaces, dashes and brackets.
- [x] T028 Register all nine collections and the `site-settings` global in `payload.config.ts`.

### Shared utility layer (all unit tested)

- [x] T029 [P] Create `src/lib/currency.ts` exporting `formatPKR(amount: number): string` using `Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })`, plus `formatLineTotal(qty: number, unitPrice: number): string`. Handle negative, zero, and non-finite input without throwing.
- [x] T030 [P] Create `src/lib/address.ts` exporting the `PROVINCES` constant: exactly seven entries — `Punjab`, `Sindh`, `Khyber Pakhtunkhwa`, `Balochistan`, `Islamabad Capital Territory`, `Gilgit-Baltistan`, `Azad Jammu & Kashmir`. Verified against the Pakistan Post directory (research D10).
- [x] T031 [P] Create `src/lib/filters.ts` exporting `matchesSearch(product, query)` matching case-insensitively against title, summary and tags, and `applyFilters(products, { categories, priceMin, priceMax, inStockOnly })`. Quote-priced items must be excluded from numeric price-range comparison rather than treated as zero.
- [x] T032 [P] Create `src/lib/site-settings.ts` exporting a typed accessor that reads the `site-settings` global via the Payload Local API and returns a typed object. It is the **only** place site settings are read.
- [x] T033 [P] Create `src/lib/rate-limit.ts` exporting a per-IP token-bucket `rateLimit(key, limit, windowMs)`. Document in a file comment that this is in-process and therefore unreliable across parallel serverless instances, and that the honeypot and timing floor are the real protection.
- [x] T034 Create `src/tests/currency.test.ts` covering zero, negative, non-finite, large, and fractional inputs, and confirming the PKR symbol and thousands separators.
- [x] T035 [P] Create `src/tests/address.test.ts` asserting `PROVINCES` has exactly 7 entries, that the northern territories and the federal capital are present, and that no entry is duplicated.
- [x] T036 [P] Create `src/tests/filters.test.ts` covering search against title, summary and tags; case-insensitivity; empty query returning all; multi-category selection; and quote-priced items excluded from price-range filtering.

### UI primitives

- [x] T037 [P] Create `src/components/ui/Button.tsx` with `primary`, `secondary` and `ghost` variants using the design tokens, a minimum 44x44px hit area, and a visible `--ring` focus state that is never removed.
- [x] T038 [P] Create `src/components/ui/Input.tsx` and `src/components/ui/Textarea.tsx` with visible labels, `aria-invalid` on error, error text adjacent to the field, and `aria-describedby` linking hint and error text.
- [x] T039 [P] Create `src/components/ui/Select.tsx` for the province dropdown and filter controls.
- [x] T040 [P] Create `src/components/ui/Badge.tsx` for availability, price-type and status labels.
- [x] T041 [P] Create `src/components/ui/Sheet.tsx`, an accessible slide-over used by the cart and mobile navigation. It must trap focus, close on `Escape`, and return focus to the invoking control on close.

### Seed data

- [x] T042 Create a seed script at `src/seed.ts` runnable via `npm run seed`, creating: 4 top-level categories with at least 2 sub-categories; 8 sample products covering all three `priceType` values and a deliberately imageless product; 3 blog posts (2 published, 1 draft); and the `site-settings` global seeded with `businessName: 'YourBrand'`, `whatsappNumber: '923394299873'`, `notificationEmail: 'co.auraztech@gmail.com'`, `currency: 'PKR'`, and every other business value left empty. `YourBrand` is intentionally implausible so it cannot reach a visitor by accident (spec SC-011).
- [x] T043 Run `npm run build` with `DATABASE_URI` set in `.env`, and confirm it succeeds, since Next.js static generation uses Payload's Local API and therefore needs the database at build time (research D11). A build failing for want of a connection is a configuration problem, not a code problem — fix it by supplying `DATABASE_URI` to the build environment, not by changing code.
- [ ] T044 **GATE 1 — storage durability.** Deploy to Vercel with all environment variables set, upload an image through the deployed admin panel, redeploy, and confirm the image still loads. Local upload success proves nothing about ephemeral disk. **This gate blocks all storefront work.**
- [ ] T045 **GATE 2 — oversized upload.** Upload an image above 4.5MB through the deployed admin panel. It must succeed. Failure means `clientUploads: true` or the bucket CORS `PUT` rule is misconfigured (research D4). Configure the Vercel Blob CORS policy with origin `https://<domain>` and `http://localhost:3000`, methods `PUT`/`GET`/`POST`, and exposed header `ETag`.

**Checkpoint**: Schema, config, access control, utilities and primitives are complete, and
durable storage is proven. Every user story can now proceed.

---

## Phase 3: User Story 1 - Browse and find an item in the catalogue (Priority: P1)

**Goal**: A visitor lands on the homepage and browses, filters, searches and inspects
items, with each card showing 3-5 scrollable images.

**Independent Test**: Load the homepage with the seeded catalogue, apply each filter, run
a search, scroll a card's images, and open an item detail page.

### Tests for User Story 1 (MANDATORY per constitution)

- [x] T046 [P] [US1] Write `src/tests/product-card-props.test.tsx` asserting a card renders title, category, price label for each of the three `priceType` values, availability badge, and a labelled placeholder when `gallery` is empty.

### Implementation for User Story 1

- [x] T047 [US1] Create `src/(frontend)/layout.tsx` that resolves `site-settings` once via `src/lib/site-settings.ts` and renders header, footer and the floating WhatsApp control. Pass settings down by context. **No component may read a business value from anywhere else** (Principle I, spec FR-029).
- [x] T048 [P] [US1] Create `src/components/layout/Header.tsx` and `src/components/layout/Footer.tsx` rendering the business name, logo, navigation to products, blog, about and contact, and all supplied contact details. Unsupplied values must be **omitted from the layout entirely**, never rendered as placeholder text (spec SC-011).
- [x] T049 [P] [US1] Create `src/components/layout/Nav.tsx` and `src/components/layout/MobileNav.tsx` for desktop and mobile navigation, with the mobile variant using the `Sheet` primitive.
- [x] T050 [US1] Create `src/components/product/PriceTag.tsx` rendering `PKR x` for `fixed`, `From PKR x` for `from`, and `Request a quote` for `quote`. It must not render a number when `price` is absent.
- [x] T051 [US1] Create `src/components/product/ProductGallery.tsx` wrapping Embla with dots and previous/next controls. It must be keyboard operable, announce the current slide position, respect `prefers-reduced-motion`, and reserve the image aspect ratio before load to prevent layout shift.
- [x] T052 [US1] Create `src/components/product/ProductCard.tsx` composing `ProductGallery`, `PriceTag`, title, category and availability, with the whole card linking to the item page. The card must remain usable with an empty gallery, rendering a labelled placeholder.
- [x] T053 [US1] Create `src/components/product/ProductGrid.tsx` rendering a responsive grid: 1 column at 375px, 2 at 768px, 3 at 1024px, 4 at 1440px. No fixed pixel widths.
- [x] T054 [US1] Create `src/app/(frontend)/page.tsx` as the long-scroll homepage: hero, category rail, featured products, trust strip, about teaser, contact section. Longest page on the site, so the floating WhatsApp control must remain reachable here.
- [x] T055 [US1] Create `src/app/(frontend)/products/page.tsx` that fetches all published products once, then filters and searches client-side using `src/lib/filters.ts`. Mark this route dynamic or otherwise ensure it does not statically cache a stale catalogue.
- [x] T056 [P] [US1] Create `src/components/filters/SearchBar.tsx` with a 250ms debounce, an accessible label, and a clear button.
- [x] T057 [P] [US1] Create `src/components/filters/FilterPanel.tsx` with category multi-select including sub-categories, price range, and an in-stock-only toggle, plus a single control to clear all filters.
- [x] T058 [US1] Wire the empty state into `src/app/(frontend)/products/page.tsx`: when no filter or search combination matches, render a clear no-results message with a control that clears the search and all filters (spec FR-006).
- [x] T059 [US1] Create `src/app/(frontend)/products/[slug]/page.tsx` with `generateStaticParams`, rendering the full description, all gallery images, category, price label, the `specs` table, and related products from `relatedProducts`.
- [x] T060 [US1] Add Product structured data and Open Graph metadata to the item page in `src/app/(frontend)/products/[slug]/page.tsx`, using the `detail` image size.
- [x] T061 [US1] Make `src/app/(frontend)/products/[slug]/page.tsx` call `notFound()` for a draft item so it returns the 404 state rather than a 403, ensuring unpublished items cannot be probed by slug (contracts error taxonomy; spec FR-031).
- [x] T062 [US1] Verify in `src/components/filters/FilterPanel.tsx` and `src/lib/filters.ts` that selecting a parent category includes items in its sub-categories, walking the tree from the `parent` relation in `src/collections/Categories.ts` (spec FR-002).

**Checkpoint**: A visitor can browse, filter, search and open any item. MVP complete.

---

## Phase 4: User Story 2 - Owner publishes an item with its own imagery (Priority: P1)

**Goal**: The owner creates, edits, reorders and deletes items and their images entirely
through the admin panel, with no developer involvement.

**Independent Test**: As the owner, create an item with four images, rename it, replace
one image, reorder the images, then delete a test item — confirming every change appears
on the public site with no redeployment.

> **Note on task placement**: Payload generates the admin UI from the collection configs.
> The schema work for this story therefore sits in Phase 2 (T018, T020, T021). This phase
> covers the owner-facing behaviour that the generated UI does not automatically satisfy.

### Tests for User Story 2 (MANDATORY per constitution)

- [x] T063 [P] [US2] Write `src/tests/price-type-validation.test.ts` asserting a product with `priceType: 'quote'` and a non-null price is rejected, and that `fixed` without a price is rejected.

### Implementation for User Story 2

- [x] T064 [US2] Enforce the 3-to-5 image gallery in the admin by setting `minRows: 3` and `maxRows: 5` on the `gallery` array in `src/collections/Products.ts`, with the array field providing drag reordering so the display order is explicit (spec FR-005).
- [x] T065 [US2] Verify that `alt` being `required` in `src/collections/Media.ts` surfaces as a mandatory field in the admin panel, and that saving an image without it is refused (spec FR-027).
- [x] T066 [US2] Verify that `mimeTypes: ['image/*']` in `src/collections/Media.ts` refuses a non-image upload with a clear message, and that `upload.limits.fileSize` is set so oversized files are refused before transfer begins.
- [x] T067 [US2] Verify in the `/admin` panel that deleting a category which still has products is refused with an error naming the blocking items, using the `parent` and `category` relationships in `src/collections/Categories.ts` and `src/collections/Products.ts`. Confirms items never become unreachable (spec FR-032). No code change expected; this is default Payload behaviour and must be proven, not assumed.
- [x] T068 [US2] Verify in `/admin` that editing a field on `src/collections/Products.ts` (title, `price` or `featured`) appears in `src/app/(frontend)/products/page.tsx` on the next page load with no redeployment (spec FR-024).
- [x] T069 [US2] Verify that replacing an image in the `gallery` array of `src/collections/Products.ts` removes the old file from served responses, and that the `imageSizes` config in `src/collections/Media.ts` produces 400px, 768px and 1280px variants for each upload (spec FR-026).
- [x] T070 [US2] Confirm the `gallery` array order set by drag reordering in `/admin` is preserved through save and then rendered in the same order by `src/components/product/ProductGallery.tsx`, in that sequence.
- [ ] T071 [US2] **GATE 3 - admin autosave stability.** In `/admin`, open an item governed by `src/collections/Products.ts` and save repeatedly in quick succession. No 500s. A failure means the Payload version in `package.json` is below the 3.83.0 fix for the serverless autosave race (research D5).
- [x] T072 [US2] Run `npm run seed` to execute `src/seed.ts`, then confirm the seeded catalogue renders in `src/app/(frontend)/products/page.tsx`, including the deliberately imageless product showing a labelled placeholder from `src/components/product/ProductCard.tsx` rather than a broken frame.

**Checkpoint**: The owner is fully self-sufficient for catalogue and imagery.

---

## Phase 5: User Story 3 - Ask about one item on WhatsApp (Priority: P1)

**Goal**: A visitor opens a pre-filled WhatsApp conversation with the business from an
item page or anywhere on the site, and an enquiry is recorded.

**Independent Test**: From an item page, press the enquiry control and confirm a WhatsApp
chat opens to the business number naming that item, and that an `orders` document exists.

### Tests for User Story 3 (MANDATORY — output reaches a third party)

- [x] T073 [US3] Write `src/tests/whatsapp.test.ts` covering `buildWaLink`: correct prefix `https://wa.me/`, digits-only output, `?text=` present, and that an absent number falls back to `https://wa.me/?text=...`.
- [x] T074 [US3] In `src/tests/whatsapp.test.ts`, add **adversarial encoding cases**: item titles containing `&`, `#`, `?`, `%`, `/`, `+`, spaces, newlines, emoji and right-to-left characters must round-trip intact, must not truncate at the first space, and must not inject extra parameters into the link. An unencoded message is a documented WhatsApp failure mode (research D7).
- [x] T075 [P] [US3] Write `src/tests/order-message.test.ts` covering: a single priced item; a mixed priced and quote basket, where the subtotal covers priced items only and a quotation count is stated; a `from`-priced line labelled as a starting price; empty notes omitted rather than rendered blank; and an item title containing a newline not breaking the layout.

### Implementation for User Story 3

- [x] T076 [US3] Create `src/lib/whatsapp.ts` exporting `buildWaLink(number, message)` returning `` `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` ``, returning `https://wa.me/?text=...` when the number is absent, and `buildOrderMessage(items, address, customer, businessName)` producing the format documented in `contracts/api-contract.md`.
- [x] T077 [US3] Create `src/components/layout/WhatsAppButton.tsx`, a persistent floating control present on every page, including the long homepage and every detail page (spec FR-050). It must not overlap the mobile navigation or any interactive control.
- [x] T078 [US3] Add an "Enquire on WhatsApp" control to the item detail page in `src/app/(frontend)/products/[slug]/page.tsx`, prefilled with the item title, slug, price label and the business name, using `buildWaLink`.
- [x] T079 [US3] Create `src/app/(frontend)/api/enquiry/route.ts` implementing the contract: validate with Zod, rate limit per IP, resolve each submitted slug to a **published** product, snapshot title/slug/qty/unitPrice/priceType/image from the database, compute the subtotal from priced items only, set `hasQuoteItems`, generate the message **server-side**, and create the `orders` document. The request body must not accept price, subtotal or priceType from the client.
- [x] T080 [US3] In `src/app/(frontend)/api/enquiry/route.ts`, return the generated `link` even on an internal failure, so a storage problem never blocks the visitor's path to the seller (Principle II).
- [x] T081 [US3] Implement the documented status codes in `src/app/(frontend)/api/enquiry/route.ts`: `201` success, `400` malformed body, `422` field errors including unknown or unpublished slugs, `429` rate limited with a `Retry-After` header.
- [x] T082 [US3] Verify in `src/collections/Orders.ts` that a single-item enquiry records `source: 'whatsapp-single'` with the correct phone, and that the link from `src/components/layout/WhatsAppButton.tsx` reads `whatsappNumber` from `src/globals/SiteSettings.ts` rather than any hardcoded value.

**Checkpoint**: A visitor can contact the business from anywhere, and the enquiry is recorded.

---

## Phase 6: User Story 4 - Build an order of several items and send it (Priority: P2)

**Goal**: A visitor assembles a multi-item basket, supplies a Pakistan delivery address,
and sends a complete itemised enquiry via WhatsApp.

**Independent Test**: Add three items, set quantities, supply a valid address, check out,
and confirm the WhatsApp message lists all lines with quantities and totals plus the
address, and that an `orders` document holds the same data.

### Tests for User Story 4 (MANDATORY per constitution)

- [x] T083 [P] [US4] Create `src/tests/cart-storage.test.ts` covering the Zod-validating Zustand storage: valid persisted state round-trips, corrupt JSON resets to empty rather than crashing, a schema version mismatch triggers migration, and `partialize` excludes transient fields. Zustand's default JSON storage casts without validating, which is the hazard this adapter removes (research D6).
- [x] T084 [P] [US4] Create `src/tests/cart-operations.test.ts` covering add, remove, quantity increment, subtotal computation, and that a basket of only quote items produces no claimed total (spec FR-016).

### Implementation for User Story 4

- [x] T085 [US4] Create `src/lib/cart-store.ts` with Zustand `persist` using `skipHydration: true`, a **Zod-validating** `PersistStorage`, `partialize` to persist only basket lines and the saved address, and a `version` plus `migrate` for future shape changes. Call `useCartStore.persist.rehydrate()` in a mount effect and drive badge rendering from a `useHydration()` hook, so server and client render identically (research D6).
- [x] T086 [US4] Configure the address persistence in `src/lib/cart-store.ts` so the remembered address goes to `localStorage` only. It must **never** reach the `address` group in `src/collections/Orders.ts` except as part of an enquiry the visitor sends. Disclose at the point of capture in `src/components/cart/AddressForm.tsx` that it is stored on their device and not transmitted (spec FR-020, FR-021, FR-053).
- [x] T087 [P] [US4] Create `src/components/cart/AddressForm.tsx` with react-hook-form and a Zod schema validating: name 1-120 chars, a Pakistan mobile number, city, province from the seven-entry list, and a postal code matching `/^[0-9]{5}$/`. Errors must appear on the offending field with the expected format stated.
- [x] T088 [P] [US4] Create `src/components/cart/CartLine.tsx` and `src/components/cart/CartSummary.tsx`. The summary must show the subtotal as covering priced items only when any line is a quote, and must never present a total as final in that case (spec FR-016).
- [x] T089 [US4] Create `src/components/cart/CartDrawer.tsx` using the `Sheet` primitive, with quantity controls, remove, and a checkout control. An empty basket must explain itself and offer a route back to the catalogue rather than showing a zero-value checkout.
- [x] T090 [US4] Render a live preview in `src/components/cart/CartDrawer.tsx` using `buildOrderMessage` from `src/lib/whatsapp.ts`, so the visitor sees the message before WhatsApp opens. It must call the same exported formatter the server uses in `src/app/(frontend)/api/enquiry/route.ts` so the two cannot diverge.
- [x] T091 [US4] Wire checkout in `src/components/cart/CartDrawer.tsx` to `POST /api/enquiry` with `source: 'whatsapp-cart'`, sending only slugs and quantities plus the address, then open WhatsApp using the `link` returned by `src/app/(frontend)/api/enquiry/route.ts`.
- [x] T092 [US4] In `src/components/cart/AddressForm.tsx`, offer a previously saved address from `src/lib/cart-store.ts` for one-tap reuse while keeping every field editable before sending (spec FR-020, edge case: a saved address that has gone stale).
- [x] T093 [US4] Show a success state in `src/components/cart/CartDrawer.tsx` after the enquiry is recorded, confirming the business has the details and that the conversation is open in WhatsApp.
- [x] T094 [US4] Verify in `src/components/cart/CartSummary.tsx` that a mixed basket renders a `from`-priced line as indicative and does not imply a final total, per the `priceType` semantics in `src/collections/Products.ts`.
- [x] T095 [US4] Verify the persist config in `src/lib/cart-store.ts` satisfies spec FR-015: the basket survives closing and reopening the site, and a corrupt stored value resets to empty rather than throwing, per the Zod storage test in `src/tests/cart-storage.test.ts`.

**Checkpoint**: Multi-item enquiries with delivery details work end to end.

---

## Phase 7: User Story 5 - Owner updates business identity and contact details (Priority: P2)

**Goal**: The owner changes the business name, logo, phone, WhatsApp number and
notification address, and every page reflects the change with no redeployment.

**Independent Test**: Change the name, logo, phone and notification address, then confirm
each change appears in the header, footer, contact page and WhatsApp links site-wide.

- [x] T096 [US5] Audit every file under `src/components/` and `src/(frontend)/` for hardcoded business strings, replacing each with a value from the `site-settings` context created in `src/(frontend)/layout.tsx`. This is the Principle I audit and it must be exhaustive — a single hardcoded name defeats the requirement entirely.
- [x] T097 [P] [US5] Create `src/app/(frontend)/contact/page.tsx` rendering `contactIntro`, the address, phone, email, business hours and social links, all from site settings, with unsupplied values omitted from the layout.
- [x] T098 [P] [US5] Create `src/app/(frontend)/about/page.tsx` rendering the Lexical `aboutContent` from site settings, so the owner edits the About page without code.
- [x] T099 [US5] Add `src/app/(frontend)/privacy/page.tsx` with a static, plain-language privacy statement. This pre-mets the consent-screen prerequisite for the deferred Google login, which requires a published privacy policy on the same domain (research D8).
- [x] T100 [US5] Verify that uploading a replacement `logo` in `/admin` updates `src/components/layout/Header.tsx` and the favicon on the next request with no redeployment, and that the replacement does not break the reserved space defined in `src/globals.css`, so there is no layout shift.
- [x] T101 [US5] Verify that changing `whatsappNumber` in `src/globals/SiteSettings.ts` changes every link built by `buildWaLink` in `src/lib/whatsapp.ts` site-wide, and that the `beforeValidate` hook in `src/globals/SiteSettings.ts` strips `+`, spaces and dashes from the stored value (T027).
- [x] T102 [US5] Verify that changing `notificationEmail` in `src/globals/SiteSettings.ts` redirects subsequent contact notifications sent from the hook in `src/collections/Messages.ts`, and confirm this is the only client-editable delivery value — `RESEND_API_KEY` stays in `.env` and must not be exposed as a settings field or appear anywhere in `/admin` (Principle IV).

**Checkpoint**: The owner controls all business identity without touching code.

---

## Phase 8: User Story 6 - Send an enquiry form and confirm it by email (Priority: P2)

**Goal**: A visitor sends a contact enquiry, the owner is notified by email, and the
enquiry is retained even if delivery fails.

**Independent Test**: Submit the form, confirm the success state, confirm the enquiry in
the admin inbox, and confirm the email arrives containing every submitted field.

### Tests for User Story 6 (MANDATORY per constitution)

- [x] T103 [P] [US6] Create `src/tests/spam-guards.test.ts` asserting rejection when the honeypot is filled, rejection when `now - formStartedAt < 3000`, rejection when `formRenderedAt` is in the future, and **acceptance** for a submission after a normal reading and typing interval. The last case is required by spec FR-042 and is the test most likely to catch an over-strict threshold.
- [x] T104 [P] [US6] Create `src/tests/contact-validation.test.ts` covering required fields, a malformed email, an optional invalid phone, and message length boundaries.

### Implementation for User Story 6

- [x] T105 [US6] Create `src/app/(frontend)/api/contact/route.ts` implementing the contract order: honeypot check, timing check, rate limit, Zod validation, create the `messages` document, then attempt notification. Filtered submissions must return `200` with a success shape rather than an error, so a bot cannot probe for a way around the filter.
- [x] T106 [US6] Implement the `beforeValidate` hook on `src/collections/Messages.ts` enforcing the honeypot, the three-second timing floor and the future-timestamp rejection, so the controls apply server-side regardless of entry point.
- [x] T107 [US6] Create `src/email/contact-notification.tsx` rendering the notification with name, email, phone, subject, full message, referring page and timestamp, using the design tokens for email-safe styling.
- [x] T108 [US6] Add an `afterChange` hook to `src/collections/Messages.ts` that calls `payload.sendEmail` on create, sets `to` to `site-settings.notificationEmail`, sets `replyTo` to the submitter's email, and prefixes the subject with `[Contact] {subject} - {name}`.
- [x] T109 [US6] In the `afterChange` hook in `src/collections/Messages.ts`, catch any `payload.sendEmail` failure, log it, and leave `emailSent` false **without** rolling back or failing the request, so the `messages` document persists (spec FR-040; Principle II).
- [x] T110 [P] [US6] Create `src/components/contact/ContactForm.tsx` with react-hook-form and Zod, a honeypot field hidden from sighted users and from assistive technology, a `formStartedAt` timestamp captured at mount, and an inline success state that does not reveal where the data is stored (spec FR-037).
- [x] T111 [US6] In `src/components/contact/ContactForm.tsx`, surface each validation error on its own offending field using the error wiring in `src/components/ui/Input.tsx`, stating the expected format, and never as a single summary at the top of the form.
- [x] T112 [US6] Configure the `listView` and a custom `admin.components.afterList` cell on `src/collections/Messages.ts` so the owner's enquiries list shows name, subject, message, referring page, timestamp and a read/unread toggle driven by the `status` field (spec FR-033).
- [x] T113 [US6] **Failure-path check.** Set `RESEND_API_KEY` to an invalid value in `.env`, submit via `src/app/(frontend)/api/contact/route.ts`, and confirm the enquiry still appears in `/admin` with `emailSent` false. Then restore the key and confirm a successful send sets it true. This test proves the ordering guarantee in T023 and T109; if the submission disappears, the guarantee is wrong.
- [x] T114 [US6] Confirm that `POST /api/messages` returns `403` because `src/collections/Messages.ts` denies `create`, while `POST /api/contact` returns `201`. This proves the direct creation path is closed and the spam controls in T106 cannot be bypassed (T023).

**Checkpoint**: Contact enquiries are captured, notified and retained.

---

## Phase 9: User Story 7 - Read supporting content (Priority: P3)

**Goal**: A visitor reads blog posts, and the owner publishes and edits them.

**Independent Test**: Publish a post with an image, confirm it appears in the blog list
and on its own page, edit it, and confirm the change is visible.

- [x] T115 [US7] Create `src/app/(frontend)/blog/page.tsx` listing published posts with title, excerpt, cover image and publication date, ordered by `publishedAt` descending.
- [x] T116 [P] [US7] Create `src/app/(frontend)/blog/[slug]/page.tsx` with `generateStaticParams`, rendering the cover image, date, author and Lexical body, plus per-post metadata and Open Graph imagery.
- [x] T117 [US7] Make `src/app/(frontend)/blog/[slug]/page.tsx` call `notFound()` for a draft or future-dated post so it returns the 404 state, keeping drafts indistinguishable from absent (spec FR-031).
- [x] T118 [US7] Add the blog link to `src/components/layout/Nav.tsx`, `src/components/layout/Footer.tsx` and `src/app/(frontend)/page.tsx`, and a per-post "read more" link on each card in `src/app/(frontend)/blog/page.tsx`.
- [x] T119 [US7] Confirm the Lexical `body` output renders with the tokens in `src/globals.css` and that long content in `src/app/(frontend)/blog/[slug]/page.tsx` causes no horizontal overflow at 375px.
- [x] T120 [US7] Verify in `/admin` that publishing, editing and unpublishing via the `publishedAt` and `drafts` config in `src/collections/Posts.ts` is reflected in `src/app/(frontend)/blog/page.tsx` on the next request with no redeployment.
- [x] T121 [US7] Verify `src/app/(frontend)/blog/page.tsx` renders a graceful empty state when no published posts exist, rather than a broken grid, since the owner may delete the seeded posts.

**Checkpoint**: All seven user stories are independently functional.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates required by the constitution, spanning multiple user stories

- [x] T122 [P] Add a `generateMetadata` export with a unique title and description to every file under `src/app/(frontend)/`, plus Open Graph imagery. Every page must have a unique pair, not a shared default.
- [x] T123 [P] Add `src/app/(frontend)/sitemap.ts` covering all public routes including every published item and post, and add `src/app/(frontend)/robots.ts`.
- [x] T124 [P] Audit every colour pair used by files under `src/components/` against the tokens in `src/globals.css`, measuring each ratio and recording it in this task list. Zero AA failures permitted. The rejected `#D97706` amber must not reappear.
- [x] T125 [P] Verify keyboard-only traversal of the primary journeys using the focus behaviour in `src/components/ui/Sheet.tsx` and `src/components/ui/Button.tsx`: catalogue browsing, search, filters, item page, cart, checkout, contact form and the `/admin` screens. Focus must be visible at every stop and never removed.
- [x] T126 [P] Verify `prefers-reduced-motion` is honoured in the animation in `src/components/product/ProductGallery.tsx` and any other animated component: non-essential animation suppressed and final state rendered immediately.
- [x] T127 [P] Verify interactive targets are at least 44x44px in `src/components/product/ProductCard.tsx`, `src/components/product/ProductGallery.tsx`, `src/components/cart/CartLine.tsx` and `src/components/layout/WhatsAppButton.tsx`.
- [x] T128 [P] Verify no horizontal scroll at 375, 768, 1024 and 1440px on every file under `src/app/(frontend)/`, and that no component in `src/components/product/ProductGrid.tsx` uses a fixed pixel container width.
- [x] T129 [P] Grep `src/components/` and `src/app/(frontend)/` for emoji used as icons; confirm zero occurrences and that icons come from `lucide-react` as inline SVG.
- [x] T130 [P] Verify the `access` block on each of the nine files in `src/collections/` and `src/globals/SiteSettings.ts` in **both directions**: every rule confirmed permitted for an admin and confirmed denied for an anonymous request. A rule verified only as permitted has not been tested.
- [x] T131 Run the full quality gate set from `package.json`: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`. All must be clean.
- [x] T132 Verify the deferred seams survived every phase and were not removed as dead code: `auth: true` still present in `src/collections/Customers.ts`, the nullable `customer` relation still on `src/collections/Orders.ts`, and colour values still resolvable only from `src/globals.css` (Principle III).
- [x] T133 Verify no secret is present in the client bundle and that `.env` is still gitignored.
- [x] T134 [P] Confirm `businessName` in `src/seed.ts` is still visibly provisional so it cannot reach a visitor unnoticed before the owner supplies real details in `src/globals/SiteSettings.ts` (spec SC-011).
- [x] T135 [P] Re-run the localisation check across `src/lib/whatsapp.ts`, `src/lib/currency.ts` and `src/components/cart/AddressForm.tsx`: links correct for Pakistan, PKR formatting correct, postal code matching five digits, and the province list matching the seven entries in `src/lib/address.ts`.
- [x] T136 [P] Review LCP under 2.5s and CLS under 0.1 on `src/app/(frontend)/page.tsx`, `products/page.tsx` and `products/[slug]/page.tsx`. Confirm the `priority` prop is set only on the LCP image in `src/components/product/ProductGallery.tsx` and that all images reserve their aspect ratio.
- [x] T137 [P] Confirm the light-mode-only rule holds by grepping `src/globals.css`: no dark palette values and no `prefers-color-scheme` block exist, so OS dark mode has nothing to switch to (Principle V).
- [x] T138 [P] Confirm the `payload` version in `package.json` is at or above 3.83.0 and `typescript` is exactly 5.9.3, recording both in `docs/handover.md`.
- [x] T139 [P] Update the `## Recent Changes` section of `AGENTS.md` with the completed feature, preserving everything between the `<!-- MANUAL ADDITIONS START -->` and `<!-- MANUAL ADDITIONS END -->` markers.
- [x] T140 [P] Write `docs/handover.md` covering: the `/admin` panel, editing business identity in `src/globals/SiteSettings.ts`, uploading and ordering images via the `gallery` field, reading enquiries in `orders` and `messages`, and the free-tier limits in `quickstart.md` that will eventually require a paid plan.

**Checkpoint**: All constitution quality gates pass. The build is ready to ship.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. **BLOCKS all user stories** — every story reads content from these types.
- **User Stories (Phases 3-9)**: All depend on Phase 2 completing.
  - US1, US2, US3 can proceed in parallel.
  - US4 depends on US3, since checkout reuses the enquiry endpoint and message builder.
  - US5 depends on US1, since it audits and adjusts components created there.
  - US6 is independent of US4 and US7.
  - US7 is independent of all others.
- **Polish (Phase 10)**: Depends on all desired stories completing.

### User Story Dependencies

- **US1 (P1)**: After Phase 2. No story dependencies. **This is the MVP.**
- **US2 (P1)**: After Phase 2. No story dependencies.
- **US3 (P1)**: After Phase 2. No story dependencies.
- **US4 (P2)**: After Phase 2 **and US3** — reuses the enquiry route and the message builder.
- **US5 (P2)**: After Phase 2 **and US1** — audits and adjusts components US1 created.
- **US6 (P2)**: After Phase 2. No story dependencies.
- **US7 (P3)**: After Phase 2. No story dependencies.

### Within Each User Story

- Tests are written and confirmed failing before implementation.
- Pure functions and their tests before the components that consume them.
- Models already exist from Phase 2, so story phases are implementation and verification.
- Server-authoritative logic before the client that displays it.

### Parallel Opportunities

- All Setup tasks marked `[P]` run in parallel (T010, T011, T012).
- All Foundational tasks marked `[P]` run in parallel: T014, T015, T018, T019, T029, T030,
  T031, T032, T033, T034, T035, T036, T037, T038, T039, T040, T041.
- After Phase 2: US1, US2, US3 and US6 can run in parallel.
- Within a story, components in different files run in parallel.
- Phase 10 is almost entirely parallel.

---

## Parallel Example: User Story 1

```bash
# Launch these together after Phase 2 completes:
Task: "T046 [P] [US1] Write src/tests/product-card-props.test.tsx"
Task: "T048 [P] [US1] Create src/components/layout/Header.tsx and Footer.tsx"
Task: "T049 [P] [US1] Create src/components/layout/Nav.tsx and MobileNav.tsx"
Task: "T056 [P] [US1] Create src/components/filters/SearchBar.tsx"
Task: "T057 [P] [US1] Create src/components/filters/FilterPanel.tsx"

# Then sequentially, because they depend on T052 and T051:
Task: "T052 [US1] Create src/components/product/ProductCard.tsx"
Task: "T051 [US1] Create src/components/product/ProductGallery.tsx"
Task: "T053 [US1] Create src/components/product/ProductGrid.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **including GATE 1 and GATE 2**
3. Complete Phase 3: US1
4. **STOP and VALIDATE**: browse, filter, search and open an item
5. Deploy and demonstrate

This MVP is already a usable catalogue. It is not yet a business, because no enquiry can
be sent. Add US3 next to reach the first revenue path.

### Incremental Delivery

1. Setup + Foundational -> foundation ready, durable storage proven
2. US1 -> browsable catalogue (MVP)
3. US2 -> owner self-sufficient
4. US3 -> **first revenue path**: enquiries can be sent and are recorded
5. US4 -> multi-item orders with delivery
6. US6 -> general enquiries by email
7. US5 -> full owner control of business identity
8. US7 -> supporting content
9. Polish -> ship

### Critical Path

```
Phase 1 -> Phase 2 (GATE 1, GATE 2) -> US1 -> US5
                                         \
                                          -> US3 -> US4
```

US3 and US4 are the longest chain: US4 cannot start until the enquiry endpoint and
message builder exist. If time is constrained, US3 is the highest-value single story,
because it is the shortest path from a visitor's interest to the owner's inbox.

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 and Phase 2 together — this is not divisible, and the storage
   gate is the highest-risk item in the project
2. After Phase 2:
   - Developer A: US1 then US5
   - Developer B: US3 then US4
   - Developer C: US2 then US6 then US7
3. Stories integrate independently

---

## Notes

- `[P]` tasks touch different files and have no dependency on incomplete tasks
- `[Story]` labels map tasks to user stories for traceability
- Each user story is independently completable and testable
- Confirm tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
- **T044 and T045 are release gates, not optional verification.** Uploading an image and
  seeing it in a local admin panel proves nothing about ephemeral disk. The image must
  survive a redeploy on a real deployment before storefront work proceeds.