---
id: PHR-007
title: Specify Storefront Polish Upgrade
stage: spec
date: 2026-10-01
surface: agent
model: space-bunny-free
feature: 002-polish-storefront
branch: 002-polish-storefront
user: abdurrazzakjiwani
command: sp.specify
links:
  spec: specs/002-polish-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-polish-storefront/spec.md
 - specs/002-polish-storefront/checklists/requirements.md
 - .specify/scripts/powershell/create-new-feature.ps1
 - history/prompts/002-polish-storefront/PHR-007-specify-storefront-polish-upgrade.spec.prompt.md
tests:
 - "create-new-feature.ps1 executed - PASS, branch 002-polish-storefront created and spec initialised"
 - "Known Join-Path defect reproduced a third time - FIXED at source in the script, prompts dir now created automatically"
 - "Template token and NEEDS CLARIFICATION scan - PASS, zero remaining"
 - "Implementation-detail leakage scan across 16 terms (React, Next.js, Tailwind, CSS, lucide, Embla, autoplay, npm, TypeScript, component, API, svg, className, WCAG, import) - PASS after 1 correction, zero hits"
 - "Checklist validation - PASS, 16 of 16 items, 1 correction iteration"
 - "Structure counts verified - PASS: 40 functional requirements, 15 success criteria, 27 acceptance scenarios, 6 stories, 13 edge cases"
---

## Prompt

### Request under execution

Execute `/sp.specify` with an **empty** `## User Input` block. Per the command's own
guidance, the feature description is the preceding conversation rather than an inline
argument, and the user must not be asked to repeat it.

The feature description, as given by the user: *"I want you to polish and improve the entire
website - refine the fonts and pages, add more content (like additional products), and style
the product displays as cards to give them a professional look. Please implement a carousel
so that three images cycle through automatically; the client will upload the actual images,
so you just need to handle the animation. Also, redesign the WhatsApp icon - the current
one isn't the official version, so do some research to get the design right. Maintain the
site with the mindset of a Full-Stack Developer to ensure nothing looks out of place.
Finally, verify everything and deploy it to Vercel; I have already updated the domain on
Vercel and deleted the old one."*

Four decisions were resolved interactively before this run and are recorded in the
specification: official WhatsApp mark with brand-correct button treatment; automatic cycling
with a visible pause control; roughly twenty-four products and eight articles; keep the
existing font pairing and refine its details; production domain
`yourecommercestore.vercel.app`.

## Response snapshot

Branch `002-polish-storefront` created from `001-whatsapp-storefront`. Specification written
with **40 functional requirements, 15 success criteria, 27 acceptance scenarios, 6 user
stories and 13 edge cases**. Quality checklist passes 16 of 16 items.

### The scoping decision that matters most

A "polish the whole site" brief invites opportunistic refactoring. Without a guard, this
release would quietly become a rewrite with no regression safety net. Four separate
mechanisms now hold that line:

- The specification preamble states the release changes how the site looks, not what it
  does.
- An EXCLUDED entry names searching, filtering, the basket, the delivery form, the checkout
  message and the contact form individually.
- **FR-038** makes unchanged behaviour a testable requirement.
- **SC-013** makes regression a measurable outcome, verified by walking each flow end to
  end.

A presentation upgrade that silently breaks checkout has failed regardless of how good it
looks, so the regression guard is written into the specification rather than left to
discipline.

### Research findings carried into the specification

**The official WhatsApp mark was obtained** from the canonical Simple Icons source
(`viewBox 0 0 24 24`, brand green `#25D366`). The current `MessageCircle` is confirmed
wrong on the evidence: lucide-react carries **no** brand icons, they were deprecated, and
lucide's own deprecation notice redirects to simpleicons.org.

**A genuine brand conflict was surfaced rather than silently resolved.** Meta's guidelines
state the mark may not be recoloured, so brand green must stay green - but brand green on
cream measures roughly 2.3:1 and fails the accessibility threshold, and white on the
official light green measures roughly 2.2:1. So neither a loose green icon on cream nor a
light-green button is acceptable. This becomes FR-002 (mark not recoloured), FR-004
(controls meet the contrast threshold) and FR-005 (standalone marks need an appropriate
background). The specific colour resolution is an implementation decision left to planning,
where the ratios get measured rather than asserted.

