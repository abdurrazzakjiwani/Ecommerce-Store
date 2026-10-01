# Phase 0 Research: WhatsApp Service Storefront

**Date**: 2026-10-01
**Feature**: `001-whatsapp-storefront`
**Method**: Vendor documentation and package registry verification. Per Constitution
Principle VI, every claim below was checked against an authoritative source. Assumptions
recalled from model training were treated as unverified until confirmed.

Nine technical unknowns were extracted from the Technical Context, plus three dependency
risks. All are resolved below. No `NEEDS CLARIFICATION` marker remains.

---

## D1. Payload + Next.js version compatibility

**Decision**: Next.js 16.3.8 with Payload 3.90.2.

**Rationale**: Payload publishes an explicit supported-range list rather than a loose
range. It requires Next.js `15.2.9`/`15.3.9`/`15.4.11` or **`16.2.6`+**. The current
Next.js release of 16.3.8 clears that floor. Notably the list enumerates specific 15.x
patch levels, which means Payload's compatibility is patch-sensitive and cannot be
assumed from a major version alone.

**Alternatives considered**: Next.js 15.4.x was available but forfeits React 19.2
features. Staying on an older Next.js to gain a wider Payload range is unnecessary since
16.2.6+ is satisfied.

**Source**: Payload installation documentation, "Software Requirements" section.

---

## D2. `cacheComponents` compatibility

**Decision**: Leave Next.js `cacheComponents` **disabled**.

**Rationale**: Payload's documentation carries an explicit caveat that while
`cacheComponents` can be enabled alongside Payload without causing admin-panel errors,
**full compatibility is not guaranteed**. The admin panel is the client's primary
interface, so an officially unsupported interaction is unacceptable on a client project.

**Alternatives considered**: Enabling it and testing. Rejected because "not guaranteed" is
not a testable contract, and the failure mode would be intermittent admin errors.

**Source**: Payload installation documentation, Cache Components callout.

---

## D3. Vercel deployment viability and the official supported path

**Decision**: Deploy the combined application to Vercel with Neon and Vercel Blob.

**Rationale**: Payload publishes an official one-click Vercel deployment described as
"Next.js front end, **Neon** database, and **Vercel Blob** for media storage" — exactly
the stack selected here. This converts the largest integration risk into a documented
supported path rather than an original assembly.

Historical context that matters: earlier Payload versions were **not** supported on
Vercel. The `/admin` route returned 404 on Vercel under Payload 2.x. Version 3 was the
release that made Vercel viable, and the official template exists specifically because
that combination needed first-class support. Deploying a Payload version below 3 without
verifying this would reproduce a well-documented failure.

**Alternatives considered**: A VPS (around USD 6/month) would remove serverless
constraints entirely, at the cost of a Node process the user must maintain and patch.
Rejected for a client site on the basis of lowest operational burden, per the user's
earlier decision to adopt managed hosting. Reconsider if Vercel's constraints accumulate.

**Source**: Payload README one-click deployment section; Payload GitHub issue #8266
maintainer statement that v2 was unsupported on Vercel and v3 is the supported line.

---

## D4. Media upload on Vercel - the 4.5MB constraint

**Decision**: `@payloadcms/storage-s3` against Vercel Blob with **`clientUploads: true`**
and bucket CORS permitting `PUT` from the site origin.

**Rationale**: This is the single highest-severity finding in Phase 0. Payload's S3
adapter documentation states plainly: *"When deploying to Vercel, server uploads are
limited to 4.5MB. Set `clientUploads` to `true` to use upload instructions and send files
directly to S3. You must allow CORS `PUT` requests from your website."*

The naive implementation - proxying uploads through the serverless function - therefore
**fails at around 4.5MB**. Product photography from a modern phone routinely exceeds
that. This is exactly the class of failure the constitution's Principle IV warns about:
it fails silently, in front of the client, during the first real upload.

Two further verified details:
- When the adapter is enabled it **automatically sets `disableLocalStorage: true`** on the
  collection, which is what guarantees images cannot fall back to ephemeral disk. The
  durable-storage guarantee therefore comes from enabling the adapter rather than from
  careful configuration.
