# ecommerce_website Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-10-01

## Active Technologies
- TypeScript 5.9.3 (pinned; `latest` is 7.0.2, the native-compiler + Next.js 16.3.8, Payload 3.90.2, Tailwind CSS 4.3.3, Embla Carousel (002-polish-storefront)
- N/A for this release. No database; content flows through the existing (002-polish-storefront)

- TypeScript 5.9.3 on Node.js 24.16.x (24.x LTS) + Next.js 16.3.8, Payload 3.90.2, @payloadcms/next 3.90.2, @payloadcms/db-postgres 3.90.2, @payloadcms/storage-s3 3.90.2, @payloadcms/richtext-lexical 3.90.2, @payloadcms/email-resend 3.90.2, Tailwind CSS 4.3.3, Zustand 5.0.15, Embla Carousel React 8.6.0, Zod 4.6.5, react-hook-form 7.89.0, sharp 0.35.5, lucide-react (001-whatsapp-storefront)

## Project Structure

Single Next.js application containing storefront, API and admin. Not a split
frontend/backend - Payload's admin panel and API must compile inside the same app
that serves the storefront.

```text
src/
├── (payload)/        # Payload admin + API. Scaffolded, do not hand-edit
├── (frontend)/       # Storefront routes
│   ├── page.tsx          # Homepage: long-scroll sections
│   ├── products/         # Catalogue and item detail
│   ├── blog/  about/  contact/  privacy/
├── collections/      # 9 content types
├── globals/          # SiteSettings: single source of business identity
├── components/       # ui, layout, product, cart, filters, contact
├── lib/              # Pure functions. Unit tests live in tests/
├── email/            # Contact notification template
└── tests/            # Vitest, covers src/lib only
payload.config.ts · next.config.mjs
```

## Commands

npm test; npm run lint
npm run typecheck; npm run build

## Code Style

TypeScript 5.9.3 on Node.js 24.16.x (24.x LTS): Follow standard conventions


## Recent Changes
- 002-polish-storefront: Added TypeScript 5.9.3 (pinned; `latest` is 7.0.2, the native-compiler + Next.js 16.3.8, Payload 3.90.2, Tailwind CSS 4.3.3, Embla Carousel

- 001-whatsapp-storefront: Added TypeScript 5.9.3 on Node.js 24.16.x (24.x LTS) + Next.js 16.3.8, Payload 3.90.2, @payloadcms/next 3.90.2, @payloadcms/db-postgres 3.90.2, @payloadcms/storage-s3 3.90.2, @payloadcms/richtext-lexical 3.90.2, @payloadcms/email-resend 3.90.2, Tailwind CSS 4.3.3, Zustand 5.0.15, Embla Carousel React 8.6.0, Zod 4.6.5, react-hook-form 7.89.0, sharp 0.35.5, lucide-react

<!-- MANUAL ADDITIONS START -->
## Non-Negotiable Constraints

These are verified, load-bearing, and not obvious from the code. Do not "clean up" any
of them. Full rationale in `specs/001-whatsapp-storefront/research.md`.

- **TypeScript pinned to 5.9.3.** `typescript@latest` is 7.0.2, the native-compiler
  rewrite. Upgrading is a separate change with its own ADR.
- **Payload never below 3.83.0.** 3.81.0-3.82.0 have a serverless autosave race causing
  intermittent 500s that CANNOT be reproduced on a local dev server.
- **Next.js `cacheComponents` stays off.** Payload admin compatibility is explicitly
  "not guaranteed".
- **Image storage must be S3-compatible** (Vercel Blob). Vercel's local disk does not
  survive a redeploy, so local storage means silently lost client imagery.
  `s3Storage()` returns a **Plugin** - register it as `plugins: [s3Storage({...})]`.
  There is NO top-level `storage` key in Payload 3.90.2, despite what the docs show.
- **`clientUploads: true` plus bucket CORS on PUT.** Vercel caps proxied server uploads
  at 4.5MB; modern phone photos exceed that. Gate the access function on `req.user` so
  only the signed-in owner can request upload instructions.
- **Upload size limit is global, not per-collection.** Set `upload.limits.fileSize` in
  `payload.config.ts`; `UploadConfig.limits` does not exist.
- **ESLint uses `eslint-config-next`'s native flat exports**, not `FlatCompat`, which
  throws "Converting circular structure to JSON" under ESLint 9.
- **Build requires a database connection.** Next.js SSG plus Payload's Local API means
  static generation needs Postgres available at build time.
- **WhatsApp numbers are stored digits-only.** No `+`, spaces, dashes or brackets.
- **Never trust client prices.** The enquiry endpoint re-reads prices from the database.
- **Light theme only, no dark palette.** OS dark mode has nothing to switch to.
- **All business identity comes from the `site-settings` global.** Never hardcode it.
- **`npm.cmd`, not `npm`** - PowerShell execution policy blocks `npm.ps1`.
<!-- MANUAL ADDITIONS END -->
