---
id: PHR-008
title: Clarify Storefront Polish Specification
stage: spec
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 002-polish-storefront
branch: 002-polish-storefront
user: abdurrazzakjiwani
command: sp.clarify
links:
  spec: specs/002-polish-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-polish-storefront/spec.md
 - history/prompts/002-polish-storefront/PHR-008-clarify-storefront-polish-specification.spec.prompt.md
tests:
 - "check-prerequisites.ps1 -Json -PathsOnly - PASS, resolved FEATURE_DIR and FEATURE_SPEC on branch 002-polish-storefront"
 - "Coverage scan across 10 taxonomy categories - PASS, 4 categories Partial or Missing and prioritised by impact x uncertainty"
 - "Question count - 4 asked and answered, within the 5 cap, 10-session cap never approached"
 - "Per-answer integration and validation after every write - PASS, spec saved atomically after each of the 4 answers"
 - "FR numbering integrity - PASS, 42 unique requirements, FR-001..FR-042, no duplicates, no gaps after resequencing"
 - "SC numbering integrity - PASS, 16 unique, SC-001..SC-016"
 - "Contradiction sweep - PASS, 0 stale 'three or more' triggers, 0 stale 'configured maximum' references"
 - "Heading rule - PASS, only '## Clarifications' and '### Session 2026-10-01' added, no stray H2"
 - "Placeholder scan - PASS, zero template tokens, zero NEEDS CLARIFICATION"
 - "Encoding integrity - PASS, U+2192 arrow preserved, zero replacement characters after repeated rewrites"
 - "Implementation-detail leakage - PASS, zero hits across 9 technology terms"
tests_run_total: 11
---

## Prompt

### Request under execution

Execute `/sp.clarify` with an **empty** `## User Input` block. Detect and reduce ambiguity in the
active feature specification and record clarifications directly in the spec file, running
**before** `/sp.plan`. Maximum 5 questions, one at a time, each answerable by option letter or
a five-word phrase.

## Response snapshot

**4 questions asked, 4 answered, 1 deferred.** Specification grew from 40 to 42 functional
requirements and from 15 to 16 success criteria. Clarifications recorded in a single
`### Session 2026-10-01` block with one bullet per accepted answer.

### The four decisions, and why each one mattered

**1. Autoplay placement — item pages only.** The highest-impact ambiguity in the document. The
gallery exists in two places, and the spec committed to neither, yet the answer changes
architecture rather than styling. Accepted: item detail pages cycle, catalogue cards do not.
The rejected alternative was the intuitive one — cycling on cards too, which is what "a
carousel so that three images cycle" most plainly suggests. It is also the failure mode that
justification is built around: the expanded catalogue shows up to 24 items, so a page of
results would run up to 24 concurrent carousels, demand 24 separate pause controls to remain
accessible, and spend real battery and main-thread time animating imagery nobody is looking
at. The specification now asserts this in four places — FR-015, US3, an edge case for browsing
with many cards visible, and a clarification bullet — because this is exactly the kind of
requirement that gets quietly reverted during implementation by someone optimising a
component they have never seen animate.

**2. Cycling set — every image, up to five.** The brief's "three images cycle" reads two ways,
and the original spec committed to neither reading. Accepted: all images, maximum five, with
the remainder reachable as thumbnails. A hard three-image cap would strand the client's real
photographs behind a control the design gives no reason to expect, and the client is the party
supplying the images. This answer also did the work of a second question for free: by naming
five as the ceiling it settled the over-full-gallery edge case, which had been resting on the
vaguer phrase "the configured maximum".

**3. Card coverage — products and articles, categories light.** The spec scoped the redesign to
"each item in the catalogue", which would have left article cards in the old style. Accepted:
product and article cards fully redesigned, category cards given consistency changes only and
required to stay visually subordinate. This is a presentational release whose stated purpose is
that nothing looks out of place, and redesigning product cards while leaving article cards
untouched produces precisely the inconsistency the release exists to remove. Category cards are
held back deliberately: they are browsing affordances that sit above products, and giving them
equal visual weight makes individual products compete with their own navigation.

**4. Performance — previous release's thresholds.** Accepted: largest contentful paint at most
2.5 seconds, layout shift at most 0.1, responsiveness at most 200 milliseconds, on a mid-range
phone over a slow connection. The specification previously contained **no performance
criterion of any kind**, confirmed by searching the success criteria. That mattered more than it
sounds, because FR-024 requires that space be reserved for imagery so that cycling does not
cause visible layout movement — a requirement that, with nothing measurable to check it
against, was a hope rather than a specification. SC-016 now measures cumulative layout shift
specifically while a full page of cards loads, which is the exact condition a visitor
experiences as an unprofessional site. Adopting the previous release's existing numbers rather
than new ones kept this a baseline, not a negotiation.

### Two contradictions the workflow caught that review had missed

The clarification pass was not only additive. Two stale statements survived the original
specification and would have contradicted the clarified requirements:

- **SC-004 and US3 still said cycling triggers at "three or more images"**, while the clarified
  FR-015 sets the trigger at two. Left alone, success criteria and requirements would have
  disagreed about when an item cycles — and the failure would have been silent, because a
  two-image item would pass the requirement and fail the success criterion.
