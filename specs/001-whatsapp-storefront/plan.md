# Implementation Plan: WhatsApp Service Storefront

**Branch**: `001-whatsapp-storefront` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-whatsapp-storefront/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.opencode/command/sp.plan.md` for the execution workflow.

## Summary

Deliver a single-application storefront plus self-service admin for a Pakistan-based
hardware/software business. Next.js 16 and Payload CMS 3 live in one repository and one
deployment, so the business owner manages products, imagery, categories, blog content
and all business identity from an admin panel with no code change and no redeploy.
Visitors browse a catalogue with nested categories, filters and client-side search, view
item pages with scrollable image galleries, and convert by opening a pre-filled WhatsApp
conversation with the business. A basket accumulates multiple items with Pakistan-wide
delivery details, and every enquiry is additionally persisted so the owner retains a
record independent of WhatsApp retention. A contact form sends notification email.

Primary requirement: the client wants to upload and manage his own imagery without
developer involvement, and wants no online payment, with WhatsApp as the ordering
channel.

Technical approach, from research (see [research.md](./research.md)):

- Payload 3.90.2 embedded in Next.js 16.3.8, deployed together on Vercel. Payload
  publishes an official one-click Vercel deployment using precisely this combination
  (Next.js + Neon + Vercel Blob), which removes the largest integration risk.
- Product pricing uses a discriminated `priceType` of `fixed | from | quote`. This is
  the load-bearing schema decision: the client's catalogue composition is unconfirmed
  and this makes goods, software and services coexist without rework.
- `@payloadcms/storage-s3` pointed at Vercel Blob, with `clientUploads: true` and
  bucket CORS. Research established that Vercel caps proxied server uploads at 4.5MB,
  so client-direct upload is mandatory, not an optimisation.
- Zustand with `skipHydration: true` and manual rehydration, plus a Zod-validating
  storage adapter, because research showed the default JSON storage casts persisted
  state without validation and SSR would otherwise cause hydration mismatch.

## Technical Context

**Language/Version**: TypeScript 5.9.3 on Node.js 24.16.x (24.x LTS)
**Primary Dependencies**: Next.js 16.3.8, Payload 3.90.2, @payloadcms/next 3.90.2, @payloadcms/db-postgres 3.90.2, @payloadcms/storage-s3 3.90.2, @payloadcms/richtext-lexical 3.90.2, @payloadcms/email-resend 3.90.2, Tailwind CSS 4.3.3, Zustand 5.0.15, Embla Carousel React 8.6.0, Zod 4.6.5, react-hook-form 7.89.0, sharp 0.35.5, lucide-react
**Storage**: PostgreSQL on Neon (serverless Postgres, pooled connection string); media in Vercel Blob via S3-compatible API; no local filesystem persistence
**Testing**: Vitest 5.0.3 with @testing-library/react 16.3.3 for pure-function and component coverage; manual verification checklist for visual and accessibility gates
**Target Platform**: Node.js 24 runtime on Vercel; accessed by mobile browsers (375px baseline) and desktop browsers (1440px)
**Project Type**: web (single application containing storefront, API and admin)
**Performance Goals**: LCP under 2.5s on throttled 4G; CLS under 0.1; filter and search results update within 1 second at 100 catalogue items; page TTFB under 300ms from the Postgres region nearest the visitor
**Constraints**: Catalogue under roughly 100 items so filtering and search run client-side; conversion is a WhatsApp deep link and there is no payment gateway; light cream theme only, no dark theme; Vercel requires `clientUploads: true` plus bucket CORS for image upload; Payload must stay at or above 3.83.0 to avoid a serverless autosave race; Next.js `cacheComponents` must remain disabled
**Scale/Scope**: 7 user stories, 53 functional requirements, 8 content types plus 1 settings global, 9 public routes, 2 principal actors (visitor and owner)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Every gate below is answered explicitly. A FAIL blocks Phase 0. A deviation that is
nevertheless justified MUST be recorded in Complexity Tracking rather than left as an
unexplained exception.

- [x] **I. Single Deployable** - PASS. Content and admin are in this repository and
  deploy together. All brand values resolve from the `site-settings` global through a
  single read path; no component receives a hardcoded business string. No hosted SaaS
  is the source of truth. Payload's admin panel ships with the app rather than being a
  separate subscription service.
- [x] **II. Contact-First Conversion** - PASS. No payment gateway, processor or card
  handling anywhere in the design; the sole purchase path is a WhatsApp deep link.
  Conversion resolves to `https://wa.me/<digits>?text=<encoded>`. Every checkout also
  writes an `orders` document, so the owner's record survives WhatsApp being cleared.
