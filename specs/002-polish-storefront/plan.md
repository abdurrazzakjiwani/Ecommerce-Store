# Implementation Plan: Storefront Polish and Professional Upgrade

**Branch**: `002-polish-storefront` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/sp.specify`, clarified by `/sp.clarify` (4 decisions, session 2026-10-01)

> **Constitution provenance note.** The Constitution Check below is answered against a
> constitution reconstructed on 2026-10-01. PHR-001 recorded ratifying v1.0.0 on that date,
> and feature 001's `plan.md` contains a completed Check executed against those six
> principles - but `.specify/memory/constitution.md` was never written to disk. It held 22
> placeholders from the initial Specify template commit and was the only version ever
> committed. The user approved reconstruction from PHR-001, feature 001's Check, and
> `AGENTS.md` rather than planning against no governance at all. Every principle below is
> therefore evidenced by a surviving record, not invented for this feature. If any
> reconstructed clause turns out to be wrong, this plan's Check is the thing that was wrong.

## Summary

Turn a working prototype into a client-presentable site. This is a **presentational release
with a behavioural freeze**: 42 functional requirements change how the site looks, and one
requirement (FR-038) plus one success criterion (SC-013) exist to prove nothing else changed.

Six workstreams, in dependency order:

1. **Brand mark** - replace `MessageCircle` with the official WhatsApp SVG. A genuine brand
   conflict exists and is resolved by measurement, not assertion: Meta forbids recolouring the
   mark, but brand green `#25D366` on cream measures ~2.3:1 and fails AA, while white on
   official light green measures ~2.2:1. Neither a loose green icon nor a light-green button
   is acceptable. The resolution is chosen in Phase 0 by computing ratios.
2. **Type scale** - keep `Space Grotesk` + `DM Sans`, refine sizes, tracking, wrapping, and
   add tabular figures for prices.
3. **Cards** - full redesign for products and articles; consistency-only for categories,
   which must stay visually subordinate.
4. **Carousel** - `embla-carousel-autoplay` on **item detail pages only**. Cards never
   auto-advance. Every image cycles up to five, remainder reachable as thumbnails. Manual
   pause is sticky.
5. **Content** - expand to ~24 products and 8 articles via the existing fixture seam.
6. **Deploy** - fix the stale-domain defect in `robots.txt` and `sitemap.xml`, then verify
   and deploy to `yourecommercestore.vercel.app`.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (pinned; `latest` is 7.0.2, the native-compiler
rewrite) on Node.js 24.16.x (24.x LTS)
**Primary Dependencies**: Next.js 16.3.8, Payload 3.90.2, Tailwind CSS 4.3.3, Embla Carousel
React 8.6.0, **embla-carousel-autoplay 8.6.0 (new)**, Zod 4.6.5, react-hook-form 7.89.0,
Zustand 5.0.15, lucide-react, sharp 0.35.5. `embla-carousel-autoplay` version is pinned to
match `embla-carousel-react` exactly - Embla plugins are version-locked to their core.
**Storage**: N/A for this release. No database; content flows through the existing
`src/lib/catalog.ts` fixture seam, and that seam MUST NOT be widened.
**Testing**: Vitest 5.0.3 with @testing-library/react 16.3.3 for pure-function and component
coverage; manual verification checklist for visual, accessibility, and performance gates
**Target Platform**: Node.js 24 on Vercel; mobile browsers at 375px baseline, desktop at
1440px
**Project Type**: web (single application: storefront, API, admin)
**Performance Goals**: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on a mid-range phone over a slow
connection. CLS is measured specifically while a full page of cards loads (SC-016), because
that is the condition this release is most likely to break.
**Constraints**: Light theme only, no dark palette. `cacheComponents` stays disabled.
Payload ≥ 3.83.0. TypeScript pinned to 5.9.3. Vercel needs `clientUploads: true` plus
bucket CORS on `PUT`. Build requires a database connection. WhatsApp numbers digits-only.
`npm.cmd`, never `npm` - PowerShell's execution policy blocks `npm.ps1`.
**Scale/Scope**: 6 user stories, 42 functional requirements, 16 success criteria, ~24
products, 8 articles, 2 actors (visitor, owner)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answered explicitly against the reconstructed v1.0.0 constitution. A FAIL blocks Phase 0; a
justified deviation goes in Complexity Tracking, never left unexplained.

- [x] **I. Single Deployable, Merchant-Owned Platform** - PASS with one new obligation. No new
  business string is introduced by this release; the WhatsApp mark is a **brand asset**, not a
  business value, so it is correctly a code constant rather than a `site-settings` field.
  Everything else - the number, recipient, social links - continues to resolve from the
  global. Verified: no hardcoded value is added.