- Upload instructions are requested via `POST /api/upload-instructions`, which validates
  `upload.limits.fileSize` before issuing them.

**API shape correction, verified against the installed package (2026-10-01).**
The migration documentation renders the adapter under a **top-level `storage` key**. That
is wrong for v3.90.2. Inspecting the installed type definitions shows:

- `S3StoragePlugin = (storageS3Args: S3StorageOptions) => Plugin` - it returns a **Plugin**.
- `Config` in v3.90.2 has **no top-level `storage` key**. The only extension points are
  `plugins?: Plugin[]` and `db: DatabaseAdapterResult`.
- Therefore the adapter must be registered as `plugins: [s3Storage({ ... })]`.

The top-level `storage` array shown in the docs applies to a different Payload version.
Using it would have produced a config that neither type-checks nor applies the adapter,
silently leaving media on ephemeral disk. Accepted options are `bucket`, `config`
(an AWS `S3ClientConfig`), `collections`, `clientUploads`, `acl`, `signedDownloads`,
`disableLocalStorage`, `enabled`, `clientCacheKey`, `alwaysInsertFields` and
`useCompositePrefixes`.

`clientUploads` is typed as `ClientUploadsConfig = { access?: ClientUploadsAccess } | boolean`,
where `ClientUploadsAccess` receives `{ collectionSlug, req }`. It is set here with an
access function requiring an authenticated user, so upload instructions are never issued
to an anonymous visitor.

**Empirical confirmation**: after enabling the adapter, Payload's generated
`src/app/(payload)/admin/importMap.js` contains an entry for `S3ClientUploadHandler` from
`@payloadcms/storage-s3/client`. The client-upload path is active, not merely configured.

**Alternatives considered**: No alternative. The constraint is platform-imposed. The
mitigation is architectural: `clientUploads: true` plus documented bucket CORS
configuration, with an explicit upload-redeploy-confirm gate before the build is called
startable.

**Source**: `@payloadcms/storage-s3` README, Vercel deployment note; Payload upload
instructions documentation.

---

## D5. Payload version floor - the serverless autosave race

**Decision**: Pin Payload at **3.90.2** and treat **3.83.0 as a hard floor**.

**Rationale**: A reported defect affects Payload 3.81.0 and 3.82.0 on Vercel:
intermittent HTTP 500 on autosave, surfacing as
`TypeError: Cannot read properties of undefined (reading '_status')`. Root cause is
concurrent autosave requests racing inside `updateLatestVersion`; `saveVersion()` returned
`undefined` on failure and callers passed it onward without a null check. The official fix
- throw instead of returning undefined - shipped in **v3.83.0**.

The reproduction conditions match this project precisely: `@payloadcms/db-postgres` with
Neon, deployed on Vercel serverless, not reproducible on a local single-process dev
server. A defect that "cannot be reproduced on local dev" is the most dangerous class,
because the local verification pass would pass.

**Alternatives considered**: Older Payload for stability. Rejected; we are on 3.90.2,
comfortably above the fix.

**Source**: Payload GitHub issue #16217, and the v3.83.0 release notes confirming the
fix.

---

## D6. Zustand persistence under SSR

**Decision**: Zustand `persist` with `skipHydration: true`, a manual
`useCartStore.persist.rehydrate()` in a mount effect, a `useHydration()` hook driving
count/badge rendering, and a **Zod-validating** custom `PersistStorage`.

**Rationale**: Three distinct problems, each with a verified remedy:

1. **Hydration mismatch.** Zustand's own guidance for server-rendered apps is to set
   `skipHydration: true` and rehydrate manually after mount. Without it, the server
   renders an empty basket and the client renders a populated one, producing a mismatch
   and a cart badge that changes size after load.
2. **Unvalidated persisted state.** Zustand's documentation carries an explicit warning:
   `createJSONStorage` "does not perform any runtime validation. The value read from
   storage is cast directly to your state type without checking its shape, so corrupt,
   stale, or tampered data will not be caught at runtime." It even suggests Zod for this.
   We already depend on Zod 4.6.5, so a validating storage adapter costs little and turns
   a corrupt basket into a reset rather than a crash.
