# Data Model: WhatsApp Service Storefront

**Date**: 2026-10-01
**Feature**: `001-whatsapp-storefront`
**Derived from**: [spec.md](./spec.md), [research.md](./research.md), [plan.md](./plan.md)

All content is stored in PostgreSQL through Payload 3.90.2 with the Postgres adapter on
Neon, using a pooled connection string. Media is stored in Vercel Blob through the
S3-compatible adapter. No entity below uses local filesystem persistence.

## Conventions

- **Slugs** are unique and set from the title unless a category relationship requires
  uniqueness scoped to the parent.
- **Draft and publish** applies to every publicly visible type, so unpublished content is
  unreachable (spec FR-031). `drafts` enabled with `autosave` disabled, to avoid the
  serverless autosave race documented in research D5.
- **Timestamps** are created/updated on every collection.
- **Slug field** is indexed. **Sort/filter fields** on catalogue types are indexed,
  because filtering runs on the read path.
- **Enums** are stored as `select` fields with `required: true` so the admin panel
  constrains the owner rather than relying on documentation.

---

## 1. Media

Upload collection. Public read.

| Field | Type | Notes |
|---|---|---|
| `alt` | text, **required** | spec FR-027. Enforced at upload, not optional. |
| `width`, `height` | number | Written by Payload; used to reserve aspect ratio. |
| `mimeType`, `filesize` | text / number | Validated against the upload ceiling. |
| `focalX`, `focalY` | number | Focal point so cropping never decapitates a face or logo. |

**Upload config**: `mimeTypes: ['image/*']`, `focalPoint: true`, `crop: true`.

**Generated sizes** (spec FR-026):

| Name | Width | Use |
|---|---|---|
| `thumb` | 400 | Filter results, cart line, related items |
| `card` | 768 | Catalogue card, gallery slide |
| `detail` | 1280 | Item detail page, Open Graph image |

**Access**: `read: () => true`. Create/update/delete require an authenticated user with
the `admin` role. Alt text being required means the admin panel must surface it as
mandatory, which is the mechanism behind spec FR-027.

---

## 2. Categories

Self-referencing hierarchy of unbounded depth (spec FR-002, Principle III).

| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, required, unique, indexed | |
| `parent` | relationship -> Categories | **Self-reference.** Null means top level. Enables sub-categories. |
| `description` | textarea | Optional category blurb. |
| `icon` | upload -> Media | Small square, used in the category rail. |
| `coverImage` | upload -> Media | Category landing image. |
| `order` | number, indexed | Owner-controlled display order. |

**Access**: `read: () => true`. All writes require admin.

**Delete behaviour** (spec FR-032): Payload blocks deletion of a document referenced by a
relationship by default. Since `products.category` is a required relationship, deleting a
non-empty category fails safely rather than orphaning items. That satisfies FR-032's
requirement that items never become unreachable. The admin panel surfaces the blocking
error naming the referencing documents, which satisfies the reporting half of FR-032. No
custom hook is required; this is the default behaviour and must be verified rather than
assumed.

---

## 3. Products

The catalogue entity. Draft/publish enabled.

| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, required, unique, indexed | Shareable URL, spec FR-007. |
| `summary` | textarea | Short description. Also searched, spec FR-004. |
| `description` | richText (Lexical) | Full detail. |
| `category` | relationship -> Categories, required, indexed | |
| `gallery` | array -> upload -> Media | **3-5 images, ordered.** See validation below. |
| `price` | number | Null when `priceType` is `quote`. |
| `priceType` | select: `fixed`, `from`, `quote` | **The load-bearing field.** See below. |
| `currency` | text | Defaults from site settings; PKR. |
| `specs` | array of `{ label, value }` | Open key-value, so unknown categories need no schema change. |
| `tags` | array -> text, indexed | Searched, spec FR-004. |
| `featured` | checkbox, indexed | Homepage selection. |
| `inStock` | checkbox, default true | Filter axis, spec FR-003. |
| `relatedProducts` | relationship -> Products | Self-reference for spec FR-009. |

### `priceType` semantics

The client's catalogue composition is unconfirmed. Rather than guess (Principle III),
the model accommodates all three presentations:

| Value | Meaning | Display | Cart treatment | Subtotal |
|---|---|---|---|---|
| `fixed` | Definitive price | "PKR 185,000" | Line total = qty x price | Included |
| `from` | Indicative starting price | "From PKR 12,000" | Line total = qty x price | Included, labelled indicative |
| `quote` | No price exists | "Request a quote" | Line total omitted | **Excluded** |

**Validation**: `price` is required when `priceType` is `fixed` or `from`, and MUST be
absent when `priceType` is `quote`. Enforced in a `beforeValidate` field hook on
`priceType`, so neither the admin panel nor the API can persist a contradiction. This is
what makes the pricing decision safe to defer.

**Rendering rule** (spec FR-016): when any basket line is `quote`, the subtotal MUST NOT
be presented as a final order total. It is labelled as covering priced items only, with
a count of items requiring a quotation. Implemented in `buildOrderMessage` and mirrored
in `CartSummary`.

