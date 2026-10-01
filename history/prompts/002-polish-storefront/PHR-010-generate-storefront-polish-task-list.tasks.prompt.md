---
id: PHR-010
title: Generate Storefront Polish Task List
stage: tasks
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 002-polish-storefront
branch: 002-polish-storefront
user: abdurrazzakjiwani
command: sp.tasks
links:
  spec: specs/002-polish-storefront/spec.md
  plan: specs/002-polish-storefront/plan.md
  tasks: specs/002-polish-storefront/tasks.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-polish-storefront/tasks.md
 - history/prompts/002-polish-storefront/PHR-010-generate-storefront-polish-task-list.tasks.prompt.md
tests:
 - "check-prerequisites.ps1 -Json - PASS, resolved FEATURE_DIR and AVAILABLE_DOCS (research.md, data-model.md, contracts/, quickstart.md)"
 - "ID sequence integrity - PASS, 63 tasks T001-T063, no gaps, no duplicates"
 - "Checkbox format - PASS, 0 of 63 malformed"
 - "File path coverage - PASS after correction, 63 of 63 tasks name an exact path; initially 13 did not"
 - "Story label discipline - PASS, 45 of 45 story tasks labelled T012-T056, 0 unlabelled, 0 mislabelled on Setup/Foundational/Polish"
 - "Phase count cross-check - PASS, 9 phases summing to 63, matches the Format Validation table"
 - "Parallel-marker collision audit - FAIL on first run, 4 phases with file collisions; corrected"
 - "Parallel-marker collision re-audit - PASS after correction, 0 collisions across all 8 phases"
 - "Claimed vs actual parallel count - FAIL on first reconciliation (17 vs 28); corrected to 22 after de-claiming"
 - "Placeholder and encoding scan - PASS, 0 template tokens, 0 mojibake, U+2264 preserved"
tests_run_total: 10
---

## Prompt

### Request under execution

Execute `/sp.tasks` with an **empty** `## User Input` block. Load `plan.md` and `spec.md`
(required) plus `data-model.md`, `contracts/`, `research.md` and `quickstart.md` (all present),
then generate `tasks.md` in the strict checklist format, organized by user story, with a
dependency graph, parallel execution examples, and an implementation strategy.

## Response snapshot

**63 tasks across 9 phases**, T001–T063, sequential with no gaps and no duplicates. Every task
names an exact file path. The 45 user-story tasks (T012–T056) all carry `[USn]` labels; Setup,
Foundational and Polish correctly carry none.

| Phase | Tasks | Purpose |
|---|---|---|
| 1 Setup | 7 | the one dependency, plus the two pure functions that make the brand decision testable |
| 2 Foundational | 4 | `WhatsAppIcon`, `CyclingControl`, the gallery `autoPlay` contract, the whatsapp.ts freeze |
| 3 US1 (P1) 🎯 | 8 | official mark across all five call sites — **MVP** |
| 4 US2 (P1) | 11 | product cards, article cards, subordinate category cards |
| 5 US3 (P1) | 8 | cycling with a pause that stays paused |
| 6 US4 (P2) | 5 | type scale and figure alignment |
| 7 US5 (P2) | 7 | ~24 products, 8 articles, one imageless item |
| 8 US6 (P3) | 6 | address correctness and deploy |
| 9 Polish | 7 | frozen-behaviour walkthrough and the performance gate |

### Tests were not optional, and the reason is constitutional

The command treats test tasks as optional unless TDD is requested. Neither applied — the
specification never says "test-first". But the constitution's Testing Discipline clause
requires unit tests for **every** pure function in `src/lib/`, and the post-design gate in
`plan.md` commits to unit-testing the contrast math and component-testing the cycling state
machine. Treating tests as optional here would have contradicted a gate the plan had already
passed.

The existing infrastructure was checked before promising anything: `src/tests/` holds three
files and Vitest is installed and green at 58 tests. So test tasks were written as additions
to a working suite, not as work to stand one up. Every test task carries **"Must fail before"**
its implementation task, which is what keeps a passing test from being evidence of a passing
implementation.

### The repository was inspected before the list was written

Task quality depended on facts only the codebase could supply:

- **Five files** import `MessageCircle` today — `WhatsAppButton.tsx`, `page.tsx` (x3),
  `CartDrawer.tsx`, `ProductPurchase.tsx`, `contact/page.tsx`. US1 fails its own independent
  test if any is missed, so all five became distinct tasks (T012–T017) and T018 is a
  verification task asserting zero remaining imports.
