---
id: PHR-004
title: Generate Storefront Task List
stage: tasks
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 001-whatsapp-storefront
branch: 001-whatsapp-storefront
user: abdurrazzakjiwani
command: sp.tasks
labels: [tasks, task-generation, user-stories, gates, validation, formatting]
links:
  spec: specs/001-whatsapp-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-whatsapp-storefront/tasks.md
 - history/prompts/001-whatsapp-storefront/PHR-004-generate-storefront-task-list.tasks.prompt.md
tests:
 - "check-prerequisites.ps1 -Json executed - PASS, FEATURE_DIR resolved, 4 optional design docs detected present"
 - "Checklist format validation - PASS: 140 tasks, 0 malformed, IDs sequential 1-140, 0 duplicates"
 - "File path compliance audit - PASS: 54 tasks initially lacked explicit paths, all corrected; 2 remaining flags are directory paths (false positives)"
 - "Story label placement - PASS: 76 story-labelled tasks across US1-US7, none in Setup/Foundational/Polish"
 - "Parallel marker audit - PASS: 50 tasks marked [P], all in different files with no intra-phase dependencies"
 - "UTF-8 encoding verification - PASS: 16 em-dashes intact, 0 replacement characters"
---

## Prompt

### Request under execution

Execute `/sp.tasks` with an **empty** `## User Input` block. Per the command's own guidance,
the feature description is the preceding conversation and the user must not be asked to
repeat it. The request: run the prerequisites check, load plan.md, spec.md, data-model.md,
contracts/, research.md and quickstart.md, generate tasks.md organised by user story with a
dependency graph, parallel examples and an implementation strategy, validate that every
task follows the strict checklist format, and report counts per story.

## Response snapshot

Prerequisites check returned `FEATURE_DIR` plus all four optional design documents
present, so tasks were generated against the full design set rather than spec and plan
alone.

**140 tasks across 10 phases**, all format-validated.

| Phase | Tasks | Content |
|---|---|---|
| 1 Setup | 12 | Scaffold, version pins, env, tokens, Vitest |
| 2 Foundational | 33 | Payload config, 9 collections, access control, utilities, primitives, seed, **GATE 1 and 2** |
| 3 US1 (P1) | 17 | Shell, homepage, catalogue, filters, search, carousel, item page, JSON-LD |
| 4 US2 (P1) | 10 | Gallery constraints, upload verification, GATE 3, seed rendering |
| 5 US3 (P1) | 10 | WhatsApp builder + adversarial tests, enquiry endpoint, floating button |
| 6 US4 (P2) | 13 | Cart store, address form, drawer, checkout |
| 7 US5 (P2) | 7 | Hardcode audit, contact/about/privacy pages, identity verification |
| 8 US6 (P2) | 12 | Contact endpoint, spam guards, notification, failure-path check |
| 9 US7 (P3) | 7 | Blog index and detail |
| 10 Polish | 19 | SEO, a11y, breakpoints, access-control both-directions, handover |

Distribution across stories: US1 17, US4 13, US6 12, US2 10, US3 10, US5 7, US7 7.

### Judgement calls worth surfacing

**The entire data model went into Foundational, not into a story phase.** Products, Media
and Categories each serve at least three stories, so scoping them to one story would make
the other two depend on an incomplete schema. Foundational is therefore the largest phase
at 33 tasks. This inverts the template's default of "models in the earliest story", and the
reasoning is recorded in the phase header so it is not mistaken for bloat.

**US2 is thinner than its priority suggests, and that is honest.** Payload generates the
admin UI from collection configs, so the owner's create-edit-reorder-delete journey is
mostly *already built* by Foundational. Rather than invent implementation work to fill the
phase, US2 contains the constraints the generated UI does not automatically satisfy -
gallery min/max, mandatory alt text, MIME rejection, category-delete blocking - plus
verification that must be proven rather than assumed. The phase opens with a note saying
exactly this.

**Three verification tasks are gates, not chores.** T044 (upload, redeploy, confirm the
image survives), T045 (upload above 4.5MB) and T071 (admin autosave under rapid saves)
are placed in Foundational and US2 and are marked as blocking. T044 in particular is
annotated in the Notes section as a release gate: uploading an image and seeing it in a
local admin panel proves nothing about ephemeral disk.

