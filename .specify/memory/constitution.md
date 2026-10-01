# ecommerce_website Constitution

<!--
  Reconstructed 2026-10-01 from two surviving records of the original ratification:
  PHR-001 (which recorded ratifying v1.0.0 on this date) and the Constitution Check
  that feature 001's plan.md executed against it. The file itself was never written
  to disk; see the header note in specs/002-polish-storefront/plan.md.

  v1.0.0 = initial adoption. This is a reconstruction of that adoption, not an
  amendment, so the version is unchanged and the ratification date is preserved.
-->

## Core Principles

### I. Single Deployable, Merchant-Owned Platform
Storefront, API, and admin panel ship as one application from one repository. All
business identity - name, logo, WhatsApp numbers, address, email recipient, social
links - resolves at runtime from the `site-settings` global through a single read
path. No component may receive a hardcoded business string, and no hosted SaaS may
be the source of truth. The merchant must be able to change any of these values
through the admin panel with no code change and no redeploy.

*Rationale: the client is the operator, not a developer. A value that requires an
engineer to change is a value that will stay wrong.*

### II. Contact-First Conversion, No Payment Gateway
The WhatsApp deep link is the terminating call to action and the only purchase
path. No payment gateway, processor, or card handling enters the design. Every
checkout writes an `orders` document so the merchant's own record does not depend
on WhatsApp retaining a conversation.

*Rationale: the client asked for WhatsApp as the channel and no online payment.
Persisting the order locally is what stops a cleared WhatsApp history from
erasing a sale.*

### III. Flexible Schema, Deferred Specifics
The catalogue is unconfirmed, so the schema models goods, software, and services
simultaneously: a `priceType` discriminator of `fixed | from | quote`, and `specs`
as an open key-value list rather than a fixed field set. Categories nest by
self-reference to arbitrary depth. Three deferred seams are preserved as real
structures rather than commented-out placeholders: a `customers` collection with
auth enabled but unused, an optional `customer` relation on `orders`, and all
colour values resolved from one token source. Placeholder content must be
self-evidently provisional. Business identity must never be inferred from
incidental sources such as an email domain.

*Rationale: the client confirmed only "software and hardware". Committing to a
rigid schema now would mean a migration later; the seams keep each deferred
feature a UI task rather than a rewrite.*

### IV. Durable Assets and Secret Hygiene
Media MUST use S3-compatible object storage, because serverless local disk does
not survive a redeploy and silent image loss is the top failure mode this project
could ship without anyone noticing until a client demo. Durability is proven by
upload, redeploy, and confirm - in that order - before a build is considered
startable, not at deployment time. Secrets are environment-only; the notification
recipient is the single client-editable value and provider credentials are not.
Public write is limited to contact submission, guarded by schema validation, a
honeypot field, a minimum-submission-time check, and a per-IP rate limit.

*Rationale: the client's own photographs are the product imagery. Losing them
silently is worse than a visible outage.*

### V. Accessibility and Evidence-Based Design
WCAG 2.1 AA is a per-phase gate, not a final review. Contrast ratios are recorded
alongside each design token so that rejected pairs remain auditable. Touch targets
are at least 44x44 pixels. The `prefers-reduced-motion` setting is honoured. Icons
are SVG, never emoji. The site is **light mode only** - enforced by the absence of
a dark palette rather than by discipline, so OS-level dark mode has nothing to
switch to. All four breakpoints are in the gate list.

*Rationale: a professional appearance is partly an accessibility outcome. The
client rejected a dark theme outright, so the token set carries that decision
structurally.*

### VI. External Verification and Verbatim Traceability
Vendor facts - version compatibility, API limits, protocol grammar, deprecations -
MUST be verified against vendor documentation or a live response, never recalled
from training data. Prompt History Records capture prompts verbatim. ADRs are
never auto-created.

*Rationale: several load-bearing facts in this project contradict what a
practised model would confidently recall, including the TypeScript `latest` version
and Payload's storage-plugin shape. Recall is not a verification strategy.*