- [x] **III. Flexible Schema** - PASS. The unconfirmed catalogue is modelled through
  `priceType` (`fixed | from | quote`) and `specs` as an open key-value list rather than
  a fixed schema. Categories nest via self-reference to arbitrary depth. Three deferred
  seams are preserved: a `customers` collection with auth enabled but unused, an
  optional `customer` relation on `orders`, and all colour values resolved from one
  token source.
- [x] **IV. Durable Assets and Secrets** - PASS with one binding constraint now
  recorded. Media uses `@payloadcms/storage-s3` against Vercel Blob; research established
  the S3 adapter sets `disableLocalStorage` automatically when enabled, which removes
  the silent-image-loss failure mode this principle exists to prevent. Vercel's 4.5MB
  proxied-upload cap is handled by `clientUploads: true` with bucket CORS on `PUT`.
  Secrets are environment-only; the notification recipient is the single client-editable
  value and provider credentials are not. Public write is limited to contact submission,
  guarded by validation, a honeypot field, a minimum-submission-time check and a
  per-IP rate limit.
- [x] **V. Accessibility and Design** - PASS. WCAG 2.1 AA is budgeted as a per-phase
  gate. Light mode only is enforced by design tokens rather than by discipline: no dark
  palette exists to switch to, so OS-level dark mode cannot alter the site. Contrast
  ratios are recorded per token, with the rejected amber documented at approximately 3:1
  against its accepted replacement at 4.91:1. All four breakpoints are in the gate list.
- [x] **VI. Verified Facts** - PASS. The framework version ceiling, the `cacheComponents`
  incompatibility, the 4.5MB Vercel upload cap, the `clientUploads` requirement, the
  Payload 3.83.0 autosave-race fix, the WhatsApp digits-only link grammar, Zustand's
  unvalidated persisted-state cast, and TypeScript 7.0.2 now being `latest` were each
  verified against vendor sources during Phase 0. See [research.md](./research.md) for
  the twelve decisions and their sources.
- [x] **Pinned Stack** - PASS with one deliberate exception recorded in Complexity
  Tracking: TypeScript is pinned to 5.9.3 rather than the current `latest` of 7.0.2.
- [x] **Testing Discipline** - PASS. Unit tests are planned for every pure function in
  `src/lib/`, and adversarial-input tests specifically for anything whose output is sent
  to a third party, which here means the WhatsApp link builder. Access rules are
  planned for both permit and deny verification, since a permissive default is the
  failure mode this principle names.

**Out-of-scope confirmation**: `spec.md` records seven exclusions and three deferrals,
each with its preserved seam. Every deferred item names the seam that keeps it a UI task
rather than a migration. Nothing is silently omitted.

### Post-design re-check (after Phase 1)

- [x] **Storage durability proven, not assumed** - The plan makes an upload, a redeploy
  and a visual confirmation a release gate at scaffold time rather than a deployment
  task, so this principle is verified before it can be forgotten.
- [x] **Email is a convenience layer only** - Contact submission persists to `messages`
  before notification is attempted, and a failed send is logged rather than surfaced as
  data loss. Confirmed against spec FR-040.
- [x] **Deferred seams survive** - All three seams exist in the Phase 1 data model and
  appear in `data-model.md` as retained structures, not as commented-out placeholders.
