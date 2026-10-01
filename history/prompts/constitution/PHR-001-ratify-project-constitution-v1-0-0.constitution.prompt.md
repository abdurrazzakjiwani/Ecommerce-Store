---
id: PHR-001
title: Ratify Project Constitution v1.0.0
stage: constitution
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: none
branch: master
user: abdurrazzakjiwani
command: sp.constitution
labels: [constitution, governance, payload-cms, nextjs, accessibility, whatsapp, seo, architecture]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - .specify/templates/plan-template.md
 - .specify/templates/spec-template.md
 - .specify/templates/tasks-template.md
 - .opencode/command/sp.constitution.md
 - history/prompts/constitution/PHR-001-ratify-project-constitution-v1-0-0.constitution.prompt.md
tests:
 - "Placeholder scan for bracketed ALL_CAPS tokens via PowerShell regex - PASS, zero remaining"
 - "Trailing-whitespace scan on constitution.md via Select-String - PASS, 0 lines"
 - "Heading hierarchy inspection - PASS, levels 1-3 preserved from template"
 - "TODO marker scan - PASS, no deferred markers, adoption date is today"
 - "npm version and vendor-doc verification of pinned stack - PASS, see Response snapshot"
---

## Prompt

### Request under execution

Update the project constitution at `.specify/memory/constitution.md`: replace every
placeholder token with concrete values derived from the preceding conversation,
produce a Sync Impact Report, and propagate consistency across dependent
artifacts. The `## User Input` block for this invocation was empty, so all values
were derived from conversational decisions rather than supplied inline.

### Prior conversation context (decisions that drove the constitution)

The user asked for an e-commerce site for a client selling "software and hardware
services", who wants to upload his own images, with no online payment, and with
WhatsApp as the conversion channel. The full requested feature list: Google
login, product catalog with categories/sub-categories, product cards with 3-5
scrollable images, product description pages, filters, search, profile details,
delivery/address section, WhatsApp and chat buttons, Contact Us, and separate
Blog/About pages.

Decisions reached interactively, each after the user was offered explicit
choices:

1. **CMS approach** - The user was offered build-a-CMS, Sanity hosted, or a
   lightweight custom admin, and chose **Payload CMS 3 embedded in Next.js**.
   Rationale recorded: one repo, one deploy, no licence cost, no vendor lock-in,
   and the client gets a real admin panel for image upload.
2. **Catalogue composition** - Unconfirmed. The client only said "hardware and
   software". The user instructed that items be added at his discretion for now
   and updated later once the client confirms. This drove Principle III
   (flexible schema) and the `priceType` discriminated field.
3. **Ordering flow** - Chose **cart, then one WhatsApp checkout**, over
   per-product buttons or a persisted-order-history model. Drove Principle II.
4. **Auth** - Initially chosen as "saved addresses + order history", then
   **explicitly deferred** twice by the user: "Skip Google Feature for now" and
   "Skip Google Login feature for now, will add it in future when confirms by
   the client". Drove Principle III's schema-seam requirement.
5. **Hosting** - "Normal web host" was questioned because Payload needs a Node
   runtime and a database. The user chose **managed hosting** (Vercel + Neon).
6. **Routing** - "Single-page site" was reconciled against the request for
   product pages and separate Blog/About links. Chosen: **homepage is one long
   scroll, details on own routes**.
7. **WhatsApp number** - First supplied as `+92 3001234567`, then corrected to
   the real number **`+92 3394299873`**.
8. **Email destination** - **`co.auraztech@gmail.com`**, provider Resend API,
   with honeypot + timing + rate-limit spam protection.
9. **Delivery coverage** - **Country-wide** (Pakistan).
10. **Theme** - First proposed navy/blue. The user rejected black: "I want the
    theme to be white or cream; black would be bad and wouldn't look good."
    This drove Principle V's light-mode-only rule and the Design Tokens table.
11. **Business name** - The user declined the inferred name: "I dont know the
    buisness name please dont decide it own yours, For now you can keep any
    name and logo". This drove Principle III's prohibition on inferring business
    identity from incidental sources, and the `YourBrand` provisional seed.
12. **Google login prerequisites** - The user asked what would be required to
    implement it later; it was established that basic `openid`/`email`/`profile`
    scopes exempt the app from Google's 100-user cap and brand verification.

## Response snapshot

Ratified constitution at **v1.0.0** (initial adoption, not an amendment - the
prior file contained only placeholders and carried no governance).

Six principles, each with an explicit rationale because each is non-obvious:

- **I. Single Deployable, Merchant-Owned Platform** - all brand values read from
  the `site-settings` global; the client must be able to operate the admin panel
  with no code change or redeploy.
- **II. Contact-First Conversion, No Payment Gateway** - WhatsApp deep link is the
  terminating CTA; no gateway in v1; order persisted to `orders` so the
  merchant's record does not depend on WhatsApp retention.
- **III. Flexible Schema, Deferred Specifics** - model goods, software and
  services simultaneously; `priceType` discriminated field; self-referencing
  categories; `customers` collection and `orders.customer` retained as an auth
  seam; placeholders must be self-evidently provisional and identity must never
  be inferred from incidental sources.