- **29 placeholder SVGs** already exist in `public/`, so no task invents an image pipeline.
- `src/lib/catalog.ts` and `src/lib/types.ts` were read directly, so the fixture expansion
  tasks (T044–T047) name the real fields and the real relationship invariants —
  every `categoryId` resolvable, every `relatedSlugs` entry resolvable.

Without those reads, US1 would have been a single task that silently left two call sites with
a generic speech bubble.

### The audit that found false parallelism

`[P]` is a claim: "different files, no dependency on incomplete tasks." Checking it by eye is
exactly the wrong approach, because the claim is about files and files are countable. So every
`[P]` task's file paths were extracted with a regex and grouped by phase to find collisions.

**Four phases had collisions, and all four were wrong:**

| Phase | Collision | Consequence if shipped |
|---|---|---|
| US6 | `globals.css` x3 | three agents editing one stylesheet |
| US5 | `fixtures/data.ts` x3 | three agents rewriting one data file |
| US1 | `WhatsAppButton.tsx` x2 | button and floating mark in one file |
| US2 | `ArticleCard.tsx` x2 | card and its null-image case in one file |

Six `[P]` markers were false and are now sequential, leaving **22 genuinely parallel tasks of
63**. The tasks are still logically independent — three typography refinements do not depend
on each other — but they share a file, and a merge conflict on `globals.css` is a real cost
that a logical dependency graph does not capture. Marking them parallel would have optimised
the appearance of throughput and degraded the actual work.

### A second false green, caught by reconciliation

The first version of the file claimed "18 genuinely parallel tasks" while carrying 28 `[P]`
markers. Both numbers came from the same document and disagreed, which is the same defect class
as the constitution incident recorded in PHR-009: a claim about the artifact that was never
checked against the artifact. Recomputing from the file after de-claiming gave 22, and the
text now carries the verified number. **Parallel: 22 of 63.**

The file-path gap was the third instance of the same class, and the same discipline closed it:
13 of 63 tasks initially named no file. Those were verification tasks — "confirm filters still
pass" — which is not an executable instruction. Each now names the file or artifact it
inspects. 0 of 63 remain.

## Outcome

- ✅ Impact: A 63-task list where each user story is an independently demonstrable increment,
  the MVP is 13 tasks delivering the commercially critical fix, and the critical path is named.
  Six false parallelism claims and thirteen unexecutable verification tasks were corrected
  before the list was published rather than during implementation.
- 🧪 Tests: 10 checks, 2 of which failed on first run and passed after correction — the
  parallel-marker collision audit and the claimed-versus-actual count. No build or runtime
  verification, because no application code was written.
- 📁 Files: 1 created, 1 PHR.
- 🔁 Next prompts: `/sp.implement` for the MVP (Phase 1, 2 and 3 — T001–T019), then per phase.
  The outstanding "Payload as sole backend" ADR remains deferred by user decision.
- 🧠 Reflection: The highest-value output was the collision audit, because `[P]` markers are
  instructions to a future agent about how to divide work, and an incorrect one is worse than
  no marker at all — it invites two agents into one file. The audit is twenty lines of regex
  against a file that already exists, and it caught six errors that reading the document
  carefully would not have.

## Evaluation notes (flywheel)

- Failure modes observed: Three, all the same class, all caught by checking the artifact
  instead of the intention. Six `[P]` markers claimed parallelism across shared files. A
  sentence claimed 18 parallel tasks while the file carried 28. Thirteen tasks named no file and
  so could not be executed. The common thread is that each was a *claim about the document*
  validated against anything other than the document, which is precisely the defect PHR-009
  identified in the constitution incident and predicted would recur.
- Graders run and results: PASS - prerequisite script resolved all four optional documents;
  PASS - 63 tasks with no ID gaps or duplicates; PASS - all tasks carry the checkbox prefix;
  PASS after correction - all 63 name an exact path; PASS - 45 of 45 story tasks labelled with
  no leakage into Setup, Foundational or Polish; PASS - phase counts sum to the total;
  PASS after correction - zero parallel-marker file collisions; PASS after reconciliation -
  claimed parallel count equals actual; PASS - no placeholders or encoding damage.
- Prompt variant (if applicable): empty-`## User Input` variant, eighth consecutive. Every
  input document was authored earlier in this same session, which is the condition most likely
  to produce unexamined assumptions about what the code contains — and the five-sites-of-
  `MessageCircle` finding is direct evidence that assumption would have been wrong.
- Next experiment (smallest change to try): Add the parallel-marker collision check and the
  claimed-versus-actual count reconciliation to a single standing validation script covering
  every spec artifact. All three defect classes found today are one-line assertions, and all
  three are silent — a document that is internally inconsistent still reads as finished.
