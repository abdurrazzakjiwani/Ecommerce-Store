---
id: PHR-002
title: Specify WhatsApp Service Storefront
stage: spec
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 001-whatsapp-storefront
branch: 001-whatsapp-storefront
user: abdurrazzakjiwani
command: sp.specify
labels: [spec, storefront, whatsapp, payload-cms, requirements, edge-cases, deferred-scope]
links:
  spec: specs/001-whatsapp-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-whatsapp-storefront/spec.md
 - specs/001-whatsapp-storefront/checklists/requirements.md
 - history/prompts/001-whatsapp-storefront/PHR-002-specify-whatsapp-service-storefront.spec.prompt.md
tests:
 - "Leftmost template token scan for double-brace placeholders and bracketed template slots - PASS, zero remaining"
 - "Technology leakage scan across 14 terms (Payload, Next.js, React, Node, Tailwind, Zustand, Embla, Zod, Postgres, Vercel, Resend, wa.me, useState, API call) - PASS, zero hits"
 - "Residual mechanism-word scan (named tokens, token, mechanism, internally, record type) - PASS after 1 correction"
 - "Structure count verification - PASS: 53 functional requirements, 32 Given/When/Then scenarios, 17 success criteria"
 - "Spec quality checklist at specs/001-whatsapp-storefront/checklists/requirements.md - PASS after 1 iteration"
---

## Prompt

### Request under execution

Create the feature specification for the service storefront. Invoke `/sp.specify` with an
**empty** `## User Input` block. Per the command's own guidance, the feature description is
the preceding conversation rather than an inline argument, and the user must not be asked
to repeat it. The conversation supplied: the full client brief (catalogue with
categories and sub-categories, product cards with 3-5 scrollable images, product detail
pages, filters, search, profile details, delivery address, WhatsApp and chat buttons,
contact section, separate blog and about pages, no online payment, self-service image
upload by the business owner), plus every decision taken interactively before this run.

### Decisions carried in from the preceding conversation

1. Payload CMS embedded in Next.js as the sole backend, chosen over building a CMS, over
   Sanity, and over a hand-rolled admin.
2. Catalogue composition unconfirmed - "hardware and software" only. User instructed that
   items be added at his discretion for now and corrected later.
3. Cart then one WhatsApp checkout, chosen over per-product buttons and over persisted
   customer order history.
4. Google login deferred twice by explicit user instruction, pending client confirmation.
5. Managed hosting (Vercel + Neon), adopted after "normal web host" was found unable to
   run the required runtime.
6. Homepage is one long scroll; details on their own routes.
7. WhatsApp number `+92 3394299873`, superseding an earlier `+92 3001234567`.
8. Notification email `co.auraztech@gmail.com` via Resend, with honeypot plus timing plus
   rate-limit spam protection.
9. Country-wide delivery across Pakistan.
10. Light cream theme, following the user's rejection of black: "I want the theme to be
    white or cream; black would be bad and wouldn't look good."
11. Business name deliberately not decided by the agent, following "I dont know the
    buisness name please dont decide it own yours".
12. Ten build phases agreed, media storage identified as the highest-severity risk.

## Response snapshot

Branch `001-whatsapp-storefront` created (number 1, short name
`whatsapp-storefront`); confirmed no remote, no existing feature branches, no specs
directory.

Specification written at `specs/001-whatsapp-storefront/spec.md` in deliberately
non-technical language, containing:

- **Seven user stories**, six for the visitor and two for the owner, each independently
  testable with Given/When/Then scenarios. Story 2 (owner publishes an item with imagery)
  and Story 5 (owner updates business identity) were promoted to first-class stories at
  P1 and P2 respectively, because the owner's self-sufficiency is the client's stated
  reason for the project rather than an implied by-product.
- **Fourteen edge cases**, weighted toward the failures that are cheap to specify and
  expensive to discover late: a basket of only quote items, a category deleted while items
  remain in it, an item published with no images, a saved address gone stale, WhatsApp not
  installed, and anti-spam measures rejecting a genuine visitor.