- [x] **Anti-spam cannot reject genuine visitors** - The timing threshold is expressed
  as a named constant with its rationale attached, and spec FR-042 requires that a
  normal reading and typing timeframe always succeeds. Bounded by an explicit test.

## Project Structure

### Documentation (this feature)

```text
specs/001-whatsapp-storefront/
├── spec.md              # Feature specification (from /sp.specify)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - 12 verified decisions
├── data-model.md        # Phase 1 output - entities, fields, access rules
├── quickstart.md        # Phase 1 output - setup and verification
├── contracts/           # Phase 1 output
│   └── api-contract.md  # Payload REST + custom routes, error taxonomy
├── checklists/
│   └── requirements.md  # Spec quality validation
└── tasks.md             # Phase 2 output (/sp.tasks) - NOT created here
```

### Source Code (repository root)

```text
# Single application: storefront + API + admin. No separate backend or frontend
# packages, because Payload requires the admin panel and its API to compile inside
# the same Next.js application.
#
# CORRECTION (2026-10-01, found during Phase 1 implementation): this plan originally
# placed the route groups at `src/(payload)` and `src/(frontend)`. That was wrong.
# Verified against the official Payload v3.90.2 `website` template, the route groups
# live under `src/app/`, because Next.js requires the `app` directory segment. The
# layout below is corrected.
src/
├── app/
│   ├── (payload)/              # Payload admin + REST/GraphQL API.
│   │   │                       # AUTO-GENERATED by Payload, never hand-edited.
│   │   ├── layout.tsx
│   │   ├── custom.scss
│   │   ├── admin/[[...segments]]/page.tsx
│   │   ├── admin/[[...segments]]/not-found.tsx
│   │   ├── admin/importMap.js
│   │   └── api/[...slug]/route.ts
│   └── (frontend)/             # Storefront. Route group only, no URL segment.
│       ├── layout.tsx          # Fetches site-settings, renders shell
│       ├── globals.css         # Design tokens (Tailwind 4 entry)
│       ├── page.tsx            # Homepage: long-scroll sections
│       ├── not-found.tsx
│       ├── products/
│       │   ├── page.tsx        # Catalogue + filters + search
│       │   └── [slug]/page.tsx # Item detail
│       ├── blog/
│       │   ├── page.tsx
│       │   └── [slug]/page.tsx
│       ├── about/page.tsx
│       ├── contact/page.tsx
│       └── privacy/page.tsx    # Prerequisite for future OAuth consent screen
├── collections/
│   ├── Users.ts                # Admin user (owner). Auth-enabled.
│   ├── Customers.ts            # Deferred auth seam. Retained, unused in v1.
│   ├── Media.ts                # Upload collection, 3 generated sizes
│   ├── Categories.ts           # Self-referencing hierarchy
│   ├── Products.ts             # priceType discriminated pricing
│   ├── Orders.ts               # Persisted enquiry record
│   ├── Messages.ts             # Contact form submissions
│   └── Posts.ts                # Blog
├── globals/
│   └── SiteSettings.ts         # Single source of all business identity
├── components/
│   ├── ui/                     # Button, Input, Select, Textarea, Sheet, Badge
│   ├── layout/                 # Header, Footer, Nav, MobileNav, WhatsAppButton
│   ├── product/                # ProductCard, ProductGrid, Gallery, PriceTag
│   ├── cart/                   # CartDrawer, CartLine, AddressForm
│   ├── filters/                # FilterPanel, SearchBar
│   └── contact/                # ContactForm
├── lib/
│   ├── whatsapp.ts             # buildWaLink, buildOrderMessage  [UNIT TESTED]
│   ├── currency.ts             # PKR formatting                [UNIT TESTED]
│   ├── address.ts              # Provinces + Zod schemas        [UNIT TESTED]
│   ├── filters.ts              # Filter/search predicates       [UNIT TESTED]
│   ├── site-settings.ts        # Typed site-settings accessor
│   ├── rate-limit.ts           # Per-IP limiter
│   └── cart-store.ts           # Zustand, skipHydration, Zod storage
├── email/
│   └── contact-notification.tsx# Notification body
├── tests/                      # Vitest unit tests for src/lib/
├── payload.config.ts
├── payload-types.ts            # Generated; do not hand-edit
└── environment.d.ts
next.config.ts · tsconfig.json · vitest.config.mts · eslint.config.mjs
```