3. **State shape drift.** `partialize` restricts what is written, and `version` plus
   `migrate` lets a future basket-shape change be handled without stranding returning
   visitors with unreadable storage.

**Alternatives considered**: Default `createJSONStorage`. Rejected on the explicit
documentation warning. No persistence at all. Rejected; spec FR-015 requires the basket
to survive closing the site.

**Source**: Zustand persisting-store-data reference, `skipHydration` and `PersistStorage`
option documentation.

---

## D7. WhatsApp deep-link grammar

**Decision**: `https://wa.me/<digits-only-number>?text=<encodeURIComponent(message)>`,
with `923394299873` for `+92 3394299873`.

**Rationale**: WhatsApp's official documentation specifies `https://wa.me/` followed by
"a full phone number in international format" and instructs: "Omit any zeroes, brackets,
or dashes." Its documented bad example is `https://wa.me/+001-(XXX)XXXXXXX`. Prefilled
text is `https://wa.me/whatsappphonenumber?text=urlencodedtext`. Critically, the docs also
confirm the link does **not** send automatically - it pre-fills the field for the sender
to send. The message must be encoded or it truncates at the first space.

This confirms rather than extends the earlier research, and it validates the whole
"conversion, not transaction" framing: WhatsApp is a handoff, which is precisely why
spec FR-022 requires a separate persisted record.

**Alternatives considered**: `https://api.whatsapp.com/send?phone=<n>&text=<t>` is
functionally equivalent but longer. Rejected on readability and shareability.

**Source**: WhatsApp Help Center, "How to use click to chat".

---

## D8. Google OAuth verification requirements (deferred feature)

**Decision**: No work in v1. When enabled, request only `openid`, `email`, `profile`,
and implement as a Payload custom auth strategy rather than Auth.js.

**Rationale**: Verified from Google's production-readiness matrix. For apps requesting
only basic identity scopes:

- No brand verification is required.
- No sensitive or restricted scope review.
- No demonstration video.
- **The 100-user cap does not apply.** Google's own text exempts apps requesting a
  subset of name, email and profile.
- Authorizations do not expire after 7 days, which the test-user exception would otherwise
  impose.

Implementation constraint, verified: Payload ships three built-in strategies (HTTP-only
cookies, JWT, API keys) and **no** built-in Google OAuth. Its official SSO plugin is
Enterprise-only. Payload maintainers explicitly advise against adding Auth.js on top,
because Payload already issues its own JWT and cookie, so Auth.js would duplicate and
conflict with it. A custom strategy plus two route handlers is therefore the correct
route.

One further known constraint to record now: Payload cannot fully remove the password
field from an auth-enabled collection, so an internally generated random password is
required per OAuth login.

**Alternatives considered**: Auth.js v5. Rejected on maintainer guidance. Payload
Enterprise SSO. Rejected on licence cost. A community OAuth plugin. Rejected as
unmaintained third-party code in a client project.

**Source**: Google OAuth 2.0 production-readiness documentation; Google Cloud OAuth
app-audience documentation; Payload custom-strategies documentation; Payload community
discussion on combining Payload with NextAuth.

---

## D9. Email adapter and deliverability

**Decision**: `@payloadcms/email-resend` 3.90.2 with the Resend API, notification
recipient read from `site-settings.notificationEmail`.

**Rationale**: Payload's email example names `@payloadcms/email-nodemailer` as its
general recommendation, but that adapter is transport-agnostic and can be pointed at
Resend's SMTP relay. Using the first-party `@payloadcms/email-resend` keeps the API-key
path rather than routing through SMTP credentials. A collection `afterChange` hook calling
`payload.sendEmail()` is the documented pattern for transactional notifications.

Verified limits: Resend's free tier is **3,000 emails/month with a 100/day cap**, no
verification, no dedicated IP. This comfortably covers contact-form volume for a business
of this size. The paid tier removes the daily cap.

A verified design consequence: `nodemailerAdapter()` with no configuration falls back to
ethereal.email and logs credentials to the console. The adapter must therefore be
explicitly configured, and the development fallback must not be mistaken for working
delivery.

