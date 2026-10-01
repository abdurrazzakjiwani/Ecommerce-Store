# Tasks: Storefront Polish and Professional Upgrade

**Input**: Design documents from `specs/002-polish-storefront/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/composition-contract.md`, `quickstart.md`
**Tests**: Included. Not optional here — Constitution (Testing Discipline) requires unit tests for every pure function in `src/lib/`, and the post-design gate in `plan.md` commits to unit-testing the contrast math and component-testing the cycling state machine.

**Tests must FAIL before implementation passes.** No production test infrastructure exists — `src/tests/` holds three files (`currency`, `filters`, `whatsapp`) and Vitest is already installed and green at 58 tests, so there is nothing to stand up.

## Format: `[ID] [P?] [Story] Description`

`- [ ]` checkbox → task ID → `[P]` only if parallelizable (different files, no dependency on incomplete tasks) → `[USn]` on user-story tasks only → exact file path.

## Path Conventions

All paths are absolute from repo root `D:\Abdur Razzak Jiwani Docs\ecommerce_website`.

- `src/app/(frontend)/` — storefront routes and `globals.css`. Parentheses are literal.
- `src/components/` — `brand/`, `product/`, `article/`, `category/`, `layout/`, `ui/`
- `src/lib/` — pure functions, unit-tested
- `src/tests/` — Vitest. Co-located with the lib module it covers, named `<module>.test.ts`
- `public/placeholders/` — 29 existing generated SVGs

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: the one new dependency, and the two pure functions that make the brand decision testable.

- [ ] T001 Install `embla-carousel-autoplay@8.6.0` pinned exactly in package.json and verify `npm.cmd ls embla-carousel embla-carousel-autoplay embla-carousel-react` reports 8.6.0 for all three — the plugin's peerDependency is an exact version, not a range (research.md D3)
- [ ] T002 [P] Create `src/lib/contrast.ts` with `relativeLuminance(hex: string): number` and `contrastRatio(fg: string, bg: string): number` using the WCAG 2.x formula; accept 3- and 6-digit hex with or without `#`, and throw on invalid input rather than returning a plausible wrong number
- [ ] T003 [P] Write `src/tests/contrast.test.ts` asserting the measured values from research.md D2: `#25D366` on `#FFFBEB` = 1.91, `#25D366` on `#075E54` = 3.87, `#FFFFFF` on `#075E54` = 7.67, plus identical-colour = 1 and invalid hex throws. **Must fail before T002.**
- [ ] T004 [P] Create `src/lib/motion.ts` exposing `prefersReducedMotion(): boolean` reading the `prefers-reduced-motion: reduce` media query, SSR-safe (no `window` access during render)
- [ ] T005 [P] Write `src/tests/motion.test.ts` asserting the media query is read and that a missing API returns `false` rather than throwing. **Must fail before T004.**
- [ ] T006 Record the two brand tokens in `src/app/(frontend)/globals.css` as `--color-whatsapp: #25D366` and `--color-whatsapp-deep: #075E54`, with a comment recording that the first is for the mark's fill only and measures 1.91:1 on cream, so it must never be a background. Do not touch the frozen accent `#B45309` or rejected `#D97706`
- [ ] T007 Verify the frozen accent `#B45309` (4.91:1) and all other existing tokens are unchanged in `src/app/(frontend)/globals.css` — constitution freezes the token set

**Checkpoint**: `npm.cmd test` green with the two new test files passing, T002/T004 implemented. `npm.cmd run typecheck` clean.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the shared brand component and the carousel capability that three stories depend on. Nothing here is user-visible on its own.

- [ ] T008 Create `src/components/brand/WhatsAppIcon.tsx` with the verified official path data from research.md D1, `viewBox="0 0 24 24"`, `fill="#25D366"` hardcoded inside the component. Props: `size?: number` (default 24), `className?: string`, `title?: string`. Decorative (`aria-hidden`) when `title` is absent, accessible image when present. `className` must not be able to override the fill
- [ ] T009 Create `src/components/layout/CyclingControl.tsx` — visible pause/resume button, min 44×44, keyboard-operable with visible focus ring, driven by a `paused: boolean` and `onToggle` prop. Label and pressed state come from **our** props, never read back from the plugin, because the plugin exposes only `play`/`stop` and no `isPlaying` (research.md D3)
- [ ] T010 Add `userPaused` state ownership contract to `src/components/product/ProductGallery.tsx`: an `autoPlay?: boolean` prop defaulting to `false`, and a local flag that nothing may clear except an explicit resume action. Document with a comment that the plugin restarts itself after any interaction when `stopOnInteraction: false`, so sticky pause cannot be delegated (research.md D3). Component is not yet wired to autoplay — that is T019
- [ ] T011 Verify `src/lib/whatsapp.ts` is byte-for-byte unchanged (`git diff --stat src/lib/whatsapp.ts` returns empty) — FR-038 freezes the link builder and its adversarial tests