### Gallery validation

Spec FR-005 and FR-027 require 3-5 ordered images.

- `gallery` minRows 3, maxRows 5, with an `upload` field enabling multi-select and drag
  reordering, which supplies the explicit display order (spec FR-001 acceptance).
- Enforced at the API, so the constraint holds regardless of entry point.
- Edge case from spec: an item published with no images must remain reachable and be
  visually distinguishable. `gallery` is therefore **not** required at the collection
  level; the 3-5 rule is enforced only when a gallery is present. This deliberately
  accepts a zero-image item so the admin is never blocked, and the storefront renders a
  labelled placeholder rather than a broken frame.

### Access

`read` is public for published documents and denies drafts. All writes require admin.

---

## 4. Orders

The owner's permanent record of an enquiry (spec FR-022, FR-023, Principle II). Draft
disabled: an enquiry is a fact once sent.

| Field | Type | Notes |
|---|---|---|
| `customerName` | text, required | |
| `customerPhone` | text, required | Validated Pakistan mobile. |
| `customerEmail` | email | Optional for WhatsApp enquiries. |
| `items` | array of objects | **Denormalised snapshot** - see below. |
| `subtotal` | number | Priced items only. Null when all items are quote. |
| `hasQuoteItems` | checkbox, indexed | Drives the "requires quotation" label. |
| `address` | group | Recipient name, line1, line2, city, province, postalCode, notes. Snapshot. |
| `notes` | textarea | Visitor's note at checkout. |
| `source` | select: `whatsapp-cart`, `whatsapp-single`, `contact-form` | Which journey produced it. |
| `customer` | relationship -> Customers | **NULL. Deferred auth seam.** See below. |
| `status` | select: `new`, `in-progress`, `quoted`, `closed` | Operational only. No payment states. |

### Item snapshot

Items are copied, never referenced. `{ title, slug, qty, unitPrice, priceType, image }`,
captured at the moment of sending.

**Rationale**: two failure modes are prevented. If the owner later renames an item or
changes its price, past enquiries must still show what was actually agreed. And because a
deferred seam means `products` may not exist for a quote item, the enquiry must not
depend on a live relation to render. This satisfies FR-023 and Principle II's requirement
that the owner's record is independent of third-party state.

### Deferred auth seam

`customer` is defined, nullable, and never populated in v1. Spec records it as DEFERRED.
Enabling Google login later makes this field meaningful and links existing enquiries to
customers with **no data migration**, because adding a relation to existing documents
does not invalidate them.

---

## 5. Messages

Contact form submissions (spec FR-038, FR-040).

| Field | Type | Notes |
|---|---|---|
| `name` | text, required | |
| `email` | email, required | Becomes the notification reply-to. |
| `phone` | text | Optional. |
| `subject` | text, required | Becomes part of the notification subject line. |
| `message` | textarea, required | |
| `referringPage` | text | Page the enquiry came from. Recorded for attribution. |
| `status` | select: `new`, `read`, default `new`, indexed | Owner inbox triage, spec FR-033. |
| `emailSent` | checkbox | Whether notification succeeded. **Written after** the attempt. |

**Ordering guarantee** (spec FR-040, Principle II): the document is created first;
notification is attempted in an `afterChange` hook. If sending fails, the record remains
and `emailSent` stays false. Email is a convenience layer over a durable record, never
the only copy. This is why email is not sent from a route handler that creates the record
inline.

**Access**: `create` is public, guarded by the spam controls below. `read` requires admin,
so enquiry contents are never publicly enumerable.

### Spam controls (spec FR-041, FR-042)

Applied in `beforeValidate`, so they run server-side and cannot be bypassed by crafting a
request:

| Control | Rule | Rationale |
|---|---|---|
| `website` honeypot | text field, visually hidden, must be empty | Bots fill every field they find. Zero visitor cost. |
| `formStartedAt` | timestamp; reject if `now - formStartedAt < 3000ms` | Bots submit in under 3 seconds. Spec FR-042 requires a normal reading timeframe to always succeed, so this is a floor, not a target. |
| `formRenderedAt` | reject if `formRenderedAt` is in the future | Blocks fabricated timestamps. |
| Rate limit | Per-IP token bucket on the create operation | Layered defence; see known limitation below. |

**Verified limitation**: the rate limiter is in-process. On Vercel, serverless instances
are parallel and short-lived, so an in-memory bucket does not hold across them. The
honeypot and the timing floor are the real protection because they are stateless and work
everywhere. The limiter is defence in depth for single-instance and local environments.
Upgrading to a shared store such as Upstash Redis is an isolated later change if spam
becomes a measured problem rather than a hypothetical one.

---

## 6. Posts

Blog content (spec FR-007 acceptance, FR-031).

| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, required, unique, indexed | |
| `excerpt` | textarea | Listed on the blog index. |
| `body` | richText (Lexical) | |
| `coverImage` | upload -> Media | |
| `author` | relationship -> Users | Optional; defaults to the owner. |
| `publishedAt` | date | Frontmatter only. |

