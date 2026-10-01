---
id: PHR-009
title: Plan Storefront Polish Upgrade
stage: plan
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 002-polish-storefront
branch: 002-polish-storefront
user: abdurrazzakjiwani
command: sp.plan
links:
  spec: specs/002-polish-storefront/spec.md
  plan: specs/002-polish-storefront/plan.md
  constitution: .specify/memory/constitution.md
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - specs/002-polish-storefront/plan.md
 - specs/002-polish-storefront/research.md
 - specs/002-polish-storefront/data-model.md
 - specs/002-polish-storefront/quickstart.md
 - specs/002-polish-storefront/contracts/composition-contract.md
 - AGENTS.md
 - history/prompts/002-polish-storefront/PHR-009-plan-storefront-polish-upgrade.plan.prompt.md
tests:
 - "setup-plan.ps1 -Json - PASS, resolved FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH, HAS_GIT"
 - "Constitution reconstruction validation - PASS, 0 placeholders down from 22, 4 H2 and 6 H3, version line 1.0.0 coherent, 0 trailing-whitespace lines, 0 'should' in principles"
 - "Constitution provenance check - PASS, all six principles evidenced by PHR-001 and feature 001 plan; searched repo for orphaned content and found none"
 - "Official mark verification - PASS, live HTTP 200 from cdn.simpleicons.org, viewBox 0 0 24 24, fill #25D366, 1104-char path captured verbatim"
 - "Contrast measurement - PASS, 8 treatments computed with WCAG 2.x relative luminance; expected values 1.91 / 3.87 / 7.67 all reproduced"
 - "Autoplay registry verification - PASS, 8.6.0, MIT, peerDependencies embla-carousel 8.6.0 exact, dist-tags.latest 8.6.0"
 - "Autoplay API verification - PASS, options and play/stop method surface read from v8.6.0 documentation via Context7"
 - "Pre-gate Constitution Check - PASS, 8 gates answered, 0 FAIL"
 - "Post-design Constitution Check - PASS, 9 additional gates answered, 0 FAIL"
 - "Artifact placeholder scan across 5 files - PASS, 0 template tokens, 0 stale tokens, 0 mojibake"
 - "AGENTS.md manual-additions preservation - PASS, both markers intact, non-negotiable constraints incl. npm.cmd preserved"
 - "Constitution unresolvable-clarification scan - PASS, 0 NEEDS CLARIFICATION markers remain in plan.md"
tests_run_total: 12
---

## Prompt

### Request under execution

Execute `/sp.plan` with an **empty** `## User Input` block: run `setup-plan.ps1 -Json`, fill
Technical Context, answer the Constitution Check from the constitution, generate Phase 0
research, generate Phase 1 data-model/contracts/quickstart, run the agent context script, then
re-evaluate the gate. ERROR on gate failures or unresolved clarifications.

### Deviation from the command outline, and why

The outline says to load `.specify/memory/constitution.md` and answer the Constitution Check
from it. **That file contained 22 unresolved placeholders** - `[PROJECT_NAME]`,
`[PRINCIPLE_1_NAME]`, `[SECTION_2_CONTENT]`, `[CONSTITUTION_VERSION]` and eighteen more. It was
the Specify template, unchanged since the initial commit.

Worse, `git log` on that path returned exactly one commit: `c2f7792 "Initial commit from
Specify template"`. It had never been modified. Yet PHR-001 recorded ratifying constitution
v1.0.0 on this very date, listed the file among its outputs, and reported its validation
passing. Feature 001's `plan.md` contains a **completed** Check citing all six principles by
name - so the reasoning happened; the write never landed.

Three options were put to the user: reconstruct the constitution and plan against it, redo it
as a fresh interactive ratification, or plan with no gate at all. The user chose **option 1,
reconstruct**. That is a governance act performed under explicit instruction, and it is
recorded in the constitution's own header, in the plan's header, and in Complexity Tracking -
three places - so a future reader cannot mistake a reconstruction for an original.

**The evidence was assembled before anything was written.** Each of the six principles was
recovered from PHR-001's description, then cross-checked against feature 001's Check to confirm
it had actually been applied rather than merely claimed. A repo-wide search for the principle
names confirmed no orphaned constitution text existed elsewhere. Nothing was invented; the one
clause with no independent witness (Testing Discipline) was found quoted in feature 001's
Complexity Tracking and added under Constraints with its source named.

### The measurement that decided the design

The specification had deliberately refused to name a WhatsApp colour, leaving it to planning
"where the ratios get measured rather than asserted." So the ratios were measured, and they
overturned the obvious answer:

| Treatment | Ratio | |
|---|---|---|
| brand green on cream | **1.91** | FAIL |
| white on brand green | **1.98** | FAIL |
| brand green on teal `#075E54` | 3.87 | PASS UI |
| white on teal `#075E54` | **7.67** | PASS AA |

Both treatments a person reaches for first fail, and they fail by a wide margin. WhatsApp's own
deep teal carries the unmodified brand-green mark at 3.87 and white label text at 7.67. This is
why the specification wrote FR-002 (never recolour), FR-004 (controls must pass) and FR-005
(standalone marks need a background) as three separate requirements instead of one colour
instruction: the requirement could not be satisfied by picking a colour, only by constraining
where the mark may appear.