**Checkpoint**: `npm.cmd run typecheck` and `npm.cmd run lint` clean. No visual change yet.

---

## Phase 3: User Story 1 - Visitor recognises the WhatsApp channel instantly (Priority: P1) 🎯 MVP

**Goal**: every WhatsApp control shows the official mark on a distinguishable, accessible treatment.

**Independent test**: visit every page offering contact; confirm the official mark and a distinct treatment everywhere, with no generic speech-bubble symbol remaining.

**Note**: five files import `MessageCircle` today — `WhatsAppButton.tsx`, `page.tsx` (x3), `CartDrawer.tsx`, `ProductPurchase.tsx`, `contact/page.tsx`. All must change or the story fails its own test.

- [ ] T012 [P] [US1] Replace `MessageCircle` with `WhatsAppIcon` and apply the teal treatment in `src/components/layout/WhatsAppButton.tsx` — background `--color-whatsapp-deep`, white label text (7.67:1), unmodified brand-green mark (3.87:1)
- [ ] T013 [US1] Replace `MessageCircle` with `WhatsAppIcon` on the floating standalone mark in `src/components/layout/WhatsAppButton.tsx`, pairing the mark with a white circular field and teal ring so it never sits on cream (research.md D2, FR-005)
- [ ] T014 [P] [US1] Replace `MessageCircle` with `WhatsAppIcon` in `src/components/product/ProductPurchase.tsx`
- [ ] T015 [P] [US1] Replace `MessageCircle` with `WhatsAppIcon` in `src/components/cart/CartDrawer.tsx`
- [ ] T016 [P] [US1] Replace all three `MessageCircle` occurrences with `WhatsAppIcon` in `src/app/(frontend)/page.tsx`
- [ ] T017 [P] [US1] Replace both `MessageCircle` occurrences with `WhatsAppIcon` in `src/app/(frontend)/contact/page.tsx`
- [ ] T018 [US1] Verify no `MessageCircle` import remains anywhere in src/ — `Select-String -Path 'src/**/*.tsx' -Pattern 'MessageCircle'` returns nothing. Also confirm each control's accessible name is meaningful rather than "image" (US1 scenario 4)
- [ ] T019 [US1] Confirm the WhatsApp link each control produces is unchanged from the pre-release behaviour, per FR-038, by re-running `npm.cmd test -- whatsapp` against `src/lib/whatsapp.ts` and manually opening one generated `wa.me` URL

**Checkpoint**: run `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run lint`. Story is demonstrable — this is the MVP.

---

## Phase 4: User Story 2 - Visitor evaluates products confidently from cards (Priority: P1)

**Goal**: consistent, professional product cards; article cards to the same standard; category cards subordinate.

**Independent test**: browse the catalogue at phone, tablet and desktop widths; confirm every card shows the same elements in the same order, nothing clipped or overlapping.

- [ ] T020 [P] [US2] Write `src/tests/product-card.test.ts` asserting a quote-status product renders no price figure anywhere, a priced product renders its figure, and cards expose add-to-basket as a separately operable control that does not trigger navigation (FR-008, FR-011, FR-013). **Must fail before T024.**
- [ ] T021 [P] [US2] Redesign `src/components/product/ProductCard.tsx` to the fixed element order: imagery, category, availability, name, summary, price-or-quote-status, add-to-basket (FR-008)
- [ ] T022 [US2] Reserve a fixed aspect box for card imagery in `src/components/product/ProductCard.tsx` via the shared grid, so images cannot shift layout on load (FR-024, and the CLS half of SC-016)
- [ ] T023 [US2] Add hover, focus-visible and pressed states plus a minimum 44×44 touch target to every card control in `src/components/product/ProductCard.tsx` (FR-012, FR-014)
- [ ] T024 [P] [US2] Create `src/components/article/ArticleCard.tsx` to the same standard, presenting imagery, category, publication date, title, summary and a read action — and rendering no price, no quote state and no add-to-basket action (FR-015)
- [ ] T025 [US2] Add a labelled placeholder for a null `coverImage` in `src/components/article/ArticleCard.tsx` (US5 scenario 4 covers the product equivalent; articles share the nullable shape)
- [ ] T026 [P] [US2] Create `src/components/category/CategoryCard.tsx` sharing the card radii, spacing and type, but visually subordinate to product cards (FR-016)
- [ ] T027 [US2] Clamp long titles and summaries so card height stays consistent and text shortens cleanly without overflow in `src/components/product/ProductCard.tsx` (FR-010)
- [ ] T028 [P] [US2] Apply the new `ArticleCard` in `src/app/(frontend)/blog/page.tsx` and the article listing
- [ ] T029 [P] [US2] Apply the new `CategoryCard` in `src/components/product/ProductFilters.tsx` or wherever category tiles render
- [ ] T030 [US2] Verify `src/components/product/ProductCard.tsx` and `src/components/product/ProductGrid.tsx` at 375px, 768px and 1440px with no clipped, overlapping or truncated-to-nothing content (FR-009), and confirm card images do **not** auto-advance (FR-015, via the `autoPlay={false}` default from T010)

