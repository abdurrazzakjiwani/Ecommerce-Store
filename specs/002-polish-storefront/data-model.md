# Phase 1 Data Model: Storefront Polish and Professional Upgrade

**This release changes no data model.** That is a design decision with a reason, not an
omission.

`src/lib/types.ts` already models everything this release needs, and it was written to mirror
the Payload collection shapes so the database swap stays a one-file change. The polish work
adds presentation, not entities. Re-declaring types here would create a second source of truth
that drifts.

The entities below are therefore documented as **inherited, unchanged** — recorded so the plan
is complete and so any future reader can see what the presentation layer is permitted to rely
on. Full field-level definitions live in `src/lib/types.ts`; the collection configs are in
`src/collections/`.

## Inherited entities

### Product — unchanged

Defined in `src/lib/types.ts`. Fields: `id`, `slug`, `title`, `summary`, `description`,
`categoryId`, `images[]`, `price`, `priceType`, `currency`, `specs[]`, `tags[]`, `featured`,
`inStock`, `relatedSlugs[]`.

What this release adds is **card count and content volume**, not shape: ~9 fixtures become ~24.

**Validation rules in force, from the specification:**

| Rule | Source | Enforced where |
|---|---|---|
| `slug` unique, stable, URL-safe | FR-037 | Fixture authoring; Payload `unique` in production |
| `price` is `null` whenever `priceType === 'quote'` | FR-011 | Card renders no figure; existing Payload hook holds in production |
| `images` is 0..5 on the item page; beyond the 5th stays reachable | FR-017, edge case | `ProductGallery` caps the cycle and keeps the remainder as thumbnails |
| `images` may be empty, and at least one fixture MUST be empty | FR-031 | New fixture; placeholder state already handled |
| Card images MUST NOT auto-advance | FR-015 | `autoPlay={false}` at the `ProductCard` call site |

The empty-`images` case is the one worth flagging: **no current fixture has it**, which is
precisely why FR-031 makes it a new deliverable. That branch has never been exercised.

### Category — unchanged

`id`, `slug`, `title`, `description`, `parentId` (null for top level). 3 top-level and 5
sub-categories, reused as-is. This release adds no categories; the catalogue grows in breadth
within the existing taxonomy. Per FR-016, category cards are for consistency only and must
remain visually subordinate to products.

### Post — unchanged, and newly card-rendered

`id`, `slug`, `title`, `excerpt`, `body`, `coverImage` (nullable), `publishedAt`.

`coverImage` is nullable, so an article card must handle its absence the same way a product
card handles empty `images` — a labelled placeholder, not a broken frame. ~3 fixtures become 8.

Per FR-015, article cards present imagery, category, publication date, title, summary, and a
read action — and explicitly **no price, no quotation state, no add-to-basket action**. The
distinction is enforced by the card component not rendering those fields at all, not by hiding
them with CSS.

### SiteSettings — unchanged

All business identity. Per Constitution Principle I, nothing in this release may add a business
value, and none does.

**One deliberate exception, recorded:** the WhatsApp mark is a **brand asset**, not a business
value. It is a code constant in `src/components/brand/WhatsAppIcon.tsx`, alongside the teal
tokens in `globals.css` — not a `site-settings` field. Adding it to the CMS would let the
merchant recolour a mark the brand guidelines forbid changing, which is a worse failure than a
code change. Business identity is configurable; brand marks are not.

## New in code (no persistence)

### Contrast — `src/lib/contrast.ts`, new pure function

Computes WCAG 2.x relative luminance and contrast ratio from hex values. Exists so the WhatsApp
colour decision is **measured and regression-tested** rather than asserted in a comment
(`research.md` D2). Pure, no I/O, fully unit-testable — which the constitution's testing
discipline requires of everything in `src/lib/`.

Contract: `contrastRatio(fg: string, bg: string): number` and `relativeLuminance(hex: string): number`.
Inputs are 3- or 6-digit hex, with or without `#`; invalid input throws rather than returning a
plausible number, because a silently wrong ratio is worse than a loud failure.

### Motion preference — `src/lib/motion.ts`, new

Reads `prefers-reduced-motion: reduce` and exposes it as a boolean. Needed because FR-017
requires cycling to **never begin** under reduced motion, and `playOnInit: false` (D3) means
the check runs before the first tick rather than cancelling one.

### Cycling state — component-local, deliberately not in `lib`

`userPaused` lives in `ProductGallery` state, not in a lib module. It is transient UI state with
no reuse and no persistence; putting it in `lib/` would imply a contract it does not have.

Its one non-obvious rule, from `research.md` D3: once set, **nothing** calls `play()` again
until the visitor explicitly resumes. Not hover-out, not focus-out, not re-render, not a
remount from navigation back to the same item.

## Entity relationships (unchanged)

```text
Category (self-referencing via parentId)
    │  1
    │
    │  n
Product (categoryId → Category.id)
Product (relatedSlugs[] → Product.slug, unordered hints)

SiteSettings — standalone global, no relations

Post — standalone, coverImage optional
```

No relationship is added, removed, or re-pointed. `relatedSlugs` and `parentId` are the two
places a careless expansion could create a dangling reference, so the ~24-product fixture set
must keep every `relatedSlugs` entry resolvable.

## Volume and state transitions

**Catalogue volume:** 9 → ~24 products, 3 → 8 articles, categories unchanged at 8. This is the
release's only scale change. It stays well inside the constitutional bound of ~100 items, under
which filtering and search run client-side.

**Cycling state machine** — the only state machine this release introduces:

```text
          reduced motion detected
   ┌──────────────────────────────────┐
   ↓                                  │
 IDLE ──(settled + 2+ images)──> CYCLING ──(pointer/focus in)──> HELD
   │         ↑                          │  ↑                      │
   │         │                          │  │                      │
   │         └──(auto)─────────────────┘  └──(pointer/focus out)──┘
   │                                    │
   └──(user pauses)────────────────> USER_PAUSED  ← terminal except explicit resume
                                        │
   IDLE ──(user resumes)────────────────┘

 USER_PAUSED ──(explicit resume only)──> CYCLING
```

`USER_PAUSED` is the state the plugin cannot express for us. Its only exit is an explicit
visitor action, which is what FR-019 requires and what the plugin's interaction-based restart
would otherwise violate.

No other entity has a lifecycle. Products and articles are static content with no workflow
status; `inStock` is a boolean, not a state machine.