The numbers are now unit-testable through a new `lib/contrast.ts`, so the decision cannot rot
when a token changes.

### A second finding that changed the implementation

`embla-carousel-autoplay` was verified against the npm registry: 8.6.0, MIT, and
`peerDependencies: { embla-carousel: "8.6.0" }` - an **exact** version, not a range. The
installed `embla-carousel-react` is 8.6.0, so the pin matches. That much is routine.

The consequential finding came from reading the plugin's documented options. `stopOnMouseEnter`
resumes on mouse-leave **only** when `stopOnInteraction` is `false` - and in that
configuration the plugin restarts itself after every drag or click. So the settings that appear
to deliver FR-018 and FR-019 together would have silently broken FR-019: a visitor who drags the
carousel gets it started again behind their back.

FR-019 (a manual pause is sticky) **cannot be delegated to the plugin.** It needs local state
that survives hover, focus, and remount. Two consequences reached the plan as design
constraints rather than notes: the gallery owns a `userPaused` flag that nothing may clear
except an explicit resume, and `playOnInit: false` so the reduced-motion check runs *before*
the first tick - making FR-017 literally true rather than cancelled milliseconds later. The
state machine is now drawn in `data-model.md`.

A related detail: the plugin exposes only `play(jump?)` and `stop()`. There is no `isPlaying()`,
so the pause control's own pressed state must come from our state rather than being read back.

### The domain defect was diagnosed, not just described

The specification recorded the stale `robots.txt` and `sitemap.xml` as a live defect. Reading
the two files showed the root cause is **not** a hardcoded string - both correctly read
`NEXT_PUBLIC_SERVER_URL` with a localhost fallback. The variable is simply unset on the Vercel
project, so the deployed site advertises `localhost` while the old domain 404s.

That changed the fix from "edit a string" to "set an environment variable", and changed the
verification. A green build proves nothing here - the build passes today while emitting unusable
addresses - so the quickstart asserts against the *built artifact* instead. Same principle as
the contrast work: verify the output, not the process.

### One judgement worth surfacing

The constitution's Principle I requires all business identity to come from `site-settings`. The
WhatsApp mark is a brand asset, not a business value, so the plan records it as a code constant
and explains the reasoning: exposing it in the CMS would let the merchant recolour a mark the
brand guidelines forbid changing. A wider failure than a code change. This is a deliberate,
documented narrowing rather than a silent exception, and the post-design re-check says so
plainly.

## Outcome

- ✅ Impact: A feature that could not be planned at all was unblocked. The colour conflict that
  the specification refused to guess at is resolved by computation, and the two obvious
  treatments are documented as measured failures. The sticky-pause requirement is assigned to
  code that can actually satisfy it, and the card-motion prohibition is now a prop default
  rather than a review comment.
- 🧪 Tests: 12 automated checks, all PASS. Live verification of the brand mark and the plugin's
  registry metadata; 8 contrast ratios computed in-session; gate answered twice, before and
  after design, with 0 FAIL and 0 unresolved clarifications. No build or runtime verification,
  because no application code was written.
- 📁 Files: 7 created or modified, 1 PHR.
- 🔁 Next prompts: `/sp.tasks`, then implementation. The outstanding ADR for "Payload as sole
  backend" remains deferred by user decision and is recorded as such.
- 🧠 Reflection: The highest-value finding was the plugin restarting after interaction, because
  it is a bug that would have shipped. Every other artefact here is a document that could have
  been written slightly wrong; that one would have produced a carousel that ignores a visitor
  who explicitly asked it to stop - in direct violation of a requirement the clarification
  session had explicitly identified as the one that matters. It surfaced only because the
  requirement was written to forbid a *behaviour* rather than to request a *control*.

## Evaluation notes (flywheel)

- Failure modes observed: Two. First, the constitution reconstruction was gated on evidence
  rather than memory, and that gate did its job - it also surfaced that PHR-001's own
  validation had passed against intended text rather than the file on disk, which is a
  validation design flaw now understood for the rest of the project. Second, a PowerShell
  `-f` format string failed twice on concatenated arguments before being rewritten with explicit
  `PadRight` calls; the first failure was a `FormatError` inside a loop, and retrying the same
  construct would have produced the same error.
- Graders run and results: PASS - setup script resolved all paths; PASS - constitution 0
  placeholders with coherent version line and provenance note; PASS - every external fact has a
  live named source; PASS - pre- and post-design gates answered with 0 FAIL; PASS - 0 unresolved
  NEEDS CLARIFICATION; PASS - 5 artifacts clean of placeholders and mojibake; PASS - AGENTS.md
  manual additions preserved across the update script's rewrite.
- Prompt variant (if applicable): empty-`## User Input` variant, seventh consecutive. The
  feature specification was one I authored two turns earlier, and the command's very first step -
  load the constitution - was impossible. Self-authored upstream artifacts are the least likely
  to be checked and the most likely to be wrong.
- Next experiment (smallest change to try): Change every validation step in this workflow to
  read the file back from disk and assert against its contents, never against an in-memory
  value or an intended result. PHR-001 passed its own validation while the file it claimed to
  write was untouched; that is a whole class of false green, and it is the one failure in this
  project that no amount of care at the writing step would have caught.