**Checkpoint**: `npm.cmd test` green including `product-card.test.ts`.

---

## Phase 5: User Story 3 - Visitor sees item images cycling, and can stop them (Priority: P1)

**Goal**: cycling on item detail pages only, with a pause that actually stays paused.

**Independent test**: open an item with two or more images; confirm cycling starts within five seconds, the pause control is visible and works, and movement stops on hover, focus and manual pause.

- [ ] T031 [P] [US3] Write `src/tests/cycling.test.ts` covering the full state machine in `data-model.md`: starts when 2+ images; does **not** start with 1 image; does **not** start under reduced motion; pauses on pointer enter; pauses on focus in; **stays paused after a manual pause followed by pointer-out and by a subsequent drag**; resumes only on explicit resume; images beyond five remain reachable and none are dropped. **Must fail before T035.**
- [ ] T032 [US3] Wire the autoplay plugin into `src/components/product/ProductGallery.tsx` with `playOnInit: false`, `delay: 5000` (SC-004's five-second ceiling), `stopOnFocusIn: true`, and our own pointer handling — **not** the plugin's interaction-restart path (research.md D3)
- [ ] T033 [US3] Call `play()` only when `!userPaused && !prefersReducedMotion()`, and never while `userPaused` is true, in `src/components/product/ProductGallery.tsx` (FR-019)
- [ ] T034 [US3] Render `CyclingControl` in `src/components/product/ProductGallery.tsx` and suppress both carousel and control entirely when `images.length < 2` or `images.length === 0` (FR-021, FR-022, edge cases)
- [ ] T035 [US3] Announce the current position in the image set to assistive technology in `src/components/product/ProductGallery.tsx`, e.g. "image 2 of 4" (FR-020, US3 scenario 5)
- [ ] T036 [US3] Cycle the first five images and render any remainder as reachable thumbnails in `src/components/product/ProductGallery.tsx`, dropping nothing (FR-017, edge case)
- [ ] T037 [US3] Pass `autoPlay={true}` in `src/app/(frontend)/products/[slug]/page.tsx` — the **only** call site in the application permitted to enable cycling
- [ ] T038 [US3] Confirm `ProductCard` passes `autoPlay={false}` and that no other component mounts an autoplaying instance; with 24 products this is the CLS and INP defence (research.md D4, SC-016)

**Checkpoint**: `npm.cmd test` green including `cycling.test.ts`. Manually verify the sticky-pause sequence — it is the requirement most likely to be quietly broken.

---

## Phase 6: User Story 4 - Visitor reads comfortably (Priority: P2)

**Goal**: consistent type scale, aligned figures, clean wrapping.

**Independent test**: read every page in long form including on a phone; confirm consistent heading hierarchy, aligned price and quantity figures, and clean wrapping.

- [ ] T039 [P] [US4] Refine the type scale in `src/app/(frontend)/globals.css` — keep `Space Grotesk` for headings and `DM Sans` for body, adjust sizes, line heights and letter spacing so each heading level looks identical everywhere (FR-025 to FR-027)
- [ ] T040 [US4] Apply tabular figures to prices and quantities in `src/app/(frontend)/globals.css` so digits do not shift sideways as values change (FR-028, US4 scenario 1)
- [ ] T041 [US4] Balance wrapped headings and control orphan lines in `src/app/(frontend)/globals.css` with `text-wrap: balance`, and cap paragraph measure (FR-029, US4 scenario 2)
- [ ] T042 [US4] Add consistent vertical rhythm between body paragraphs of differing lengths in `src/app/(frontend)/globals.css` (FR-030, US4 scenario 3)
- [ ] T043 [US4] Confirm `Space Grotesk` and `DM Sans` remain the only two families loaded in `src/app/(frontend)/layout.tsx`, and that no dark palette was introduced (FR-031, constitution Principle V)

**Checkpoint**: `npm.cmd run build` and a full read-through of every page at 375px and 1440px.

---

## Phase 7: User Story 5 - Visitor browses a fuller catalogue (Priority: P2)

**Goal**: ~24 products across the existing 8 categories, 8 articles, one imageless item.

**Independent test**: browse the expanded catalogue; confirm item count, category spread, filter and search behaviour across the larger set, and a populated article index.

- [ ] T044 [P] [US5] Expand `src/lib/fixtures/data.ts` products from 9 to ~24 across the existing 8 categories (3 top-level, 5 sub), keeping every `categoryId` resolvable to a real `Category.id` and every `relatedSlugs` entry resolvable to a real `Product.slug` (data-model.md, US5 scenario 2)
- [ ] T045 [US5] Include at least one product with `images: []` in `src/lib/fixtures/data.ts`, because no current fixture has one and FR-031 requires that state to be demonstrable (US5 scenario 4)
- [ ] T046 [US5] Keep placeholders self-evidently provisional in `src/lib/fixtures/data.ts` — no invented business claims, no real-looking certifications or guarantees (SC-010, constitution Principle III)
- [ ] T047 [US5] Expand `src/lib/fixtures/data.ts` posts from 3 to 8, each with a unique slug and a valid `publishedAt`
- [ ] T048 [US5] Confirm `npm.cmd test -- filters` still passes over the larger `src/lib/fixtures/data.ts` set, and manually verify category, price and availability filters in `src/lib/filters.ts` plus multi-category search return correct counts (US5 scenarios 2 and 3)
- [ ] T049 [US5] Confirm `src/lib/fixtures/data.ts` stays under the ~100-item bound so filtering and search remain client-side (constitution, Scale/Scope)
- [ ] T050 [US5] Verify a product with `images: []` renders a labelled placeholder via `src/components/product/ProductCard.tsx` and `src/app/(frontend)/products/[slug]/page.tsx`, with no cycling and no broken image (FR-022, US5 scenario 4)

**Checkpoint**: catalogue shows ~24 items, blog shows 8, all fixture tests green.

---

## Phase 8: User Story 6 - Visitor and search engines reach the live site (Priority: P3)

**Goal**: the site advertises only the address that is actually live.

**Independent test**: fetch the site's own address listings and confirm every address they contain resolves.

- [ ] T051 [P] [US6] Add a build-time assertion in `src/app/sitemap.ts` that the resolved base host is not `localhost` in a production build, failing the build rather than emitting an unusable address (FR-035, research.md D5)
- [ ] T052 [P] [US6] Add the matching production-host assertion in `src/app/robots.ts` (FR-036)
- [ ] T053 [US6] Set `NEXT_PUBLIC_SERVER_URL=https://yourecommercestore.vercel.app` in the Vercel project environment — root cause is the variable being **unset**, not a hardcoded string (research.md D5)
- [ ] T054 [US6] Run `npm.cmd run build` and assert the artifacts emitted by `src/app/sitemap.ts` and `src/app/robots.ts` contain `yourecommercestore.vercel.app` and contain neither `localhost` nor the deleted `ecommerce-storefront-phi.vercel.app` (SC-012)
- [ ] T055 [US6] Deploy with `vercel --prod --yes`, confirming `vercel.json` still contains `"framework": "nextjs"` (research.md D6)
- [ ] T056 [US6] Verify the **production alias** `https://yourecommercestore.vercel.app` — not a preview URL — returns 200 with no Vercel login wall, and that its `robots.txt` and `sitemap.xml` name only the production host (research.md D6)

**Checkpoint**: live site 200, address listings correct, all routes reachable.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T057 [P] Run the frozen-behaviour walkthrough from quickstart.md section 4: add to basket, WhatsApp checkout message, delivery form, filters, search, contact form. Every behaviour identical to pre-release (FR-038, SC-013)
- [ ] T058 Run the full gate suite against `package.json` scripts: `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run build`
- [ ] T059 Measure the SC-016 performance gate per `specs/002-polish-storefront/quickstart.md` section 5, on a mid-range phone over a throttled connection: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms — measuring CLS specifically while a full page of 24 cards loads, which is the condition this release is most likely to break
- [ ] T060 Complete the accessibility checklist from quickstart.md section 4: keyboard traversal with visible focus, 44×44 targets, reduced-motion honoured, position announcements audible, no green mark on any cream surface
- [ ] T061 [P] Re-run the contrast measurements from `src/tests/contrast.test.ts` and confirm research.md D2's three key values still hold after all token work (1.91 / 3.87 / 7.67)
- [ ] T062 Confirm the `/admin` route, `src/components/contact/ContactForm.tsx` and the upload path are unchanged deferred states, not regressions from this release
- [ ] T063 Record in `specs/002-polish-storefront/plan.md` Complexity Tracking that the outstanding "Payload as sole backend" ADR remains deferred by user decision, and that `NEXT_PUBLIC_SERVER_URL` is the only environment change to undo on rollback

---

## Dependencies & Execution Order

### Story dependency graph

```text
Phase 1 Setup (T001-T007)
    │
    ├──> T002 contrast ──> US1 (colour decisions, T012-T013)
    ├──> T004 motion  ──> US3 (reduced motion, T033)
    └──> T006 tokens  ──> US1, US2, US4
             │
Phase 2 Foundational (T008-T011)
    ├──> T008 WhatsAppIcon ──> US1 ★ blocks
    ├──> T009 CyclingControl ──> US3
    ├──> T010 gallery prop contract ──> US3, US2 (T030 verifies)
    └──> T011 freeze whatsapp.ts ──> US1 (T019 verifies), Polish T057
             │
    ┌────────┴─────────┬──────────────┬─────────────┐
    ↓                  ↓              ↓             ↓
US1 (T012-T019)   US2 (T020-T030)  US3 (T031-T038)  US4 (T039-T043)
 ★ MVP             │                │                │
  P1               P1              P1              P2
    │                  └────────┬───────┘            │
    │                           ↓                    ↓
    │                    US5 (T044-T050)        US6 (T051-T056)
    │                     P2                     P3
    └──────────────┬────────────┴────────────┬─────┘
                   ↓                         ↓
          Phase 9 Polish (T057-T063)
```

### Critical path

**T001 → T008 → T012/T013 → T018 → T021 → T022 → T030 → T058**

The MVP (User Story 1) needs only T001, T002, T006, T008, T011–T019 — 11 tasks. It is independently shippable and delivers the single most commercially valuable fix.

### Parallel opportunities

| Batch | Tasks | Why safe |
|---|---|---|
| Phase 1 | T002, T003, T004, T005 | Four distinct new files, no shared dependency |
| US1 | T012–T017 | Six files, each a self-contained icon swap |
| US2 | T020, T021, T024, T026, T028, T029 | Six distinct files. T025 follows T024 on `ArticleCard.tsx`; T022, T023, T027 follow T021 on `ProductCard.tsx` |
| US3 | T031 | Sole test file; then T032–T036 sequence on the gallery |
| US4 | none | T039, T040, T041 are logically independent but all edit `globals.css`; sequential is honest, not merely conventional |
| US5 | none | T044-T047 all edit `fixtures/data.ts`; sequential is honest, not merely conventional |
| Polish | T057, T061, T062 | Independent verification activities |

**Genuinely parallel: 22 `[P]` tasks.** The rest are logically independent but share a file, so `[P]` would be a false claim. Verified mechanically rather than by eye: every `[P]` task file path was extracted and checked for collisions within its phase, which found six over-claimed markers and corrected them.

### MVP scope

**User Story 1** — T001, T002, T006, T008, T011, T012, T013, T014, T015, T016, T017, T018, T019 (13 tasks). Delivers the official brand mark on a measured-accessible treatment across all five call sites. Highest commercial value per task, and the only story whose own independent test can fail on a missed file.

### Incremental delivery strategy

1. **MVP** — US1. Official mark everywhere. Immediately client-visible.
2. **Browse quality** — US2, then US3. Cards then carousel; US2's grid reservation must land before US3 so the CLS budget is spent once.
3. **Polish** — US4. Type scale, cheap and independent.
4. **Substance** — US5. Catalogue breadth; also makes filter and search reviewable before real stock arrives.
5. **Correctness** — US6. Cheap, but must precede or accompany deploy.
6. **Verify** — Phase 9. FR-038 walkthrough and the SC-016 performance gate.

---

## Format Validation

- [x] Every task begins `- [ ]`
- [x] Every task has a sequential ID T001–T063, no gaps
- [x] `[P]` appears only where tasks touch distinct files with no incomplete dependency
- [x] `[USn]` present on all user-story tasks (T012–T056), absent on Setup, Foundational and Polish
- [x] Every task names an exact file path
- [x] Task count: **63** — Setup 7, Foundational 4, US1 8, US2 11, US3 8, US4 5, US5 7, US6 6, Polish 7
- [x] Every user story has an independent test criterion in its phase header
- [x] Test tasks explicitly marked "Must fail before" their implementation task
- [x] No task invents a file absent from `plan.md`'s project structure