- [x] **II. Contact-First Conversion, No Payment Gateway** - PASS. No gateway is introduced,
  removed, or reshaped. FR-038 explicitly freezes the checkout message. The button treatment
  changes; the link it produces does not.
- [x] **III. Flexible Schema, Deferred Specifics** - PASS. Catalogue expansion writes through
  the existing `catalog.ts` seam and introduces no schema change. The three deferred seams -
  `customers`, `orders.customer`, single token source - are untouched. Provisional placeholder
  content stays self-evidently provisional (SC-010), and no business name is inferred.
- [x] **IV. Durable Assets and Secret Hygiene** - PASS. No upload path changes, so the
  durability ordering constraint is unaffected. Worth stating explicitly for this release:
  it adds **no** new public write surface, no new endpoint, and no new form.
- [x] **V. Accessibility and Evidence-Based Design** - PASS, and this is where the release is
  under most pressure. Auto-cycling content is a WCAG 2.2.2 obligation, not a risk to note in
  passing, so FR-015 through FR-024 encode a visible pause control, reduced-motion opt-out,
  pointer and focus pause, and a sticky manual pause. SVG not emoji is satisfied by using the
  official mark. Light-only is preserved. The new measurable obligation is SC-016, and the
  brand conflict is resolved against a recorded ratio rather than taste.
- [x] **VI. External Verification and Verbatim Traceability** - PASS. Phase 0 verifies the
  official mark against `cdn.simpleicons.org` and the autoplay plugin's API against its own
  published documentation. Both are recorded in `research.md` with sources, not recalled.
- [x] **Pinned Stack** - PASS. `embla-carousel-autoplay@8.6.0` is pinned to match
  `embla-carousel-react@8.6.0` exactly rather than floated. TypeScript stays at 5.9.3.
- [x] **Testing Discipline** - PASS. The new pure functions (contrast ratio computation,
  icon path data) are unit-tested. Cycling state transitions are component-tested for
  start, pause, resume, sticky-pause, and reduced-motion. FR-038 and SC-013 require the
  frozen flows to be walked end to end.

**Out-of-scope confirmation**: `spec.md` EXCLUDES searching, filtering, the basket, the
delivery form, the checkout message, and the contact form. Each is named individually, and
FR-038 plus SC-013 make that freeze testable rather than implicit.

**Gate result: PASS.**
### Post-design re-check (after Phase 1)

Re-run against the design now that Phase 0 measurement and Phase 1 contracts exist.

- [x] **V. contrast is evidence, not assertion** - PASS. `research.md` D2 records computed
  luminance ratios for all eight candidate treatments. The two treatments a reader would reach
  for first (green on cream, white on green) measure **1.91** and **1.98** and fail; the chosen
  teal carries white labels at **7.67**. The number is unit-testable, so the decision cannot
  silently rot.
- [x] **V. auto-cycling obligation is implemented, not deferred** - PASS. FR-015 to FR-024 are
  mapped to the plugin's verified API in `research.md` D3, including the finding that the
  plugin restarts after interaction and therefore **cannot** express FR-019. The requirement
  is owned by component state instead, and the state machine is documented in `data-model.md`.
- [x] **V. cards cannot regress into motion** - PASS. `autoPlay` defaults to `false` and
  `ProductCard` passes it explicitly, so FR-015's card prohibition is a prop default rather
  than a review comment (`contracts/composition-contract.md`).
- [x] **VI. every external fact has a live source** - PASS. Mark path and fill fetched from
  `cdn.simpleicons.org` (HTTP 200); autoplay version, MIT licence, and the **exact** peer
  dependency read from the npm registry; plugin options and the `play`/`stop` method surface
  read from v8.6.0 documentation. Contrast ratios computed in-session.
- [x] **I. no business identity hardcoded** - PASS. The WhatsApp mark is recorded as a brand
  asset and a code constant, explicitly not a `site-settings` field, because exposing it in
  the CMS would let the merchant recolour a mark the guidelines forbid changing. That is a
  narrowing of Principle I, not a violation of it.
- [x] **III. schema untouched** - PASS. `data-model.md` records every entity as inherited and
  unchanged. No type is redeclared, so there is no second source of truth to drift, and the
  deferred seams (`customers`, `orders.customer`, single token source) are untouched.
- [x] **IV. no new write surface** - PASS. This release adds no endpoint, no form, and no
  upload path. `contracts/composition-contract.md` exists to record that absence
  affirmatively rather than by omission.
- [x] **VI. the known unrecoverable domain defect is addressed at its cause** - PASS. D5
  identifies the unset environment variable rather than the hardcoded string, and the
  quickstart asserts against built output. A green build does not prove this, which is why the
  check is written to read the artifact.
