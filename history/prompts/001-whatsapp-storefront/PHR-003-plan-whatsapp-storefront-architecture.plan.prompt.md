---
id: PHR-003
title: Plan WhatsApp Storefront Architecture
stage: plan
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 001-whatsapp-storefront
branch: 001-whatsapp-storefront
user: abdurrazzakjiwani
command: sp.plan
labels: [plan, research, architecture, payload-cms, vercel, storage, contracts, data-model]
links:
  spec: specs/001-whatsapp-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-whatsapp-storefront/plan.md
 - specs/001-whatsapp-storefront/research.md
 - specs/001-whatsapp-storefront/data-model.md
 - specs/001-whatsapp-storefront/contracts/api-contract.md
 - specs/001-whatsapp-storefront/quickstart.md
 - AGENTS.md
 - history/prompts/001-whatsapp-storefront/PHR-003-plan-whatsapp-storefront-architecture.plan.prompt.md
tests:
 - "setup-plan.ps1 -Json executed - PASS, plan template copied, branch and paths resolved"
 - "update-agent-context.ps1 -AgentType opencode executed - PASS, AGENTS.md created from plan Technical Context"
 - "Template placeholder scan across all 7 spec markdown files - PASS, zero leftover tokens"
 - "Constitution Check gate evaluation - PASS, 8 of 8 gates answered explicitly, 2 deviations recorded in Complexity Tracking"
 - "Unresolved NEEDS CLARIFICATION count - PASS, zero remaining across research.md and plan.md"
 - "AGENTS.md project structure correction - manual, script had generated backend/ frontend/ which does not match a single Next.js app"
---

## Prompt

### Request under execution

Execute `/sp.plan` with an **empty** `## User Input` block. Per the command's own guidance,
the feature description is the preceding conversation and the user must not be asked to
repeat it. The request: run setup, load the specification and constitution, execute the
plan workflow including Constitution Check gate evaluation, produce Phase 0 research and
Phase 1 design artifacts, update the agent context file, re-evaluate the gate post-design,
then stop and report.

## Response snapshot

Setup ran cleanly, unlike the same script family during PHR-002. Five artifacts produced
plus a corrected agent context file.

### The research that changed the plan

Twelve decisions, each verified against a vendor source rather than recalled. Four
materially altered the design and would not have been found by reasonable assumption:

**D4 - the 4.5MB Vercel upload cap.** Payload's S3 adapter documentation states that
Vercel limits server-side uploads to 4.5MB, that `clientUploads: true` is required to send
files directly to storage, and that bucket CORS must permit `PUT`. The naive implementation
- proxying uploads through the serverless function - fails at around 4.5MB, and modern
phone photographs routinely exceed that. This became a scaffold-time release gate with an
explicit CORS table.

A second verified detail from the same source: enabling the adapter automatically sets
`disableLocalStorage: true` on the collection. The durable-storage guarantee therefore
comes from enabling the adapter rather than from careful configuration, which is a
stronger result than the plan assumed.

**D5 - a Payload version floor from a bug local dev cannot catch.** Payload 3.81.0 and
3.82.0 have a serverless autosave race producing intermittent 500s
(`Cannot read properties of undefined`). The reproduction conditions match this project
exactly - Postgres on Neon, Vercel serverless - and the reporter states explicitly that it
cannot be reproduced on a local single-process dev server. Fixed in 3.83.0. Recorded as a
hard floor, because a defect invisible to local verification is invisible to us.

**D6 - Zustand persists state without validating it.** Zustand's own reference carries an
explicit warning that `createJSONStorage` performs no runtime validation and casts stored
JSON directly to the state type, and it suggests Zod. We already depend on Zod 4.6.5, so a
validating storage adapter is nearly free and turns a corrupt basket into a reset rather
than a crash. Combined with `skipHydration: true` and manual rehydration, this addresses
both the SSR mismatch and the unvalidated-read problem.

**D12 - TypeScript's `latest` is now 7.0.2.** Confirmed via npm dist-tags: 7.0.2 latest,
7.1.0 in development, 5.9.3 the final 5.x. TypeScript 7 is the native-compiler rewrite. A
compiler major is a separate change with its own ADR, so the plan pins 5.9.3 and records
the deviation in Complexity Tracking rather than silently adopting it or silently ignoring
it.

Also verified: Payload publishes an official one-click Vercel deployment using exactly
Next.js + Neon + Vercel Blob, converting the largest integration risk into a documented
path; Payload enumerates exact supported Next.js patch levels, so compatibility is
patch-sensitive; Next.js static generation requires a database at build time because
Payload's Local API is used in statically generated segments; and WhatsApp's deep-link
grammar requires digits only with URL-encoded text, with the documented failure being
truncation at the first space.

