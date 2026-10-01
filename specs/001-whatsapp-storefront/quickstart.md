# Quickstart: WhatsApp Service Storefront

**Date**: 2026-10-01
**Feature**: `001-whatsapp-storefront`

Setup, verification, and the gates that must pass before this build is called
startable. Follow the order below; several steps exist specifically to catch failures that
local development cannot reproduce.

---

## Prerequisites

| Requirement | Version | Verify |
|---|---|---|
| Node.js | 24.16.x or later 24.x | `node --version` |
| npm | ships with Node | `npm.cmd --version` |
| Neon account | free tier | Console access |
| Vercel account | Hobby | CLI or dashboard |
| Vercel Blob store | any size | Attached to the Vercel project |
| Resend account | free tier | API key issued |

> **Windows note**: this machine's PowerShell execution policy blocks `npm.ps1`. Invoke
> npm as **`npm.cmd`** throughout. `.specify` scripts must be run as
> `powershell.exe -ExecutionPolicy Bypass -File <script>`.

---

## Step 1 - Scaffold the application

```powershell
npx.cmd create-payload-app@latest
```

Selections that matter, and why:

| Choice | Value | Reason |
|---|---|---|
| Template | `website` | Gives the storefront structure. Do **not** choose `blank`. |
| Database | Postgres | Neon is Postgres. SQLite is wrong for serverless - no shared file across instances. |
| Install deps | yes | |

The official Payload Vercel deployment uses Next.js + Neon + Vercel Blob, which is exactly
this stack, so the scaffolded configuration is the supported path rather than an original
assembly (research D3).

### Pin the versions

Immediately after scaffold, pin these. A fresh scaffold may resolve versions that have
moved since this plan was written.

```powershell
npm.cmd install next@16.3.8
npm.cmd install payload@3.90.2 @payloadcms/next@3.90.2 @payloadcms/db-postgres@3.90.2 `
  @payloadcms/storage-s3@3.90.2 @payloadcms/richtext-lexical@3.90.2 `
  @payloadcms/email-resend@3.90.2
npm.cmd install -D typescript@5.9.3 sharp@0.35.5 vitest@5.0.3 @testing-library/react@16.3.3
```

**Three pins are not optional and each has a verified reason:**

- **Next.js 16.3.8** clears Payload's stated floor of `16.2.6`. Payload enumerates exact
  patch levels for 15.x, so compatibility is patch-sensitive (research D1).
- **TypeScript 5.9.3, not 7.0.2.** `typescript@latest` is now 7.0.2, the native-compiler
  rewrite. A compiler major is a separate change with its own ADR (research D12).
- **Payload 3.90.2, never below 3.83.0.** Versions 3.81.0 and 3.82.0 have a serverless
  autosave race causing intermittent 500s. The fix shipped in 3.83.0. It **cannot be
  reproduced on a local dev server**, so nothing else will catch it (research D5).

### Confirm `cacheComponents` is off

It must remain disabled. Payload's docs state full compatibility is **not guaranteed**
while the admin panel's usability depends on it (research D2).

---

## Step 2 - Environment

Create `.env` from the template. Never commit it.

```bash
# --- Database (Neon: use the POOLED connection string) ---
DATABASE_URI=

# --- Auth ---
PAYLOAD_SECRET=            # generate: openssl rand -base64 32
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# --- Email (Resend) ---
RESEND_API_KEY=
RESEND_FROM=               # verified sending domain

# --- Media storage (Vercel Blob via S3-compatible API) ---
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_ENDPOINT=              # Vercel Blob S3-compatible endpoint
AWS_REGION=auto
```

`.env.example` must contain every key above with an empty value. Payload's docs warn that
an unconfigured email adapter falls back to ethereal.email and prints credentials to the
console, so a silent development fallback must not be mistaken for working delivery
(research D9).

### Confirm `.env` is ignored

```powershell
git check-ignore .env    # must report .env as ignored
```

If it does not, stop and fix `.gitignore` before continuing (Principle IV).

---

## Step 3 - Configure Payload

`payload.config.ts`, per [data-model.md](./data-model.md):