## Constraints and Non-Functional Requirements

**Pinned stack.** Next.js 16.3.8, Payload 3.90.2, `@payloadcms/next` 3.90.2,
`@payloadcms/db-postgres` 3.90.2, `@payloadcms/storage-s3` 3.90.2,
`@payloadcms/richtext-lexical` 3.90.2, `@payloadcms/email-resend` 3.90.2,
Tailwind CSS 4.3.3, Zustand 5.0.15, Embla Carousel React 8.6.0, Zod 4.6.5,
react-hook-form 7.89.0, sharp 0.35.5, lucide-react, TypeScript 5.9.3, Node.js 24.16.x
(24.x LTS), Vitest 5.0.3, @testing-library/react 16.3.3. Storage is PostgreSQL on
Neon with media in Vercel Blob over the S3-compatible API; no local filesystem
persistence.

**Operational constraints.**
- Next.js `cacheComponents` remains **disabled**: Payload admin compatibility is
  explicitly "not guaranteed".
- Payload MUST stay at or above **3.83.0**. 3.81.0-3.82.0 carry a serverless
  autosave race producing intermittent 500s that cannot be reproduced locally.
- TypeScript is pinned to **5.9.3**, not the current `latest` of 7.0.2, which is
  the native-compiler rewrite. Upgrading is a separate change with its own ADR.
- Vercel requires `clientUploads: true` plus bucket CORS on `PUT`; the platform
  caps proxied server uploads at 4.5MB, which modern phone photographs exceed.
- The build requires a database connection, because Next.js static generation and
  Payload's Local API both need Postgres at build time.
- On Windows, npm MUST be invoked as **`npm.cmd`**: PowerShell's execution policy
  blocks `npm.ps1`. This applies to `.specify` scripts and every documented command.
- WhatsApp numbers are stored digits-only - no `+`, spaces, dashes, or brackets.
- Client-supplied prices are never trusted; the enquiry endpoint re-reads prices
  from the database.
- Catalogue stays under roughly 100 items so filtering and search run client-side.

**Performance targets.** LCP under 2.5s on throttled 4G; CLS under 0.1; filter
and search results update within 1 second at 100 catalogue items; TTFB under 300ms
from the Postgres region nearest the visitor.

**Design tokens are frozen.** The adopted accent is `#B45309` at 4.91:1 against the
cream surface. The rejected amber `#D97706` at approximately 3:1 is documented
here so that the rejection stays auditable and is not silently reintroduced.
**Testing discipline.** Unit tests cover every pure function in `src/lib/`.
Anything whose output reaches a third party carries adversarial-input tests, which
here means the WhatsApp link builder. Access rules are tested for both permit and deny
paths, because a permissive default is the failure mode that matters.

## Development Workflow

1. **Specify** - requirements as testable statements, technology-agnostic.
2. **Plan** - Constitution Check answered gate by gate before Phase 0 research. A
   FAIL blocks. A justified deviation is recorded in Complexity Tracking, never
   left as an unexplained exception. The Check is re-run after Phase 1 design.
3. **Tasks** - each task traceable to a requirement.
4. **Implement** - per-phase gates, each with a verification command.

**Ordering constraint:** media storage durability is proven at scaffold time
(upload, redeploy, confirm) before a build is considered startable.

**Email is a convenience layer.** Contact submissions persist to `messages` before
notification is attempted; a failed send is logged, never surfaced as data loss.

**Anti-spam must not reject genuine visitors.** The minimum-submission-time
threshold is a named constant with its rationale attached, and a normal reading
and typing timeframe always succeeds.

## Governance

This constitution supersedes all other practice. Amendments require documentation,
explicit consent, and a migration plan; semver governs the version. Every plan
carries a Constitution Check. ADRs are **mandatory** for stack changes, payment
integration, customer authentication, and media-storage changes, and are never
auto-created. Composition of this document from PHR-001, feature 001's
Constitution Check, and `AGENTS.md` is the accepted source of truth until an
amendment supersedes it.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