### Design decisions worth naming

**Never trust client prices.** The enquiry request body carries only slugs and
quantities. Every price, title, image and total is resolved server-side, and the WhatsApp
message text is generated server-side too, so the message the owner receives and the record
the owner sees cannot diverge. A modified browser can send anything.

**Direct writes to orders and messages are denied.** They are created only by two
hand-written endpoints, because closing the Payload REST route prevents bypassing the spam
controls entirely. The contact endpoint also returns `200` rather than `422` for filtered
submissions, so a bot cannot probe for a way around the filter by distinguishing which
rejection it hit.

**`/api/enquiry` still returns the WhatsApp link on a 500.** The visitor's path to the
seller must never be gated on our storage working.

**Drafts return 404, not 403.** A 403 confirms the document exists, which would let a
visitor enumerate unpublished products by slug.

**Gallery is not required at the collection level.** The 3-to-5 rule applies only when a
gallery is present, so the owner is never blocked from publishing, and the storefront
renders a labelled placeholder rather than a broken frame. This is the spec's zero-image
edge case, resolved in the schema rather than in the UI.

**Items are snapshotted into orders.** Renaming an item must not rewrite what the customer
agreed to, and a quote item has no product record to reference.

### Constitution Check

All 8 gates answered explicitly and passed. Two deviations recorded in Complexity
Tracking rather than left silent: the TypeScript pin, and the choice of a single
repository over library extraction. Both are reversions toward stability rather than
additions of scope.

The post-design re-check added four verifications, most importantly turning Principle IV
from an intention into a gate: an upload, a redeploy and a visual confirmation are
required **before the build is called startable**, because local upload success proves
nothing about ephemeral disk.

### Agent context

`update-agent-context.ps1` created `AGENTS.md` from the plan's Technical Context, as
intended. Its generated Project Structure was **wrong**: the script hardcodes
`backend/ frontend/ tests/` for any project typed as "web", which does not describe a single
Next.js application where Payload's admin compiles inside the storefront's own build. Left
uncorrected it would misroute every future session. Replaced with the real
`src/(payload) / (frontend) / collections / globals / components / lib` layout, and eleven
non-negotiable constraints were added inside the manual-additions markers so a future
regeneration cannot silently discard them.

## Outcome

- ✅ Impact: The feature moved from a validated specification to an implementable design.
  Five artifacts, twelve verified decisions, four explicit release gates, and one
  auto-generated file corrected before it could mislead.
- 🧪 Tests: Setup and agent-context scripts both executed successfully. Placeholder scan
  clean across all seven markdown files. Gate evaluation complete with zero unresolved
  clarifications. No build or test execution occurred, because no implementation code
  exists yet - the constitution's completion-claims rule requires evidence, and claiming a
  green build at this stage would be false.
- 📁 Files: 5 created, 1 created and then corrected (`AGENTS.md`), 1 PHR.
- 🔁 Next prompts: `/sp.tasks` to derive the testable task list from spec, plan,
  data-model and contracts. The "Payload as sole backend" ADR is still outstanding.
- 🧠 Reflection: The most valuable output was D4. The plan I would have written by
  reasoning alone would have specified S3 storage and considered the durability risk
  addressed, while silently shipping a 4.5MB upload ceiling in front of a client who
  intends to photograph his own products on a phone. One sentence of vendor documentation
  changed the architecture.

## Evaluation notes (flywheel)

- Failure modes observed: One, in generated output rather than my own. `update-agent-context.ps1`
  emitted a project structure that does not match this architecture, because
  `Get-ProjectStructure` returns a fixed `backend/ frontend/ tests/` string for any project
  typed as web. This is the same class of defect as the PowerShell 5.1 `Join-Path` arity
  failure in PHR-002: the ported scripts carry assumptions from the original template that
  do not hold for this project. A third instance in the same script family would justify
  diffing the PowerShell scripts against their Bash originals wholesale rather than
  patching defect by defect.
- Graders run and results: PASS - all 8 constitution gates answered with explicit verdicts;
  PASS - two deviations recorded in Complexity Tracking rather than silently accepted;
  PASS - zero unresolved clarifications; PASS - 7 of 7 markdown artifacts free of
  template placeholders; PASS - post-design re-check recorded.
- Prompt variant (if applicable): empty-`## User Input` variant, third consecutive. The
  accumulated cost of this variant is now visible: planning is well-informed, but the user
  has had no opportunity to correct a misread at the point it is cheapest to do so.
- Next experiment (smallest change to try): Before `/sp.tasks`, ask the user to review
  `research.md` specifically for the four decisions that changed the design - D4, D5, D6
  and D12 - because those are the points where my judgement departed from a naive reading,
  and they each carry an ongoing cost that only the user can weigh against the client
  relationship.