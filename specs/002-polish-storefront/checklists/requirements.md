# Specification Quality Checklist: Storefront Polish and Professional Upgrade

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-01
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] CHK001 No implementation details (languages, frameworks, APIs)
- [x] CHK002 Focused on user value and business needs
- [x] CHK003 Written for non-technical stakeholders
- [x] CHK004 All mandatory sections completed

## Requirement Completeness

- [x] CHK005 No [NEEDS CLARIFICATION] markers remain
- [x] CHK006 Requirements are testable and unambiguous
- [x] CHK007 Success criteria are measurable
- [x] CHK008 Success criteria are technology-agnostic (no implementation details)
- [x] CHK009 All acceptance scenarios are defined
- [x] CHK010 Edge cases are identified
- [x] CHK011 Scope is clearly bounded
- [x] CHK012 Dependencies and assumptions identified

## Feature Readiness

- [x] CHK013 All functional requirements have clear acceptance criteria
- [x] CHK014 User scenarios cover primary flows
- [x] CHK015 Feature meets measurable outcomes defined in Success Criteria
- [x] CHK016 No implementation details leak into specification

## Validation Notes

Iteration 1 found one genuine leak and one scope weakness. Both corrected; a second pass
found no further issues.

**CHK001 / CHK016 - implementation detail leakage (FAILED, then corrected).**
US3 acceptance scenario 3 originally read *"when the visitor's device has asked for reduced
motion"* — acceptable — but the FR set named the technique rather than the outcome:
"FR-018: Automatic cycling MUST pause while the visitor's pointer is over the images or
their keyboard focus is within them" was acceptable, while the earlier draft of the Edge
Cases section described pausing as a platform capability. Rewritten throughout in outcome
terms: "the visitor's device has asked for reduced motion" and "the visitor moves a pointer
over the images". No library, format, extension, API or CSS mechanism is named anywhere in
the document.

Deliberate retentions, reviewed and accepted:

- **"recognised minimum contrast threshold"** (FR-004, FR-005, SC-002) rather than naming
  a specific conformance level. The threshold itself is a business and legal commitment
  that must survive implementation choices; naming the mechanism to verify it would have
  been the leak. The measured ratios are required in the plan, not the spec.
- **"keyboard", "pointer", "touch target"** (FR-006, FR-014, FR-019). These describe how a
  person operates the site, not how the site is built.
- **"machine-readable address listings and crawler directives"** (FR-035). Describes the
  artefact's purpose rather than its filename or format.

**CHK005 - clarification markers (PASS, none raised).**
Zero markers. Four genuine open questions were resolved interactively before this run, and
four further uncertainties exist but all have defensible defaults rather than competing
interpretations:

- *How should WhatsApp brand green, which clashes with the cream and amber palette, be
  handled?* Resolved interactively: use the brand mark at its official colour with
  brand-compliant control treatment, rather than recolouring the mark.
- *Should automatic cycling exist at all, given it is a known accessibility problem?*
  Resolved interactively: include it, with a visible pause control and automatic pause on
  interaction and reduced-motion preference. FR-016 to FR-019 make the obligation
  explicit rather than assumed.
- *How much catalogue content to add?* Resolved interactively: roughly twenty-four items
  and eight articles, encoded as minimums in FR-029 and FR-034.
- *What does "refine the fonts" mean?* Resolved interactively: keep the existing pairing,
  refine its application. FR-028 prohibits introducing a new typeface, which removes the
  ambiguity entirely.

Remaining assumptions are recorded in the Unconfirmed Inputs section rather than raised as
questions, because each is a placeholder the business owner will replace and none has
competing reasonable interpretations.

**CHK011 - scope (PASS, and deliberately narrow).**
This release is presentational, and the specification says so in four places rather than
implying it: the preamble ("changes how the site looks and presents itself, not what it
does"), FR-038 which makes unchanged behaviour a testable requirement, SC-013 which makes
regression a measurable outcome, and an EXCLUDED entry naming searching, filtering, the
basket, the delivery form, the checkout message and the contact form.

This is the single most important scoping decision in the document. A "polish the site"
brief invites opportunistic refactoring, and without FR-038 and SC-013 the upgrade would
quietly become a rewrite with no regression safety net. FR-038 to FR-040 exist specifically
to hold that line.

**CHK009 / CHK010 - scenarios and edge cases (PASS).**
Six stories, thirty acceptance scenarios, thirteen edge cases. The edge cases were chosen
for the failure modes that make a carousel or a card system feel broken rather than
polished: one image (nothing to cycle), no images (must not render cycling chrome at all),
more images than the maximum, reduced motion, keyboard focus, and - the subtle one - a
visitor who pauses manually and then moves the pointer away. That last case is in
Edge Cases and enforced by FR-019, because a carousel that silently resumes on mouse-out
defeats the pause the visitor just requested, and it is the specific behaviour that makes
auto-cycling feel hostile.

## Notes

- Items marked incomplete require spec updates before `/sp.clarify` or `/sp.plan`
- Two further findings from the research phase are recorded here because they are
  correctness defects rather than requirements, and are tracked in planning instead:
  - The live site's address listings currently advertise a production domain that no longer
    responds, which sends search engines to a missing page. Covered by FR-035 to FR-037 and
    SC-012.
  - The catalogue currently contains no item without imagery, so the requirement covering
    that state (FR-031) is not satisfiable from existing content and is a new deliverable.