- **IV. Durable Assets and Secret Hygiene** - S3-compatible media storage is
  mandatory because serverless local disk does not survive a deploy, making
  silent image loss the top failure mode; secrets environment-only; public write
  access bounded and guarded.
- **V. Accessibility and Evidence-Based Design** - WCAG 2.1 AA with contrast
  ratios recorded alongside each token so rejected pairs are auditable; 44x44
  targets; reduced-motion honoured; SVG not emoji; **light mode only**;
  four breakpoints verified.
- **VI. External Verification and Verbatim Traceability** - vendor facts must be
  verified against documentation, not recalled from training; PHRs verbatim;
  ADRs never auto-created.

Section 2 "Constraints and Non-Functional Requirements" pins the stack
(Next.js 16.3.8, Payload 3.90.2, Neon, Vercel, Resend, Tailwind 4.3.3, sharp
0.35.5, Zustand 5.0.15, Embla 8.6.0, Zod 4.6.5, Node 24.16) and records two
operational constraints: `cacheComponents` stays disabled as Payload-incompatible,
and npm must be invoked as `npm.cmd` because PowerShell's execution policy blocks
`npm.ps1`. Design tokens are frozen with the rejected `#D97706` amber documented
at ~3:1 alongside the adopted `#B45309` at 4.91:1.

Vendor facts verified during the preceding research and relied upon here:
Payload supports Next.js 16.2.6+ (16.3.8 qualifies); `cacheComponents`
compatibility with the admin panel is explicitly not guaranteed; `wa.me` requires
digits only with `?text=` URL-encoded; Google exempts basic-identity-scope apps
from brand verification and the 100-user cap; Payload ships no built-in Google
OAuth strategy and its official SSO plugin is Enterprise-only, so Auth.js was
rejected on Payload maintainers' own advice.

Section 3 defines the spec-driven flow and per-phase gates, including the
ordering constraint that media storage must be proven durable by
upload-redeploy-confirm **before** a build is considered startable, and that
contact submissions must persist even when email delivery fails.

Governance requires consent before any amendment, semver bump policy,
per-plan Constitution Check, and mandatory ADRs for stack changes, payment
integration, customer authentication, and media-storage changes.

## Outcome

- ✅ Impact: Repository went from ungoverned placeholder template to a
  ratified v1.0.0 constitution encoding every decision made in this
  conversation, plus four dependent templates updated for consistency.
- 🧪 Tests: Placeholder scan, trailing-whitespace scan, heading-hierarchy check
  and deferred-marker check all PASS. Vendor claims underpinning the pinned
  stack were verified against npm and official vendor documentation.
- 📁 Files: 5 files modified (constitution + 4 templates/commands), 1 PHR created.
- 🔁 Next prompts: `/sp.specify` for the storefront feature, then `/sp.plan`.
  An ADR for "Payload as sole backend" remains outstanding and requires user
  consent.
- 🧠 Reflection: The highest-value clause written was not any principle's
  headline rule but Principle IV's ordering constraint making durable media
  storage a scaffold-time gate. Silent image loss on redeploy is the one failure
  this project could ship without anyone noticing until a client demo.

## Evaluation notes (flywheel)

- Failure modes observed: The first constitution write left 8 bracketed
  placeholder tokens inside the Sync Impact Report, where they were intentional
  documentation of the transformation but would fail any automated validator.
  Caught by the validation scan and rewritten as bare `PRINCIPLE_1` style
  references. Separately, the user's own instruction "please dont decide it own
  yours" was a correction of an earlier inference: business identity had been
  derived from an email address domain and presented as settled. Principle III
  now explicitly forbids that inference class.
- Graders run and results: PASS - zero unexplained bracket tokens; PASS -
  version line consistent with report (1.0.0 / 2026-10-01); PASS - ISO dates;
  PASS - no vague "should" in principle statements, MUST used throughout;
  PASS - heading hierarchy preserved.
- Prompt variant (if applicable): empty-`## User Input` variant - all
  constitution values had to be reconstructed from conversational history rather
  than supplied in the invocation.
- Next experiment (smallest change to try): In the next spec run, verify that the
  new "Out of Scope and Deferred" section is actually populated with the four
  deferred items already known (catalogue composition, authentication, business
  identity, Google OAuth credentials). If it is not, the section is decoration
  and Principle III is not binding.

## Known follow-up (not blocking)

The same stale reference to `.specify/scripts/bash/create-phr.sh` remains in 12
command files: `sp.adr.md`, `sp.analyze.md`, `sp.checklist.md`,
`sp.implement.md`, `sp.git.commit_pr.md`, `sp.plan.md`, `sp.phr.md`,
`sp.clarify.md`, `sp.reverse-engineer.md`, `sp.specify.md`, `sp.tasks.md`,
`sp.taskstoissues.md`. This repository ships PowerShell scripts only, so no
`create-phr.sh` exists. Only `sp.constitution.md` was corrected in this sync
because it is the file this command owns; expanding to the other 12 was
judged out of scope and is reported rather than silently applied.