- **The "configured maximum" phrase** in an edge case became redundant once five was named as
  the ceiling, and vagueness in a limit is how an implementation ends up cycling twelve images
  nobody chose to cap.

Neither was visible from reading the specification top to bottom. Both surfaced from a targeted
search for the specific pattern each clarification was meant to eliminate — which is the
argument for doing the contradiction sweep as a distinct step rather than trusting that a clean
diff implies a consistent document.

### Where the process fought me

Three tooling problems, all worth recording because each could have silently corrupted the
artifact.

**The `edit` tool could not find text that was verifiably present in the file.** The
clarification bullet containing a rightwards arrow was inserted successfully, then a follow-up
`edit` using that exact line as its anchor failed with "Could not find oldString". Byte-level
inspection showed the line present, ASCII-clean, 64 characters, exactly as expected, and
`IndexOf` returning -1 for a string that demonstrably existed. The tool was operating on a stale
cache of the file. The workaround was to stop using it for this file and drive edits from
PowerShell with anchors read out of the file itself rather than retyped — which also guards
against a subtly mistyped anchor producing a confusing failure.

**A `→` survived file rewrites and was nearly "fixed" into corruption.** Output rendered as a
replacement character, which is indistinguishable from real mojibake. Checking for U+FFFD across
the file, and for the presence of U+2192 specifically, separated a rendering artefact from
actual damage before any write was attempted. After that, arrow characters in inserted text were
built from their code point rather than typed literally.

**One insertion silently collapsed three lines into one.** A line-joining operation merged a
three-line requirement into a single line with triple spaces where the line breaks belonged.
Markdown still rendered, the text still read correctly, and the requirement was not lost — but
a diff would have shown one long unreadable line, and the same operation run a second time
would have compounded it. Caught by dumping the region with explicit line indices rather than
trusting the write to have done what was intended.

**Renumbering collided with itself.** Inserting two requirements mid-document and shifting every
subsequent number in one pass renumbered the newly inserted ones too, producing a duplicate
`FR-017` for two different requirements. The verification that matters here is not "are there
the right number of requirements" but "is each number unique and are there no gaps" — 42
requirements is the correct count and a duplicate numbering is a broken document that still has
the right count. Both checks run clean now.

## Outcome

- ✅ Impact: Four ambiguities that would each have caused rework resolved before planning, with
  two contradictory statements found and corrected rather than left to fail silently during
  verification. The specification now carries 42 testable requirements and 16 measurable
  outcomes, including a performance budget it previously lacked entirely.
- 🧪 Tests: 11 automated checks — prerequisite resolution, coverage scan, per-answer
  integration, FR and SC numbering uniqueness and continuity, contradiction sweep, heading
  rules, placeholder scan, encoding integrity, implementation-detail leakage. All pass. No build
  or runtime verification, because no application code was written.
- 📁 Files: 1 modified (spec), 1 PHR created.
- 🔁 Next prompts: `/sp.plan`, which can now resolve the technology-level decisions this pass
  deliberately left open — how the WhatsApp colour contrast is resolved with measured ratios, the
  cycling mechanism, and the type scale.
- 🧠 Reflection: The most valuable outcome was not any single answer but the contradiction sweep.
  Two requirements and a success criterion silently disagreed about the cycling trigger, in a
  document I had written myself minutes earlier and already declared clean. The original
  validation pass checked structure, counts and leakage — all of which passed while the
  contradiction sat there. What caught it was searching for the one specific pattern the latest
  clarification was meant to eliminate. Coverage checks find what is missing; pattern checks
  find what is wrong.

## Evaluation notes (flywheel)

- Failure modes observed: Four. Three tooling, one editorial. The stale `edit` cache would have
  produced a failed edit and a likely wrong guess about file state. The arrow-versus-mojibake
  ambiguity risked a "fix" that corrupted a healthy file. The line-collapse produced a document
  that looked fine and diffed badly. The renumbering collision produced duplicate requirement IDs
  with a correct total count. The common thread is that all four were invisible to the checks I
  was already running, which is precisely why a fresh check was added for each.
- Graders run and results: PASS - prerequisite script resolved both paths; PASS - 4 questions
  asked, within the 5 cap; PASS - one clarification bullet per accepted answer, no duplicates;
  PASS - FR-001..FR-042 unique and gapless; PASS - SC-001..SC-016 unique; PASS - only permitted
  new headings; PASS - zero placeholders; PASS - zero implementation-detail terms; PASS -
  contradiction sweep clean.
- Prompt variant (if applicable): empty-`## User Input` variant, sixth consecutive. The
  specification it operated on was one I had authored in the immediately preceding turn, which
  makes this a harder test than it looks: a self-written document is the one I am least likely
  to read critically, and it still contained a contradiction between two of its own success
  criteria and its requirements.
- Next experiment (smallest change to try): Add a uniqueness-and-continuity assertion over every
  numbered identifier in the document to the standing validation script, so the renumbering
  collision class cannot recur silently. It is a few lines, and it catches a failure mode that
  counting alone reports as a pass.