**Automatic cycling carries an accessibility obligation, not just a risk.** It is made
explicit across FR-015 to FR-024 rather than treated as polish: a visible pause control, no
automatic cycling when the visitor's device has asked for reduced motion, pause on pointer
and focus, and - the subtle one - **FR-019, a manually paused carousel stays paused**. A
carousel that silently resumes on mouse-out defeats the pause the visitor just requested,
and that behaviour is what makes automatic cycling feel hostile. It is called out in Edge
Cases for that reason.

**A live defect was found and made a requirement.** The production domain was changed and
the old address removed, but the site's own address listings still advertise the dead
domain, which sends search engines to a missing page. That becomes FR-035 to FR-037 and
SC-012, and SC-012 requires every published address to be confirmed resolving rather than
assumed correct.

**A specification requirement was unsatisfiable from existing content.** No item in the
current catalogue has no imagery, so the state the previous release specified was never
demonstrable. FR-031 makes one such item a new deliverable rather than an untested branch.

### One thing the specification deliberately does not do

It does not record which library performs the cycling, nor the mechanism for reduced-motion
detection. The first pass leaked the term "autoplay" into the Input header, and the leakage
scan caught it. Playlists of format, class and framework terms all return zero hits. The
technology choice is deliberately left to planning, where it can be verified against the
installed package rather than asserted in a document written before installation.

## Outcome

- ✅ Impact: A visual upgrade brief, which is unusually prone to scope drift, is now a
  specification with 40 testable requirements, an explicit behavioural freeze, and two
  latent defects promoted to requirements.
- 🧪 Tests: Branch created, spec and checklist written, template-token scan clean,
  implementation-leakage scan clean after one correction, checklist 16 of 16, structure
  counts verified. No build or runtime verification occurred, because no application code
  was written in this command.
- 📁 Files: 2 created, 1 script fixed, 1 PHR.
- 🔁 Next prompts: `/sp.plan` to resolve the technology decisions - the colour resolution
  with measured ratios, the cycling mechanism, the type scale - then `/sp.tasks`.
- 🧠 Reflection: The most valuable output was FR-019. The pause-respects-manual-pause rule
  is one sentence, and it is the difference between automatic cycling that feels
  considerate and automatic cycling that a visitor experiences as the site ignoring them.

## Evaluation notes (flywheel)

- Failure modes observed: Two. First, the known PowerShell 5.1 `Join-Path` arity defect in
  `create-new-feature.ps1` reproduced for the third time across three feature creations,
  aborting the script before it created the history directory. Having reported it twice
  without action, this run fixed it at source by nesting the calls; it will not recur for
  feature 003. Second, my own specification leaked the term "autoplay" into the Input
  header, caught by the leakage scan. Both were caught by automated checks rather than
  review, which continues to be the pattern worth keeping.
- Graders run and results: PASS - zero leftover template tokens; PASS - zero
  implementation-detail terms after one correction; PASS - requirements testable and
  unambiguous; PASS - success criteria measurable and outcome-framed; PASS - scope bounded
  with a named behavioural freeze; PASS - dependencies and assumptions identified; PASS -
  stories cover all six requested concerns.
- Prompt variant (if applicable): empty-`## User Input` variant, fifth consecutive. The
  conversation carried a genuinely dense feature description including four interactively
  resolved decisions, so reconstruction was high fidelity here, but the user again had no
  opportunity to correct a misread at the point it was cheapest to do so.
- Next experiment (smallest change to try): In `/sp.plan`, measure the actual contrast
  ratios for the three candidate WhatsApp treatments before committing to one. The
  specification deliberately left the colour resolution to planning because the numbers
  decide it, and asserting a value in a document written before the tokens existed would
  have repeated the mistake of the earlier rejected amber.