- [x] **Constitution reconstruction** - PASS with a recorded caveat. The constitution this plan
  is gated against was reconstructed on 2026-10-01 with the user's explicit approval, from
  PHR-001, feature 001's completed Check, and `AGENTS.md`. Every clause is evidenced by a
  surviving record. It is flagged in the file header for amendment if any clause proves wrong.
  An ADR is still owed for "Payload as sole backend" and remains deferred by user decision.

**Post-design gate result: PASS.** Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-polish-storefront/
├── plan.md              # This file (/sp.plan output)
├── spec.md              # Feature specification, with 4 recorded clarifications
├── research.md          # Phase 0 output - contrast measurements, plugin API, domain fix
├── data-model.md        # Phase 1 output - entities, fixture shape, no schema change
├── quickstart.md        # Phase 1 output - verify and deploy
├── contracts/           # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality validation
└── tasks.md             # Phase 2 output (/sp.tasks) - NOT created here
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (payload)/              # Payload admin + API. Scaffolded - do not hand-edit
│   └── (frontend)/             # Storefront routes
│       ├── globals.css         # Design tokens. WhatsApp brand values land here
│       ├── layout.tsx          # Font loading (Space Grotesk + DM Sans)
│       ├── page.tsx            # Homepage
│       ├── products/           # Catalogue + item detail
│       ├── blog/
│       ├── about/  contact/  privacy/
│       ├── robots.ts           # Sitemap URL source - fix stale domain
│       └── sitemap.ts          # Sitemap URL source - fix stale domain
├── components/
│   ├── brand/
│   │   └── WhatsAppIcon.tsx    # NEW. Official mark, 24x24 viewBox, no recolour
│   ├── product/
│   │   ├── ProductCard.tsx     # Redesign. Images never auto-advance
│   │   ├── ProductGallery.tsx  # Autoplay + pause, item pages only
│   │   └── ProductGrid.tsx     # Card layout + reserved image space (FR-024)
│   ├── article/
│   │   └── ArticleCard.tsx     # NEW. Same standard as ProductCard (FR-015)
│   ├── category/
│   │   └── CategoryCard.tsx    # Consistency only, stays subordinate (FR-016)
│   ├── layout/
│   │   ├── WhatsAppButton.tsx  # Replace MessageCircle with WhatsAppIcon
│   │   ├── Header.tsx  Footer.tsx
│   │   └── CyclingControl.tsx  # NEW. Visible pause/resume, FR-016..FR-019
│   └── ui/                     # Shared primitives
├── lib/
│   ├── catalog.ts              # Fixture seam. MUST NOT widen
│   ├── fixtures/data.ts        # EXPANDED: ~24 products, 8 articles
│   ├── whatsapp.ts             # Link builder. UNCHANGED (FR-038)
│   ├── contrast.ts             # NEW. WCAG ratio math, so colour is measured
│   ├── motion.ts               # NEW. prefers-reduced-motion reader
│   └── placeholder-image.ts    # Local SVG generation, no network
├── collections/                # 9 content types. UNCHANGED this release
├── globals/SiteSettings.ts     # Business identity. UNCHANGED
└── tests/                      # Vitest - covers src/lib and new components

payload.config.ts               # S3 plugin, upload limits. UNCHANGED
next.config.mjs                 # cacheComponents stays off
vercel.json                     # "framework": "nextjs" - load-bearing, keep
tests/                          # Pure-function and component tests
```

**Structure decision**: single Next.js application, unchanged from feature 001. This release
adds no new package, no route group, and no backend surface. Three new component files
(`WhatsAppIcon`, `ArticleCard`, `CyclingControl`) and two new lib functions (`contrast`,
`motion`) are the entire structural delta. Keeping the delta this small is deliberate: a
presentational release is exactly the wrong time to reorganise directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Reconstruction of `.specify/memory/constitution.md` (2026-10-01) | PHR-001 recorded ratifying v1.0.0, and feature 001's `plan.md` contains a completed Check executed against those six principles, but the file itself was never written - it held 22 placeholders from the initial Specify template and was never modified in any commit | Planning with no constitution would have left the gate unanswerable; treating PHR-001's *description* of the principles as authoritative is exactly the inference Principle III forbids. Reconstructed from three surviving records and flagged in the header for amendment if wrong. |
| TypeScript pinned to 5.9.3, not `latest` 7.0.2 | `latest` is the native-compiler rewrite, a breaking change requiring its own validation | **DEFERRED by user on 2026-10-01** for the original feature; the pin still stands and is unchanged here. Revisit before the first production deploy. |
| ADR: "Payload as sole backend" | Sole-backend architecture | **DEFERRED by user on 2026-10-01.** Governance requires consent before an ADR is created and consent was withheld, so the ADR is correctly *not* created. The decision is fully recorded in feature 001's `research.md` (D3, D4, D5) and `data-model.md`. |