- **Out of Scope and Deferred** section - mandatory under Constitution Principle III and
  newly added to the spec template during the constitution sync. Three deferrals each with
  its preserved seam, and seven exclusions each with a reason.
- **Unconfirmed Inputs** listing seven items the client has not supplied, each with its
  provisional value. Business identity recorded as awaiting the owner, with a note that
  the name was deliberately not inferred from the notification email domain.
- **53 functional requirements**, **32 acceptance scenarios**, **17 success criteria**
  framed as stakeholder-verifiable outcomes rather than system internals.

Zero [NEEDS CLARIFICATION] markers were raised, and that was a deliberate decision rather
than an omission. Every gap had either a defensible default or had already been resolved
interactively in the same conversation. The three pricing presentations exist specifically
so that the unconfirmed catalogue composition required no assumption. Raising
clarifications now would have asked the user to restate decisions they had just made.

Quality checklist written to `checklists/requirements.md`. All 16 items pass after one
correction iteration.

**Finding - tooling defect.** `create-new-feature.ps1` failed partway through on this
PowerShell 5.1 host. The cause is line 267:

```powershell
$promptsDir = Join-Path $repoRoot 'history' 'prompts' $branchName
```

`Join-Path` in Windows PowerShell 5.1 binds exactly two positional parameters (`-Path`,
`-ChildPath`) and has no remaining-arguments mechanism, so the third argument raises
"A positional parameter cannot be found that accepts argument 'prompts'". The branch,
specs directory and spec file were all created before the failure; only the PHR directory
was missing, and it was created manually so the documented workflow completed. This will
recur on every future feature branch and has been reported rather than silently patched,
because altering shared scaffolding is the user's decision.

## Outcome

- ✅ Impact: An ungoverned, undescribed project now has a validated specification that
  traces every requirement back to a client decision, records three deferrals with their
  seams, and states seven unconfirmed inputs so nothing is mistaken for settled.
- 🧪 Tests: Four validation scans all pass. The technology-leakage scan across 14 terms
  returning zero hits is the load-bearing one, because it enforces the template's central
  constraint that a specification describes what and why, never how.
- 📁 Files: 2 created (spec.md, checklists/requirements.md), 1 PHR, 1 branch.
- 🔁 Next prompts: `/sp.plan` to produce the technical plan, or `/sp.clarify` if the user
  wants to revisit any requirement first.
- 🧠 Reflection: The most consequential judgement was publishing the catalogue
  uncertainty as three pricing presentations instead of asking a question. Because the
  user had already instructed "go ahead and add items at my own discretion for now", the
  specification's job was to make the model tolerate every possible answer, not to force
  a premature one.

## Evaluation notes (flywheel)

- Failure modes observed: Two, both in my own output. First, the quality checklist
  initially claimed the specification had been corrected for a "named tokens" mechanism
  leak when the specification still contained that exact phrase; the post-write scan
  caught the discrepancy and the spec was corrected so the checklist became true rather
  than the other way round. Second, `create-new-feature.ps1` aborted mid-run and the
  workflow would have been left half-complete had I not verified filesystem state rather
  than trusting the absence of JSON output. This is the recurring failure mode on Windows:
  a PowerShell 5.1 binding difference between `Join-Path`, `New-Item` and the Bash
  script this template was ported from.
- Graders run and results: PASS - no leftover template tokens; PASS - zero technology-term
  leakage; PASS - requirements testable and unambiguous, every FR uses MUST and states an
  observable behaviour; PASS - success criteria measurable and free of internal metrics;
  PASS - scope bounded with seams recorded; PASS - dependencies and assumptions identified.
- Prompt variant (if applicable): empty-`## User Input` variant again, as with PHR-001.
  This variant forces the agent to mine conversation history for both requirements and
  rationale, which raised spec quality but removed the user's opportunity to correct a
  misread in the moment.
- Next experiment (smallest change to try): Fix the `Join-Path` arity in
  `create-new-feature.ps1` and confirm a throwaway feature branch creates its PHR
  directory without intervention. If a second PowerShell 5.1 arity defect appears in the
  same script, the port is incomplete and the Bash original should be diffed against the
  PowerShell version wholesale rather than patched defect by defect.