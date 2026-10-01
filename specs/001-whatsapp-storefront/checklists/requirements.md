# Specification Quality Checklist: WhatsApp Service Storefront

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

Iteration 1 identified two failures; both were corrected before this checklist was
marked complete. A second validation pass found no further issues.

**CHK001 / CHK016 - implementation detail leakage (FAILED, then corrected).**
Two leaks were present on the first pass:

1. The Unconfirmed Inputs section described preserved data structures by their technical
   names ("a dedicated customer record type is defined", "held as named tokens"). These
   were restated as business language: a customer record type is now described as "a
   dedicated customer record type is defined and each enquiry can be linked to a
   customer", and the theme seam as "all colours are held as named tokens in one place".
   The latter was reworded to describe the outcome the owner experiences rather than the
   mechanism.
2. Dependencies named "a hosted database". Corrected to "a hosted data store the business
   owner does not have to maintain".

Deliberate retentions, reviewed and accepted:

- **WhatsApp** appears throughout. This is a stated business requirement from the client
  brief, naming the channel the business sells through, not an implementation choice.
- **WCAG 2.1 AA contrast thresholds** appear in FR-045 and SC-014. This is a quality bar
  with a published measurement method, not a technology. It was kept because the
  constitution makes accessibility a release gate and a spec that cannot express it
  cannot be validated against it.
- **"375, 768, 1024 and 1440 pixel widths"** in FR-043/044. Device widths are the
  observable condition a stakeholder can verify, not an internal choice.
- **Five-digit postal codes and Pakistan province validation** in FR-018/019. These are
  domain rules from the delivery geography, externally verifiable.

**CHK005 - clarification markers (PASS, no markers required).**
Zero [NEEDS CLARIFICATION] markers were raised. Every gap in the brief had either a
defensible default or was already resolved interactively before this run:

- Catalogue composition was unknown, but Principle III forbids guessing and instead
  requires the model to accommodate goods, software and services simultaneously. The
  three pricing presentations exist precisely so no assumption was made.
- Business identity was unknown. Principle III additionally forbids inferring it from
  incidental sources such as an email domain, so it is recorded as an unconfirmed input
  with a deliberately implausible provisional value.
- Whether to charge online was explicitly declined by the owner, recorded as EXCLUDED.

Asking the user to restate decisions already made in this conversation would have
produced noise, not clarification.

**CHK009 - acceptance scenarios (PASS).**
All seven user stories carry Given/When/Then scenarios. Story 2 was checked most
carefully because it is the client's own stated priority, and it carries a scenario for
the failure path (CHK FR-027) rather than only the happy path.

**CHK010 - edge cases (PASS).**
Fourteen edge cases recorded, including the ones most likely to be skipped and most
expensive to discover late: a basket containing only quote items, a category deleted
while items remain in it, an item published with no images, a saved address that has
gone stale, and WhatsApp not being installed.

**CHK011 - scope (PASS).**
Ten exclusions and three deferrals are recorded, each with a seam or a reason. This is
mandated by Constitution Principle III and is enforced by the updated spec template.

**CHK014 - primary flows (PASS, with a note).**
Both personas are covered: six visitor stories and, critically, two owner stories (2 and
5). The owner's self-sufficiency is the client's stated reason for the project, so it is
represented as a first-class user story at P1 rather than treated as an implied
by-product.

Note on priority ordering: Story 2 (owner publishes an item) is P1 even though it is not
a visitor journey, because a catalogue with nothing in it satisfies no visitor story.
This is intentional and is the one place where the priority order departs from a simple
visitor-value ranking.

## Follow-up for Planning

- `/sp.plan` must resolve the durable media storage dependency first. The spec states the
  requirement ("uploaded images survive a site redeployment") without naming a provider,
  and the constitution makes it a scaffold-time release gate.
- `/sp.plan` must decide where the WhatsApp link format is defined, so that the
  enquiry-message construction is specified in exactly one place rather than repeated
  across the item page, the basket and the persistent support control.
- FR-042 constrains anti-spam measures against false rejections. Planning should treat
  the timing threshold as a tunable with a named rationale, since an over-strict value
  rejects genuine visitors.

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Link to relevant resources or documentation
- Items are numbered sequentially for easy reference