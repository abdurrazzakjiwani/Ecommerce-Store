---
id: PHR-005
title: Scaffold Storefront and Pass Gates
stage: green
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 001-whatsapp-storefront
branch: 001-whatsapp-storefront
user: abdurrazzakjiwani
command: sp.implement
labels: [scaffold, payload-cms, nextjs, troubleshooting, environment, quality-gates]
links:
  spec: specs/001-whatsapp-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - package.json
 - package-lock.json
 - next.config.ts
 - tsconfig.json
 - eslint.config.mjs
 - postcss.config.mjs
 - vitest.config.mts
 - .env.example
 - .gitignore
 - src/payload.config.ts
 - src/environment.d.ts
 - src/access/authenticated.ts
 - src/access/isFirstUser.ts
 - src/collections/Users.ts
 - src/collections/Media.ts
 - src/app/(payload)/layout.tsx
 - src/app/(payload)/custom.scss
 - src/app/(payload)/admin/importMap.js
 - src/app/(payload)/admin/[[...segments]]/page.tsx
 - src/app/(payload)/admin/[[...segments]]/not-found.tsx
 - src/app/(payload)/api/[...slug]/route.ts
 - src/app/(payload)/api/graphql/route.ts
 - src/app/(payload)/api/graphql-playground/route.ts
 - src/app/(frontend)/globals.css
 - src/app/(frontend)/layout.tsx
 - src/app/(frontend)/page.tsx
 - src/app/(frontend)/not-found.tsx
 - src/lib/currency.ts
 - src/tests/currency.test.ts
 - specs/001-whatsapp-storefront/plan.md
 - specs/001-whatsapp-storefront/research.md
 - specs/001-whatsapp-storefront/tasks.md
 - AGENTS.md
 - history/prompts/001-whatsapp-storefront/PHR-005-scaffold-storefront-and-pass-gates.green.prompt.md
tests:
 - "npm run typecheck - PASS, 0 errors (after fixing 5)"
 - "npm run lint - PASS, 0 problems (after replacing FlatCompat with native flat config)"
 - "npm run test - PASS, 16/16 (after fixing 1 incorrect test expectation)"
 - "npm run build - PASS, Turbopack compiled in 9.8s, 5 static + 4 dynamic routes"
 - "git check-ignore .env - PASS, .env confirmed ignored"
 - "Version pin audit across 16 packages - PASS, all correct after install reconciliation"
---

## Prompt

### Request under execution

User instruction: *"payload as sole backend skip for now will add it in future"* -
deferring the outstanding ADR. This cleared the last open governance item, so work
proceeded to the next workflow step: `/sp.implement`, starting at Phase 1 (Setup) of
`specs/001-whatsapp-storefront/tasks.md`.

The ADR deferral was recorded in `plan.md` under a new "Open Governance Items" section
rather than simply dropped, so the decision and its rationale survive in the repository
even though no formal ADR exists.

## Response snapshot

**Phase 1 complete. All 12 tasks done. All four quality gates green.**

Final gate results: typecheck 0 errors, lint 0 problems, 16/16 tests, build succeeds
(Turbopack, 9.8s compile). Routes: `/` and `/_not-found` static; `/admin/[[...segments]]`,
`/api/[...slug]`, `/api/graphql`, `/api/graphql-playground` dynamic.

### Four real blockers, and what each taught

**1. `create-payload-app` cannot run in a non-TTY shell.** It aborted with
`uv_tty_init returned EBADF`, and `--no-deps` did not avoid the prompt path. Rather than
leave Phase 1 blocked, the template was obtained by sparse-checking out
`payloadcms/payload` at tag `v3.90.2` and copying `templates/website`. Better control,
arguably: versions are pinned by tag rather than by whatever the scaffolder resolves
that day. The Payload route group was copied **verbatim**, since those files are
auto-generated and carry do-not-modify headers.

**2. The interrupted `npm install` left two silent failures.** The user cancelled the
first install, and it had unpacked 605 packages with `node_modules/.bin` entirely absent,
so no CLI shim existed and `vitest` was "not recognized". Separately, and far more
dangerous, `@next/swc-win32-x64-msvc` was **truncated**: 99.66 MB on disk against a
registry unpackedSize of 101.28 MB. That produced a misleading error -
"not a valid Win32 application" and "Turbopack is not supported on this platform" - which
invites the wrong conclusion that the platform is unsupported. It is not; the binary was
simply incomplete. Reinstalling that one package fixed it. The lesson is that a
cancelled install leaves a tree that *looks* healthy - `npm ls` reported every dependency
present at the correct version - while being quietly broken in ways that only surface
later.

**3. My own plan had the wrong directory structure.** The plan specified
`src/(payload)` and `src/(frontend)`. The real Payload convention, verified against the
template, is `src/app/(payload)` - Next.js requires the `app` segment. Left uncorrected,
every task's file path would have been wrong. `plan.md` was amended with an explicit
CORRECTION block recording what changed and why, plus two further deviations: the
template ships MongoDB (replaced with Postgres) and pnpm `workspace:*` deps (npm does
not support that protocol, so concrete versions were written).

