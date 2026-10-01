# API Contract: WhatsApp Service Storefront

**Date**: 2026-10-01
**Feature**: `001-whatsapp-storefront`
**Derived from**: [data-model.md](./data-model.md), [spec.md](./spec.md)

Payload generates its REST and GraphQL APIs from the collection configs. This document
records the resulting public surface, the two custom endpoints that are hand-written, and
the error taxonomy. It exists so the read/write boundary is explicit and reviewable rather
than emergent.

## Design Rule: Never Trust Client Prices

**The single most important rule in this document.**

A browser submitting a basket sends **product identifiers and quantities only**. The
server re-reads every price from the database and computes every total itself. Client
supplied prices, subtotals and display labels are ignored even if present, because a
modified browser can send anything, and because a stale cached page could otherwise
produce an order record that disagrees with what the owner sees in his admin.

Consequence: the WhatsApp message text is generated **server-side** as well, so the
message the owner receives and the record the owner sees cannot diverge.

## Authentication

None in v1. There are no visitor sessions and no bearer tokens on public endpoints. The
consequences are deliberate:

- Public endpoints are **unauthenticated** and must be safe to call by anyone.
- The only authenticated surface is Payload's admin API, gated by Payload's own
  HTTP-only session cookie, which is never exposed to visitor code.
- Enabling Google login later adds sessions without changing these contracts, because
  these endpoints remain public-by-design; authentication would gate the account pages,
  not the enquiry path.

---

## Custom Endpoint 1: Cart Enquiry

`POST /api/enquiry`

Records an enquiry when a visitor checks out, so the owner retains a record independent
of WhatsApp (spec FR-022, FR-023; Principle II).

**Request body**

```jsonc
{
  "source": "whatsapp-cart",          // enum: whatsapp-cart | whatsapp-single
  "customerName": "Ahmed Khan",       // required, 1-120 chars
  "customerPhone": "03001234567",     // required, Pakistan mobile
  "customerEmail": "ahmed@example.com", // optional
  "notes": "Please call before delivery", // optional, max 1000 chars
  "address": {                        // required
    "line1": "House 12, Street 4",    // required, 1-200 chars
    "line2": "Gulberg III",           // optional
    "city": "Lahore",                 // required
    "province": "Punjab",             // required, one of the seven
    "postalCode": "54660"             // required, /^[0-9]{5}$/
  },
  "items": [                          // required, 1-50 entries
    { "slug": "dell-latitude-5420", "qty": 2 }
  ]
}
```

**Deliberately absent**: `price`, `unitPrice`, `subtotal`, `priceType`, `title`, `image`.
All are resolved server-side. The request cannot express a price.

**Server behaviour**

1. Validate the body against a Zod schema. On failure: `422`, field-level errors.
2. Apply per-IP rate limiting.
3. Resolve each `slug` to a published product. Unknown or unpublished slugs: `422`.
4. Snapshot title, slug, qty, unitPrice, priceType and image from the database.
5. Compute the subtotal from priced items only. Set `hasQuoteItems` when any line is
   `quote`. Never persist a total covering a quote item.
6. Generate the WhatsApp message text from the resolved snapshot.
7. Create the `orders` document.
8. Return the message text and the deep link. The client then opens WhatsApp.

**Responses**

| Status | Body | Cause |
|---|---|---|
| `201` | `{ "orderId": "...", "message": "...", "link": "https://wa.me/923394299873?text=..." }` | Success |
| `400` | `{ "error": "Malformed JSON body" }` | Body is not valid JSON |
| `422` | `{ "error": "Validation failed", "fields": { "postalCode": "Must be 5 digits" } }` | Schema or resolution failure |
| `429` | `{ "error": "Too many requests", "retryAfter": 60 }` | Rate limit exceeded |
| `500` | `{ "error": "Could not record enquiry" }` | Unexpected. **WhatsApp link is still returned** so the visitor is never blocked by our failure. |

The `500` behaviour is a direct requirement of Principle II: an enquiry that cannot be
recorded must still reach the business by WhatsApp. The visitor's path to the seller is
never gated on our storage working.

**Idempotency**: no idempotency key in v1. A double-submitted enquiry produces two
records, which is acceptable for a conversational flow where the duplicate is visible to
the owner and harmless. Revisit if the owner's inbox shows duplicates in practice.

---

## Custom Endpoint 2: Contact Enquiry

`POST /api/contact`

Records a contact form submission and triggers notification (spec FR-035 to FR-041).

**Request body**