**Access**: published posts are publicly readable; drafts are not (FR-031).

---

## 7. SiteSettings (global)

The **single source of every business identity value** (Principle I, spec FR-029).
Exactly one document. Read by the storefront layout and consumed by every component.

| Field | Type | Notes |
|---|---|---|
| `businessName` | text, required | **Seeded `YourBrand`.** Self-evidently provisional. |
| `tagline` | text | |
| `logo` | upload -> Media | Replaces the placeholder monogram. |
| `favicon` | upload -> Media | |
| `phone` | text | Left empty when unsupplied; **never** a fabricated number. |
| `whatsappNumber` | text, required | Seeded `923394299873`. **Digits only, no `+`.** |
| `notificationEmail` | email, required | Seeded `co.auraztech@gmail.com`. The sole client-editable delivery value. |
| `address` | textarea | |
| `socials` | group | facebook, instagram, linkedin, youtube. |
| `currency` | select | PKR. |
| `deliveryCharge` | number | |
| `deliveryTimeframe` | text | |
| `aboutContent` | richText | About page body. |
| `contactIntro` | textarea | Contact page introduction. |

**Design rule**: no component reads a business value from anywhere else. Not a constant,
not an environment variable, not a prop default. The layout resolves settings once and
provides them downward. Changing any field here changes the whole site with no redeploy,
satisfying spec FR-029 and its acceptance scenarios.

**Blank-value rule**: spec SC-011 forbids showing placeholder text a visitor can see. So
unsupplied values render as *absent from the layout*, not as a placeholder string. This
is why the seeded business name is deliberately implausible: it is the one value a
visitor will see, and it must be obvious to the owner that it must be replaced, while
never appearing to a real visitor as if it were genuine.

**Numeric-only WhatsApp number**: enforced by a `beforeValidate` hook stripping
non-digits, because WhatsApp's documented grammar rejects `+`, spaces, dashes and
brackets. Storing the raw `+92 3394299873` would produce a silently broken link.

---

## 8. Users

Payload's built-in auth-enabled admin collection. The owner only.

| Field | Type | Notes |
|---|---|---|
| `name` | text | |
| `role` | select: `admin` | Only role issued. |

**Access**: create is restricted to the first bootstrap user; subsequent creation is
admin-only. This closes the privilege-escalation path where a visitor self-registers as
admin.

---

## 9. Customers (deferred seam)

**Not used in v1.** Retained per spec Out-of-Scope DEFERRED and Principle III.

| Field | Type | Notes |
|---|---|---|
| `auth` | enabled | Ready for a Google OAuth strategy. |
| `googleSub` | text, indexed, unique | OIDC subject identifier. |
| `avatar` | upload -> Media | |
| `phone` | text | |
| `addresses` | array of address group | Saved delivery addresses. |

**Why retained rather than added later**: research D8 establishes that enabling OAuth
requires a `customers` collection with auth enabled, a stored OIDC subject, and an
addresses structure. Defining it now means enabling authentication later is a UI and
strategy task. Omitting it means a migration against live enquiry data.

**Enabling it would additionally require**, per research D8: Google Cloud OAuth
credentials from the owner; a custom Payload auth strategy with two route handlers rather
than Auth.js, on Payload maintainers' own guidance; an internally generated random
password per login, because Payload cannot remove the password field from an auth-enabled
collection; and a published privacy policy, which the plan already includes as a page
precisely so this prerequisite is pre-met.

---

## Relationship Map

```text
SiteSettings (global, singleton)
    └─ referenced by every page at render time

Categories ──self-ref──> Categories           (unbounded depth)
     │
     └──< Products (1:1 required)

Products ──self-ref──> Products                (relatedProducts)
     │
     └──< Media (gallery, 3-5 ordered)

Orders ──> Customers                           (NULL in v1 - deferred seam)
     └─ items[]: denormalised snapshot, no live relations

Messages                                     (independent)
Posts ──> Users                                (optional author)
Users                                         (owner only)
Customers ──> Media                            (avatar, deferred)
```

## Index Strategy

| Collection | Indexed fields | Why |
|---|---|---|
| Products | `slug`, `category`, `tags`, `featured`, `inStock` | Filter and search run per keystroke on the catalogue route. |
| Categories | `slug`, `parent`, `order` | Tree build and display ordering. |
| Media | none beyond Payload defaults | Lookups are by id. |
| Orders | `hasQuoteItems`, `status` | Owner triage views. |
| Messages | `status` | Owner unread count. |
| Posts | `slug`, `publishedAt` | Blog index ordering. |
| Customers | `googleSub` | Deferred; indexed in advance of use. |

At the expected catalogue size - under roughly 100 items per spec - every catalogue query
resolves from a single small fetch and filtering executes in the browser, per the
performance budget of under one second. Indices above exist so that the day the catalogue
outgrows that assumption, the query path is already sound.