**Structure Decision**: A single Next.js application, chosen over a split frontend and
backend, because Payload's admin panel and API must compile inside the same application
that serves the storefront. A split would require either duplicating the Payload
installation or exposing it as a separate service, both of which defeat the "one
deployable" requirement. The `(payload)` and `(frontend)` route groups under `src/app/`
keep Payload's generated files isolated from storefront code without affecting URLs.

**Package manager deviation from the template**: the official template declares Payload
packages as `workspace:*` and configures a pnpm workspace. npm does not support the
`workspace:*` protocol, so `package.json` is written with concrete pinned versions and
installed with npm. The template's pnpm-specific `onlyBuiltDependencies` build-approval
block is not required by npm and is omitted.

**Database adapter deviation from the template**: the official `website` template ships
with the MongoDB adapter. This project requires PostgreSQL on Neon, so the adapter is
replaced with `@payloadcms/db-postgres` and the `DATABASE_URI` variable is used
throughout. This is a deliberate, planned deviation recorded in research D3.

Storage for the visitor's basket and remembered address is `localStorage` via Zustand
persist, deliberately not a server-side cart, because Principle II prohibits a
server-side cart in v1 and the spec discloses this to the visitor at the point of
collection.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| TypeScript pinned to 5.9.3 while the current `latest` tag is 7.0.2 | TypeScript 7 is the native-compiler rewrite, a new major version. Payload's generated types and Next.js 16's type-checking plugin have not been validated against it here, and a type-check failure mid-build would be discovered late and expensively. | Adopting 7.0.2 immediately. This is a client project on a deadline; a compiler major upgrade is a separate, testable change with its own ADR, not an incidental dependency bump. Revisit after launch with the conformance suite green. |
| Single repository containing both storefront and admin, rather than a library-extraction approach | Principle I mandates one deployable. Payload requires its admin and API to compile inside the same Next.js app. | Extracting the catalogue logic into a standalone library. This would add a build and publish step and a version boundary, without removing any coupling that actually exists. Principle I's rationale explicitly favours the smallest viable diff. |

Two deviations are recorded above. Both are reversions toward stability, not additions of
scope, and both are recorded rather than left silent as Principle I requires.

## Open Governance Items

| Item | Status | Rationale |
|------|--------|-----------|
| ADR: "Payload as sole backend" | **DEFERRED by user on 2026-10-01** | The user chose to defer this to a later date rather than document it now. The decision itself stands and is fully recorded in `research.md` (D3, D4, D5) and `data-model.md`, so nothing is lost by the absence of a formal ADR. Constitution Governance requires consent before an ADR is created, and consent was withheld - the ADR was therefore correctly *not* created. Revisit before the first production deploy, not before implementation. |
| ADR: TypeScript pinned to 5.9.3 | **DEFERRED by user on 2026-10-01** | Same reasoning. The deviation and its rationale are already recorded in Complexity Tracking above. Revisit when upgrading to TypeScript 7. |

## Phase Deliverables

Phase 0 produced [research.md](./research.md). Phase 1 produced
[data-model.md](./data-model.md), [contracts/api-contract.md](./contracts/api-contract.md)
and [quickstart.md](./quickstart.md). The agent context file `AGENTS.md` was updated
from this plan's Technical Context.

The next command is `/sp.tasks`, which derives the testable task list from
`spec.md`, `plan.md`, `data-model.md` and `contracts/`. No implementation code is written
before that list exists, per Section 3 of the constitution.