```jsonc
{
  "name": "Ahmed Khan",               // required, 1-120
  "email": "ahmed@example.com",       // required, RFC-shaped
  "phone": "03001234567",             // optional, Pakistan mobile if present
  "subject": "Bulk hardware quote",   // required, 1-160
  "message": "We need 20 laptops.",   // required, 1-5000
  "referringPage": "/products/...",   // optional
  "website": "",                      // honeypot, MUST be empty
  "formStartedAt": 1727000000000      // ms epoch, from the form's render time
}
```

**Server behaviour**

1. **Reject on honeypot** if `website` is non-empty. Return `200` with a success shape, not
   an error, so the bot learns nothing. No document, no email.
2. **Reject on timing** if `now - formStartedAt < 3000`. Same silent-success shape.
   This is the stateless protection that survives serverless parallelism.
3. Rate limit per IP.
4. Validate with Zod. On failure: `422` with field-level errors.
5. Create the `messages` document with `status: "new"`, `emailSent: false`.
6. **Then** attempt notification in an `afterChange` hook. On failure the document
   persists and `emailSent` stays false.

**Responses**

| Status | Body | Cause |
|---|---|---|
| `201` | `{ "ok": true }` | Success |
| `200` | `{ "ok": true }` | **Deliberate** silent accept for a rejected bot submission |
| `400` | `{ "error": "Malformed JSON body" }` | Not valid JSON |
| `422` | `{ "error": "Validation failed", "fields": { "email": "Enter a valid email address" } }` | Schema failure |
| `429` | `{ "error": "Too many requests", "retryAfter": 60 }` | Rate limit |

**Response-shape note**: rejections that return `200` and rejections that return `422`
together let a clever client distinguish "your input was invalid" from "you were filtered".
A bot probing for a way around the filter can use that signal. Returning `200` for
filtered submissions removes the oracle at the cost of a slightly imprecise error surface,
which is the correct trade for an endpoint that is public and unauthenticated.

**Privacy**: spec FR-053 states no visitor personal data is stored beyond enquiries they
choose to send. The delivery address is **not** part of this contract because the contact
form has no delivery. The cart endpoint stores an address snapshot because the visitor
explicitly supplies it to complete an enquiry. Addresses saved for reuse in the browser
never reach either endpoint.

---

## Payload-Generated Endpoints (public surface)

Paths follow Payload's conventions. Read access below is the effective public access after
access-control evaluation.

| Method | Path | Access | Notes |
|---|---|---|---|
| `GET` | `/api/products?where[...]&limit=...&sort=...` | public, published only | Catalogue. Honours `where`, `sort`, `limit`, `depth`. |
| `GET` | `/api/products/:slugOrId` | public, published only | Item detail. |
| `GET` | `/api/categories?depth=2` | public | Tree for the category rail. |
| `GET` | `/api/posts?sort=-publishedAt` | public, published only | Blog index. |
| `GET` | `/api/posts/:slugOrId` | public, published only | Blog detail. |
| `GET` | `/api/media/:id` | public | Image bytes and generated sizes. |
| `GET` | `/api/site-settings` | public | Business identity. Deliberately public: the storefront must render it server-side. |
| `GET` | `/api/globals/site-settings` | public | Global accessor form. |
| `POST` | `/api/upload-instructions` | admin only | Upload flow with `clientUploads: true`. |
| `POST/PATCH/DELETE` | `/api/products`, `/api/categories`, `/api/media`, `/api/posts`, `/api/site-settings` | **admin only** | Owner operations. |
| `POST/PATCH/DELETE` | `/api/orders`, `/api/messages` | **denied** | Written only by the two custom endpoints. |
| `POST` | `/api/messages` | **denied** | Replaced by `/api/contact`. Direct creation is closed so spam controls cannot be bypassed. |
| `POST` | `/api/users/login`, `/api/users/logout`, `/api/users/me` | admin only | Owner authentication, handled by Payload. |

### Access-control rules to enforce

| Collection | create | read | update | delete |
|---|---|---|---|---|
| `media` | admin | public | admin | admin |
| `categories` | admin | public | admin | admin |
| `products` | admin | public (published) | admin | admin |
| `posts` | admin | public (published) | admin | admin |
| `orders` | admin | admin | admin | admin |
| `messages` | admin | admin | admin | admin |
| `site-settings` | admin | public | admin | admin |
| `users` | first user only, then admin | admin | self or admin | admin |
| `customers` | disabled in v1 | disabled in v1 | disabled in v1 | disabled in v1 |

**Every rule is explicit.** Principle IV requires this because a permissive default is the
failure mode: a collection with no declared access rule is the most likely way enquiry
contents or draft content leak publicly.