**4. The storage API in the docs is wrong for this version.** Payload's migration guide
renders the S3 adapter under a top-level `storage` key. Inspecting the installed type
definitions showed `S3StoragePlugin = (...) => Plugin`, and that `Config` in 3.90.2 has
**no `storage` key at all**. The adapter must go in `plugins: [s3Storage({...})]`. Had
this been written from the docs, the config would not have type-checked, and if it had
been forced through, media would have silently stayed on ephemeral disk - the exact
failure Principle IV exists to prevent. `research.md` D4 was corrected and
`AGENTS.md` gained the constraint.

### Two bugs my own tests caught

`src/tests/currency.test.ts` failed 1 of 16 on first run. `Intl.NumberFormat` with
`maximumFractionDigits: 0` **rounds** rather than truncates, so 185000.6 rendered as
`Rs 185,001`, not `Rs 185,000`. On inspection the **expectation and the doc comment were
wrong, not the code** - rounding is the correct behaviour for money, since truncation
systematically understates a price. Both were corrected rather than bending the code to
match a mistaken assumption.

Typecheck surfaced 5 errors, including a self-import I had accidentally left in
`src/access/authenticated.ts` (`import { authenticated } from '../access/authenticated'`
inside the file that declares it), a `limit` option on `payload.count` that does not
exist, and `upload.limits` on a collection - in Payload 3 the file-size ceiling is the
**global** `upload.limits.fileSize` in `payload.config.ts`, not per-collection. A field-level
`access.update` was also typed as a collection `Access` when it needs a boolean
`FieldAccess`.

ESLint initially crashed with "Converting circular structure to JSON" because
`FlatCompat` cannot serialise the Next.js preset's plugin objects under ESLint 9. v16
ships native flat arrays, so `eslint.config.mjs` now extends them directly.

### Empirical confirmation of the 4.5MB mitigation

After enabling `s3Storage` with `clientUploads`, Payload's regenerated `importMap.js`
contains an entry for `S3ClientUploadHandler` from `@payloadcms/storage-s3/client`. The
client-upload path is not merely configured but active. The regenerated map also holds
only 2 entries against the template's ~30, confirming the copied template config was
fully replaced rather than partially inherited. `clientUploads.access` is gated on
`req.user`, so upload instructions are never issued to an anonymous visitor.

## Outcome

- ✅ Impact: The project went from documentation-only to a working, gated Next.js 16 +
  Payload 3.90.2 application with durable media storage wired, an owner-only admin
  account model, the frozen cream design tokens in place, and the first unit-tested
  utility. Phase 1 of 10 is complete.
- 🧪 Tests: 16/16 unit tests pass. Typecheck, lint and build all clean. 128 of 140 tasks
  remain; **no phase is claimed complete beyond what was actually run**, per the
  constitution's completion-claims rule.
- 📁 Files: 32 created, 4 amended (plan.md, research.md, tasks.md, AGENTS.md), 1 PHR.
- 🔁 Next prompts: Continue Phase 2 (Foundational) - the remaining 7 collections, access
  control, utilities, UI primitives, seed data, then GATE 1 and GATE 2 which require a
  real Neon database and a real Vercel deployment.
- 🧠 Reflection: The most valuable thing written this session was not code. It was the
  AGENTS.md constraint list capturing four facts that are invisible in the source: the
  plugin-not-storage registration, the global upload limit, the ESLint flat-config
  requirement, and the npm-vs-pnpm deviation. Each was found the expensive way, and each
  would otherwise be rediscovered by whoever touches this next.

## Evaluation notes (flywheel)

- Failure modes observed: Five distinct failures, four of them mine or environmental
  rather than design-level. The truncated SWC binary is the most instructive: the error
  message blamed the platform and would have led to abandoning Turbopack or the build
  entirely, when the true cause was a 1.6 MB shortfall from a cancelled install. The
  generalisable lesson is that a partially-completed install produces a tree that passes
  `npm ls` while being broken in binaries, and that native modules deserve a size check
  against the registry after any interrupted install.
  Second, writing the S3 config from documentation rather than from the installed type
  definitions would have produced a silently non-functional storage setup. Third, my plan
  contained a factual error about directory structure that only reading the real template
  exposed.
- Graders run and results: PASS - typecheck clean; PASS - lint clean; PASS - 16/16 tests;
  PASS - build succeeds with 9 routes; PASS - `.env` gitignored; PASS - all 16 pinned
  dependency versions correct.
- Prompt variant (if applicable): This was not an empty-input variant. The user gave a
  one-line deferral, and the correct interpretation was to record the deferral and
  proceed to the next workflow step rather than ask what to do next.
- Next experiment (smallest change to try): Before Phase 2, verify whether the admin panel
  can be exercised at all without a live database. If `payload generate:importmap` and
  `tsc` both succeed without a connection, it may be possible to develop most of Phase 2
  and defer GATE 1 and GATE 2 to a single deployment checkpoint, which would shorten the
  critical path considerably.