**Tests were treated as mandatory, not optional.** The command permits omitting them, but
the constitution's Testing Discipline requires unit tests for every pure function in
`src/lib/` and adversarial-input tests for anything whose output reaches a third party.
That produced `src/tests/whatsapp.test.ts` with a dedicated adversarial case set covering
`&`, `#`, `?`, `%`, `/`, `+`, spaces, newlines, emoji and right-to-left characters, because
the builder's output is a live `wa.me` URL and an unencoded message is a documented
WhatsApp failure mode.

**T103 includes an acceptance case, not just rejections.** The spam-guard test must prove
a submission after a normal reading interval *succeeds*. An over-strict timing threshold
that silently blocks genuine visitors is the most likely way this feature harms real
customers, so it is a named test case.

**T130 requires access control tested in both directions.** Each rule confirmed permitted
and confirmed denied, because a rule verified only as permissive is exactly the failure
mode Principle IV names.

### Format compliance

Validated by script: 140 task lines, 0 malformed, IDs sequential 1-140, 0 duplicates, 50
marked `[P]`, 76 carrying story labels, none in Setup, Foundational or Polish.

**A first pass found 54 tasks without an explicit file path**, all of them verification or
installation tasks. These were corrected in five batches, each now naming the file being
verified. This was not cosmetic: "Verify that editing an item's title appears on the
public site" tells an executing agent nothing about where to look, whereas the corrected
form names the collection config and the storefront route. Two tasks remained flagged and
were confirmed to be false positives, referring to directories (`src/components/`,
`src/app/(frontend)/`) rather than files.

UTF-8 encoding was checked explicitly after PowerShell's console rendered 16 em-dashes as
replacement characters. Reading the file as UTF-8 confirmed 16 em-dashes and zero
replacement characters, so the file is intact and the display was the artefact.

## Outcome

- ✅ Impact: The feature moved from a designed architecture to 140 individually executable
  tasks, ordered so that each user story is a shippable increment and the highest-severity
  infrastructure risk is gated before storefront work begins.
- 🧪 Tests: Prerequisite check passed. Format validation passed on all five dimensions. The
  file-path audit found and fixed 54 real gaps. No build or test execution occurred,
  because no implementation code exists yet; claiming otherwise would be false.
- 📁 Files: 1 created (`tasks.md`), 1 PHR. No other file modified.
- 🔁 Next prompts: `/sp.implement` to begin execution at Phase 1. The "Payload as sole
  backend" ADR is still outstanding and requires user consent.
- 🧠 Reflection: The most consequential decision was putting the whole data model in
  Foundational. It makes Phase 2 the largest and least parallel-friendly phase, which feels
  like poor project shape, but the alternative silently couples three user stories to
  whichever one happened to define the schema. Making the coupling explicit and up-front is
  cheaper than discovering it in Phase 5.

## Evaluation notes (flywheel)

- Failure modes observed: Two. First, the initial generation under-specified 54 of 140
  tasks, concentrated in verification tasks where I wrote a behavioural assertion without
  naming its subject. The template's format rule caught it, and the fix materially
  improved executability rather than merely satisfying a regex. Second, PowerShell's
  default ANSI console read appeared to corrupt em-dashes across the file; verifying with
  an explicit UTF-8 read prevented an unnecessary "fix" to correct text. The recurring
  theme across all four PHRs is that generated or displayed output required independent
  verification before being trusted.
- Graders run and results: PASS - 140 tasks, 0 malformed; PASS - IDs sequential with no
  duplicates; PASS - 54 file-path gaps found and closed; PASS - story labels correctly
  placed and absent from non-story phases; PASS - parallel markers justified; PASS - UTF-8
  intact.
- Prompt variant (if applicable): empty-`## User Input` variant, fourth consecutive. Worth
  noting explicitly: the tasks are now specific enough for an LLM to execute unattended,
  which is precisely the condition under which a misread in the specification would be
  executed at scale without a human noticing. This raises the value of a human review pass
  before `/sp.implement`.
- Next experiment (smallest change to try): Before `/sp.implement`, ask the user to confirm
  the two decisions with the largest blast radius: (a) whether Foundational should really
  absorb the entire data model, or whether Products and Media should move to US1 and US2 to
  make an earlier partial start possible; and (b) confirmation that the three-second
  anti-spam floor is acceptable, since it is the one parameter that can silently reject
  real customers.