**Verification required**: each rule MUST be tested in both directions - permitted and
denied - per the constitution's Testing Discipline. A rule that has only been confirmed
permissive has not been tested.

### `site-settings` is publicly readable

This deserves stating explicitly because it looks alarming. The settings record contains
only the values the storefront must display anyway: business name, logo, phone, WhatsApp
number, address, socials, delivery terms. Every one of these is rendered into public HTML
by design (spec FR-051). Public read therefore discloses nothing that is not already on the
page.

It must **not** be extended to hold provider credentials or any secret. The email API key
stays in the environment and is never a settings field (Principle IV).

---

## Error Taxonomy

| Code | Meaning | Client behaviour |
|---|---|---|
| `200` | Success, or a deliberately silent rejection of filtered input | Show confirmation |
| `201` | Created | Show confirmation, then open WhatsApp |
| `400` | Malformed request body | Show generic retry |
| `401` | Not authenticated as the owner | Redirect to admin login |
| `403` | Authenticated but not permitted | Show permission message. Must never be reachable by visitors. |
| `404` | Document absent, or exists but is a draft | Render the not-found state. Drafts must be indistinguishable from absent so unpublished content cannot be probed. |
| `409` | Unique constraint conflict, e.g. duplicate slug | Show which field conflicts |
| `413` | Upload exceeds the size ceiling | Prompt for a smaller file |
| `422` | Validation failed; field errors included | Show errors on the offending fields |
| `429` | Rate limited | Show retry guidance; honour `Retry-After` |
| `500` | Unexpected server failure | Generic apology. For `/api/enquiry`, still return the WhatsApp link. |
| `503` | Upstream dependency unavailable (email) | Record already exists; log and surface nothing to the visitor |

**Draft invisibility**: `404` rather than `403` for a draft. Returning `403` confirms the
document exists, which would let a visitor enumerate unpublished products by slug. This
serves spec FR-031 and Principle IV.

## Client-Side Utilities with No Endpoint

These have no server route because they produce a link, not a record. Both live in
`src/lib/` and are unit-tested per the constitution.

### WhatsApp link builder

`buildWaLink(number: string, message: string): string`

Produces `https://wa.me/<digits>?text=<encodeURIComponent(message)>`. Strips every
non-digit character from `number`. Returns `https://wa.me/?text=...` when the number is
absent, which opens the contact picker rather than a specific chat.

**Adversarial input testing is mandatory here** (constitution Testing Discipline). The
output goes to a third party, so the tests must prove encoding is applied: item names
containing `&`, `#`, `?`, `%`, newlines, emoji, and right-to-left characters must all
round-trip intact without truncating at the first space or injecting parameters into the
link. A WhatsApp's own documentation states an unencoded message truncates at the first
space, so this is a verified failure mode rather than a theoretical one.

### Order message builder

`buildOrderMessage(items, address, customer, businessName): string`

Server-authoritative in `/api/enquiry`. A client-side preview variant renders the same
shape for immediate feedback, so the visitor sees the message before WhatsApp opens. Both
must produce equivalent output; a divergence is a defect, and the shared formatter is what
prevents it.

Format:

```text
New Order - {businessName}

1. {title}
   {qty} x {price} = {lineTotal}
2. {title}
   {qty} x Request quote

Subtotal: {subtotal}
{N} item(s) require a quotation

--- Delivery ---
Name: {customerName}
Phone: {customerPhone}
Address: {line1}, {line2}
City: {city} | Province: {province} | Postal: {postalCode}
Notes: {notes}
```

**Test cases that MUST exist**, because each corresponds to a spec edge case:

| Case | Expected |
|---|---|
| Basket with only quote items | No subtotal claimed; message requests a quotation |
| Mixed priced and quote items | Subtotal covers priced items only, with a quote count |
| `priceType: from` line | Labelled as a starting price, not a final price |
| Empty notes | Line omitted entirely, not rendered blank |
| Zero-quantity line | Rejected upstream; never rendered |
| Item title containing a newline | Cannot break the message layout (escaped or stripped) |

## Rate Limiting

Per-IP token bucket, applied in server-side `beforeValidate` on the two custom endpoints.

**Verified limitation, documented rather than hidden**: the limiter is in-process. Vercel
serverless instances are parallel and short-lived, so an in-memory bucket does not reliably
span instances. The stateless protections - honeypot and the three-second timing floor -
carry the actual protection and work in every execution context. The limiter is defence in
depth for local development and single-instance deployments. Upgrading to a shared store
is an isolated change if spam becomes a measured problem.