1. **`db`** - `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })`
2. **`email`** - `resendAdapter({ apiKey, from })`, explicitly configured
3. **`storage`** - `s3Storage({ collections: { media: true }, bucket, config: { credentials, region, endpoint } })`
   - Confirm `disableLocalStorage` becomes `true` for `media`. This is the guarantee that
     images cannot fall back to ephemeral disk (research D4).
4. **`editor`** - `lexicalEditor()`
5. **`sharp`** - required for image resizing
6. **`collections` / `globals`** - the nine types from `data-model.md`

### Storage upload mode - the 4.5MB gate

Vercel caps proxied server uploads at **4.5MB**. The S3 adapter documentation is explicit:

> Set `clientUploads` to `true` to use upload instructions and send files directly to S3.
> You must allow CORS `PUT` requests from your website.

Without `clientUploads: true`, uploads fail silently at roughly 4.5MB - and modern phone
photographs routinely exceed that. This is the single highest-severity configuration item
in the project.

Configure CORS on the Vercel Blob store:

| Setting | Value |
|---|---|
| Allowed origin | `https://<your-domain>` and `http://localhost:3000` |
| Allowed methods | `PUT`, `GET`, `POST` |
| Allowed headers | `*` |
| Expose headers | `ETag` |
| Max age | `86400` |

---

## Step 4 - Design tokens

Define in `globals.css` as CSS custom properties. Frozen per the constitution; changes need
a recorded reason.

```css
:root {
  --bg: #FFFBEB;         /* page, warm cream */
  --surface: #FFFFFF;   /* card */
  --text: #1C1917;       /* 16.1:1 on --bg */
  --primary: #44403C;
  --accent: #B45309;    /* CTA, 4.91:1 with white text */
  --muted-bg: #F5F5F4;
  --muted-fg: #78716C;   /* 5.5:1 on --bg */
  --border: #E7E5E4;
  --danger: #DC2626;
  --ring: #B45309;
}
```

**There is deliberately no dark palette.** OS-level dark mode therefore has nothing to
switch to, which is how Principle V's light-mode-only rule is enforced structurally rather
than by discipline.

**Rejected:** `#D97706` amber. White text on it reaches only about 3:1 and fails AA.
`#B45309` reaches 4.91:1 and still reads warm. The rejection is recorded here so it is not
re-attempted.

Fonts: Space Grotesk (headings), DM Sans (body). Both variable, loaded via `next/font` so
there is no layout shift.

---

## Step 5 - First run and the durability gate

```powershell
npm.cmd run dev
```

Open `http://localhost:3000/admin` and create the first user (role `admin`).

### GATE 1 - storage durability (MUST pass before further work)

Local upload success proves nothing. Vercel's disk is ephemeral, so this gate requires a
**deployment**:

1. Create the Neon database and note the pooled connection string
2. Push to a Vercel project with all environment variables set
3. Deploy
4. In the deployed admin, upload an image to a product
5. Redeploy
6. Confirm the image **still loads**

If step 6 fails, images are being written to ephemeral disk and the site is unshippable.
Fix storage configuration before writing any storefront code. This is a constitution
release gate, not a nice-to-have.

### GATE 2 - oversized upload

Upload an image above 4.5MB through the deployed admin panel. It MUST succeed. If it fails,
`clientUploads` or the bucket CORS rule is misconfigured.

### GATE 3 - admin autosave

Open an item, edit a field, and save repeatedly in quick succession. No 500s. This is the
race fixed in Payload 3.83.0; a failure here means the version is too old.

### GATE 4 - build-time database

```powershell
npm.cmd run build
```

The build connects to Postgres for static generation of published content (research D11).
A build failing for want of a connection is a **configuration** problem, not a code problem.
Fix by supplying `DATABASE_URI` to the build environment.

---

## Step 6 - Quality gates per phase

Every phase from here must pass all of:

```powershell
npm.cmd run typecheck    # tsc --noEmit
npm.cmd run lint
npm.cmd run build
npm.cmd run test         # Vitest - src/lib only, per constitution
```

Plus, per the constitution's non-negotiable gates:

- Contrast ratios re-measured for any new colour pair
- Keyboard traversal of the affected journey
- `prefers-reduced-motion` behaviour confirmed
- 375 / 768 / 1024 / 1440 px widths, no horizontal scroll
- `.env.example` updated for any new variable