**Alternatives considered**: Gmail SMTP from the business owner's own address. Rejected:
Gmail caps at roughly 500 messages/day, it silently degrades into spam folders near that
limit, and it requires exposing the account password to the application. SMTP from the
hosting provider. Rejected; no mailbox exists yet.

**Source**: Payload email documentation and example; Resend published pricing.

---

## D10. Email and phone domain rules

**Decision**: Hardcode the seven Pakistani provinces and territories; validate postal
codes as exactly five digits.

**Rationale**: Verified against Pakistan Post's own published directory, which associates
every delivery post office with a province. The observed codes are five digits - two
specifying the district for routing, three narrowing to the exact post office - introduced
by Pakistan Post on 1 January 1988. Top-level units confirmed from the same source:
Punjab, Sindh, Balochistan, Khyber Pakhtunkhwa, Federal Capital, Azad Kashmir and
Gilgit Baltistan. The listing of exactly these seven is what makes a fixed dropdown
correct rather than a guess, and it is why no international country selector is needed.

**Alternatives considered**: A free-text country and region pair. Rejected; spec FR-018
requires the list, and free text produces unrouteable addresses.

**Source**: Pakistan Post official post-code directory; Wikipedia postal-code
documentation for the five-digit structure.

---

## D11. Build-time database connectivity

**Decision**: Connect to Postgres during the build, and use `generateStaticParams` with
an explicit fallback rather than relying on it succeeding.

**Rationale**: Payload's production documentation identifies this as one of the most
common production build problems: Next.js static generation is on by default for route
segments, and any SSG'd segment using Payload's Local API therefore requires a database
connection **at build time**. Payload itself does not have this requirement - the
requirement comes from Next.js. The mitigation is to either provide the connection string
during the build or opt those segments out of static generation.

**Consequence for this plan**: the build must not be assumed hermetic. Neon connectivity
is required in the build environment, and this must be handled at scaffold time rather
than discovered at first deploy.

**Source**: Payload production documentation, "Building without a DB connection".

---

## D12. TypeScript version selection

**Decision**: Pin **TypeScript 5.9.3**. Do not adopt 7.0.2 despite it being `latest`.

**Rationale**: Verified via the npm registry that `typescript@latest` is now **7.0.2**,
with 7.1.0 in development, a 6.0.0 beta present, and **5.9.3** the final 5.x release.
TypeScript 7 is the native-compiler rewrite - a new major, not an incremental release.
Adopting a compiler major is a change with its own test surface and its own ADR, and
doing it incidentally inside a client build would be poor practice.

**Alternatives considered**: Adopt 7.0.2 now. Rejected for a client project on a
deadline; recorded in Complexity Tracking as a deliberate deviation from `latest`, and
scheduled for re-evaluation after launch with the conformance suite green.

**Source**: npm registry dist-tags for `typescript`.

---

## Consolidated Risk Register for Implementation

| Risk | Decision | Verification gate |
|------|----------|-------------------|
| Images lost on redeploy (highest severity) | D4 | Upload, redeploy, confirm still served. Scaffold-time gate. |
| Upload fails above 4.5MB | D4 | `clientUploads: true` plus CORS. Test with a real oversized photo. |
| Admin autosave 500s under concurrency | D5 | Payload >= 3.83.0. Confirm exact version at install. |
| Build fails for want of a database | D11 | Provide the connection string to the build environment. |
| Hydration mismatch or crash on corrupt basket | D6 | `skipHydration` plus Zod storage. Unit test. |
| Local dev passes, production fails | D5, D4, D11 | Explicit gates exist because local dev cannot reproduce any of these. |
| Contact email silently undelivered | D9 | Assert the record persists when the send fails. |
| Unknown catalogue composition | `priceType` | Owner edits pricing type in admin without schema change. |
| OS dark mode alters the cream theme | Principle V | No dark palette exists; dark mode has nothing to switch to. |

## Resolved Clarifications

All NEEDS CLARIFICATION markers are resolved. The only input that could not be resolved
from vendor sources is the client's catalogue composition, and that is deliberately **not**
a research question: Constitution Principle III forbids guessing, and instead requires the
model to accommodate every possible answer. `priceType` exists so that goods, software and
services coexist without rework.