---

## Step 7 - Email verification

Submit the contact form with a valid address. Confirm the notification arrives at
`site-settings.notificationEmail`, containing name, email, phone, subject, full message,
referring page and timestamp, with the visitor's address as reply-to.

### Failure-path check (the important one)

Temporarily set `RESEND_API_KEY` to an invalid value. Submit again.

**Expected**: the enquiry still appears in the admin inbox with `emailSent` false. Email
is a convenience layer over a durable record, never the only copy (spec FR-040,
Principle II). If the submission disappears when email fails, the ordering guarantee in
`data-model.md` is wrong.

---

## Step 8 - Spam behaviour

| Test | Expected |
|---|---|
| Submit the form with the hidden `website` field filled | `200`, no record, no email, bot learns nothing |
| Submit twice within 3 seconds of render | `200`, no record, no email |
| Genuine visitor reading then typing and submitting | **Succeeds.** The 3s floor must never reject a real submission (FR-042) |
| 10 rapid genuine submissions | Rate limited, with `Retry-After` honoured, no 500s |

---

## Step 9 - WhatsApp verification

Set `site-settings.whatsappNumber` to `923394299873`. Confirm the stored value contains
**digits only** - no `+`, spaces, dashes or brackets. WhatsApp's documented grammar
rejects all of them, and a stored `+92 3394299873` produces a silently broken link.

Complete a checkout on a real phone and confirm the conversation opens to the business
number with the complete message prefilled. Check that spaces and punctuation survive, and
that an item name containing `&`, `#` or `?` does not truncate the message or alter the
link (research D7).

---

## Step 10 - Deploy

1. Vercel project, Node 24 runtime
2. All environment variables from Step 2 set
3. Custom domain attached
4. Domain added to Google authorised domains later, when OAuth is enabled
5. Privacy policy page live - a prerequisite for the future OAuth consent screen, built now
   so that requirement is pre-met

### Free-tier limits to know

| Service | Limit | Action if hit |
|---|---|---|
| Resend | 100 emails/day, 3,000/month | Upgrade to Pro ($20/mo) removes the daily cap |
| Neon | Free tier compute | Upgrade |
| Vercel | Hobby | Upgrade if traffic requires |
| Vercel Blob | Storage | Pay per GB |

All four are adequate for a business of this size. None is a launch blocker.

---

## Definition of Done

- [ ] Admin can create, edit, reorder and delete items **and images** with no developer
- [ ] All 53 functional requirements traceable to an implemented behaviour
- [ ] All 17 success criteria measurable and met
- [ ] GATE 1 passed: image survived a redeploy
- [ ] GATE 2 passed: upload above 4.5MB succeeded
- [ ] GATE 3 passed: admin autosave stable
- [ ] GATE 4 passed: build connects to the database
- [ ] Contact email arrives, **and** survives forced email failure
- [ ] Access rules tested in both directions for all nine collections
- [ ] Unit tests pass for every function in `src/lib/`, including adversarial encoding tests
- [ ] WCAG AA contrast zero failures; keyboard-complete; reduced-motion honoured
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1440
- [ ] Every page has a unique title and description; item pages emit valid product
      structured data; sitemap covers all public pages
- [ ] No secret committed; `.env` gitignored
- [ ] Deferred seams present: `customers` collection, `orders.customer` relation, single
      colour source
- [ ] Handover document covers the admin panel, site settings, and image upload

## Known Limitations (documented, not hidden)

1. **Rate limiting is in-process.** Serverless instances are parallel, so the limiter does
   not span them. The honeypot and timing floor are the real protection. Upstash Redis is
   the upgrade path if spam appears.
2. **Filtering and search are client-side.** Correct below roughly 100 items. Beyond that,
   server-side faceting must be introduced deliberately. Indices are already in place.
3. **TypeScript pinned to 5.9.3** while `latest` is 7.0.2. Revisit after launch.
4. **Payload autosave disabled** on collections, to avoid the serverless race fixed in
   3.83.0. The owner saves manually. Revisit after upgrading past a comfortable margin.
5. **No customer accounts in v1.** Deliberate. The schema seam is preserved.