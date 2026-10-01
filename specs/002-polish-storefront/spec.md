# Feature Specification: Storefront Polish and Professional Upgrade

**Feature Branch**: `002-polish-storefront`
**Created**: 2026-10-01
**Status**: Draft
**Input**: Client brief to polish and improve the entire website: refine the fonts and
pages, add more content such as additional products, present products as professional
cards, implement an automatic image carousel that cycles through images, redesign the
WhatsApp icon so it matches the official brand, ensure nothing looks out of place across
the site, verify everything, and deploy to Vercel. Decisions taken interactively: use the
official WhatsApp mark with brand-correct button treatment; automatic cycling with a
visible pause control; expand to roughly 24 products and 8 articles; keep the existing
font pairing and refine its details; production domain is
`yourecommercestore.vercel.app`.

## User Scenarios & Testing *(mandatory)*

This feature changes how the site **looks and presents itself**, not what it does. The
stories are therefore written around what a visitor perceives, and around one corrective
story for a live defect discovered during the work.

### User Story 1 - Visitor recognises the WhatsApp channel instantly (Priority: P1)

A visitor scans the page and wants to contact the business. Wherever the site offers a way
to message the business, they see a recognisable WhatsApp mark rather than a generic
speech-bubble symbol, on a control that is visibly a WhatsApp action and is clearly
different from the site's other buttons.

**Why this priority**: Contacting the business is the entire commercial outcome of the
site. A lookalike icon reads as "some messaging app", and a WhatsApp action styled like an
ordinary button reads as "some contact option". Both cost trust at the exact moment the
visitor is ready to act.

**Independent Test**: Visit every page that offers contact and confirm each uses the
official mark and a distinct treatment, with no generic speech-bubble symbol anywhere.

**Acceptance Scenarios**:

1. **Given** the visitor is on any page, **When** they look for a way to message the
   business, **Then** every such control displays the official WhatsApp brand mark.
2. **Given** the visitor is comparing a WhatsApp action with an ordinary button nearby,
   **When** they look at the two side by side, **Then** the WhatsApp control is
   distinguishable at a glance without reading the label.
3. **Given** the visitor has low vision or a screen set to low contrast, **When** they
   view a WhatsApp control, **Then** the control's text and mark are legible against its
   background, measured against the recognised accessibility contrast threshold.
4. **Given** the visitor uses a screen reader, **When** they reach a WhatsApp control,
   **Then** they hear a meaningful description of the action rather than the word
   "image".

---

### User Story 2 - Visitor evaluates products confidently from cards (Priority: P1)

A visitor browses the catalogue and wants to compare items quickly. Each item appears as a
card with a consistent structure: a clear photograph, its category, whether it is
available, its name, a short description, its price or quote status, and an obvious way to
add it to their basket. Nothing on the card is clipped, overlapping, or inconsistent with
its neighbours.

**Why this priority**: The card is the primary unit of browsing. If cards look
unfinished, the whole catalogue reads as unfinished, regardless of how good the underlying
content is.

**Independent Test**: Browse the catalogue on a phone, a tablet and a desktop, and confirm
every card shows the same elements in the same order with nothing clipped or overlapping.

**Acceptance Scenarios**:

1. **Given** items exist across categories, **When** the visitor views the catalogue,
   **Then** every card shows an image, category, availability, name, summary, price or
   quote status, and an add action.
2. **Given** a card is viewed on a phone and on a desktop, **When** the card is rendered at
   each size, **Then** every element remains readable and nothing is clipped or overlapped.
3. **Given** an item name or summary is unusually long, **When** the card is rendered,
   **Then** the card keeps a consistent height and the text is shortened cleanly rather
   than spilling out.
4. **Given** an item is quoted on request rather than priced, **When** its card is
   rendered, **Then** no price figure appears anywhere on the card.
5. **Given** a visitor hovers or focuses a card, **When** they move to it, **Then** the
   card responds visibly so they know it is interactive.

---

### User Story 3 - Visitor sees item images cycling, and can stop them (Priority: P1)

A visitor is looking at an item and wants to see more of its photographs without having to
click anything. The images advance on their own. If the images are moving too fast, or the
visitor simply does not want movement, they can stop them, and they stop automatically
whenever they interact with the control.

**Why this priority**: Automatic cycling shows more of each item without effort, which is
the point of the request. It also carries a genuine accessibility obligation, and a
visitor who cannot stop moving content is excluded from the site.

**Independent Test**: Open an item with three or more images and confirm the images begin
cycling on their own, that a pause control is visible and works, and that the movement
stops when the visitor hovers, tabs into, or otherwise interacts with the control.

**Acceptance Scenarios**:

1. **Given** an item has three or more images, **When** the visitor views the item page
   without touching anything, **Then** the images begin advancing automatically within a
   few seconds.
2. **Given** the images are cycling, **When** the visitor activates the pause control,
   **Then** the images stop and the control offers a way to resume them.
3. **Given** the visitor has asked their device to reduce motion, **When** they open an
   item page, **Then** the images do not cycle at all, while manual controls remain
   available.
4. **Given** the visitor moves a pointer over the images or moves keyboard focus into
   them, **When** the images are cycling, **Then** cycling pauses and does not resume until
   the visitor moves away and only if they have not paused it themselves.
5. **Given** the visitor cannot see the images change, **When** they are on an item page,
   **Then** the position within the image set is available to them in words, for example
   "image 2 of 4".
6. **Given** an item has only one image, **When** the visitor views it, **Then** no cycling
   occurs and no pause control is shown, because there is nothing to cycle.

---

### User Story 4 - Visitor reads comfortably (Priority: P2)

A visitor reads product descriptions and articles. Headings, body text, prices and
quantities are sized and spaced consistently, prices stay neatly aligned as values change,
and long text wraps without awkward gaps.

**Why this priority**: Comfortable reading is what makes a longer page feel considered
rather than dense. Below the card and carousel work in impact.

**Independent Test**: Read every page in long form, including on a phone, and confirm
consistent heading hierarchy, aligned figures in prices and quantities, and clean wrapping.

**Acceptance Scenarios**:

1. **Given** prices and quantities appear in more than one place, **When** a visitor
   changes a quantity or compares two prices, **Then** the figures stay aligned in columns
   and do not shift sideways as the numbers change.
2. **Given** a heading is long, **When** it wraps to more than one line, **Then** the lines
   are balanced rather than leaving a short orphan.
3. **Given** body paragraphs of differing lengths, **When** they render, **Then** vertical
   spacing between them is consistent regardless of length.
4. **Given** the site's font pairing, **When** headings and body text are compared across
   pages, **Then** the same heading level always looks the same and body text is always
   rendered in the same face.

---

### User Story 5 - Visitor browses a fuller catalogue (Priority: P2)

A visitor arrives expecting a real business and wants to see breadth. The catalogue holds a
meaningful number of items across enough distinct categories that filtering and searching
have something to do, and the blog holds enough articles to look maintained.

**Why this priority**: A nine-item catalogue looks like a demonstration rather than a
business. Breadth also makes the search and filter behaviour reviewable before the real
catalogue arrives.

**Independent Test**: Browse the expanded catalogue, confirm items span the expected number
of categories, confirm filtering and search behave across the larger set, and confirm the
article index is populated.

**Acceptance Scenarios**:

1. **Given** the visitor opens the catalogue, **When** items load, **Then** at least
   twenty-four items are present across at least eight categories including
   sub-categories.
2. **Given** the larger catalogue, **When** the visitor filters by category, price or
   availability, **Then** the result count updates and every remaining item still belongs
   to a real category.
3. **Given** the visitor searches, **When** they type a term matching several items, **Then**
   matching items across different categories are all returned.
4. **Given** an item has no photographs at all, **When** its card and page are viewed,
   **Then** it remains reachable and is clearly marked as having no photo, rather than
   showing a broken image.
5. **Given** the visitor opens the blog, **When** articles load, **Then** at least eight
   published articles are listed and each opens to a readable page.

---

### User Story 6 - Visitor and search engines reach the live site (Priority: P3)

A visitor follows a shared link, and a search engine crawls the site. Both arrive at the
current live address. Nothing on the site points visitors or crawlers at an address that
no longer exists.

**Why this priority**: A live defect discovered during this work already sends search
engines to a dead address in the site's own sitemap. It costs credibility invisibly, and it
is cheap to correct.

**Independent Test**: Fetch the site's own machine-readable address listings and confirm
every address they contain currently resolves, and that the production domain used
throughout matches the domain that is actually live.

**Acceptance Scenarios**:

1. **Given** a visitor or crawler requests the site's address listings, **When** they are
   read, **Then** every address inside them belongs to the current production domain.
2. **Given** the production domain has changed, **When** any page is served, **Then** the
   address it advertises for itself matches the domain that is currently live.
3. **Given** a crawler follows any address published by the site, **When** it requests it,
   **Then** it resolves to a real page rather than a missing page.

### Edge Cases

- An item has **exactly one** image: no cycling, and no pause control, because a single
  image has nothing to cycle through.
- An item has **no** images: the item stays reachable, cycling and its controls are not
  rendered at all, and a clearly labelled placeholder is shown instead.
- An item has **more than five** images: only the configured maximum is cycled, and the
  remainder remain reachable manually, so an over-full set cannot break the layout.
- The visitor **reduces motion** at the operating-system level: no automatic cycling
  anywhere, and no decorative transitions, while every manual control still works.
- The visitor uses only a **keyboard**: cycling pauses as soon as focus enters the images,
  and never resumes while focus is inside them.
- The visitor **pauses manually and then hovers away**: it must stay paused. A resume on
  mouse-out would silently defeat the pause they just asked for.
- An item has an **extremely long title** or summary: the card holds its shape and the
  text shortens cleanly.
- A price contains a **very large number**: the figure stays aligned and does not wrap onto
  a second line.
- The **live domain differs from the one recorded in configuration**: any address the site
  publishes about itself must follow the domain that actually responds, not the stale one.
- **Business identity is still provisional**: the upgrade must not introduce any new
  hardcoded business name, and the placeholder identity must remain obviously
  provisional.

## Out of Scope and Deferred *(mandatory)*

- **DEFERRED**: Customer sign-in — Seam preserved: the customer record type and its link
  from enquiries both remain defined and unused, so enabling sign-in later is a settings
  and screens change rather than a data migration.
- **DEFERRED**: A database connection — Seam preserved: all catalogue content still
  resolves through one read module that currently serves provisional content and can be
  pointed at stored records without changing any screen. The owner-facing editing screens
  therefore remain non-functional in this release, exactly as before.
- **DEFERRED**: Order history for customers — Seam preserved: enquiries already record
  their items and delivery details, so history becomes possible once a visitor can be
  identified.
- **EXCLUDED**: Any change to searching, filtering, the basket, the delivery form, the
  checkout message, or the contact form. This release changes presentation only, and the
  existing behaviour must survive it unchanged.
- **EXCLUDED**: Online payment, customer accounts with passwords, and any change to what
  is stored about a visitor.
- **EXCLUDED**: A dark or alternate colour theme. The business owner has ruled this out.
- **EXCLUDED**: Automatic image resizing or compression improvements. Real imagery is
  supplied later by the owner and resized on upload.

### Unconfirmed Inputs

- **Business name and logo** - provisional: `YourBrand` and a monogram placeholder - the
  upgrade must not change this, and it remains obviously provisional.
- **Real product photography** - provisional: generated placeholder panels - awaiting: the
  business owner. The design must hold up when genuine photographs replace them, which is
  why layouts reserve a fixed shape for imagery rather than fitting to whatever arrives.
- **Final production domain** - provisional: `yourecommercestore.vercel.app` - confirmed
  live at the time of writing, but the site must derive its self-advertised addresses from
  whatever domain actually responds rather than from a stored value.
- **Exact catalogue mix** - provisional: a plausible spread of goods, software and services
  across the expanded category set - awaiting: the business owner's real stock and
  services.

## Requirements *(mandatory)*

### Functional Requirements

**Brand recognition and contact**

- **FR-001**: Every control or element offering WhatsApp contact MUST display the official
  WhatsApp brand mark.
- **FR-002**: The WhatsApp mark MUST NOT be redrawn, recoloured, or replaced by a
  lookalike, generic, or third-party messaging symbol.
- **FR-003**: WhatsApp controls MUST be visually distinguishable from other calls to
  action on the same screen without relying on the accompanying text.
- **FR-004**: Text and marks on WhatsApp controls MUST meet the recognised minimum
  contrast threshold for readable text.
- **FR-005**: A WhatsApp mark shown on its own, away from a control background, MUST be
  presented against a background that meets the same contrast threshold.
- **FR-006**: WhatsApp controls MUST remain operable by keyboard and MUST have a
  description available to assistive technology that conveys the action rather than the
  presence of a graphic.
- **FR-007**: Existing contact destinations MUST be unchanged by this release; only their
  presentation changes.

**Product presentation**

- **FR-008**: Each item in the catalogue MUST be presented as a card containing, in a
  consistent order: imagery, category, availability, name, summary, price or quote status,
  and an add-to-basket action.
- **FR-009**: Cards MUST render consistently at phone, tablet and desktop widths with no
  clipped, overlapping, or truncated-to-nothing content.
- **FR-010**: A card with unusually long text MUST keep a consistent height, shortening
  its text cleanly rather than allowing overflow.
- **FR-011**: An item requiring a quotation MUST show no price figure anywhere on its
  card or page.
- **FR-012**: Cards MUST provide a visible response when hovered, focused, or pressed.
- **FR-013**: An item MUST remain fully reachable from its card, and the add-to-basket
  action MUST remain separately operable without triggering navigation.
- **FR-014**: Minimum touch target sizes MUST be preserved across all card controls.

**Image cycling**

- **FR-015**: An item with three or more images MUST begin cycling those images
  automatically shortly after the page settles, without visitor action.
- **FR-016**: Automatic cycling MUST offer a visible control that stops it, and a way to
  resume it.
- **FR-017**: Automatic cycling MUST NOT begin, and MUST NOT resume, when the visitor's
  device has asked for reduced motion.
- **FR-018**: Automatic cycling MUST pause while the visitor's pointer is over the images
  or their keyboard focus is within them.
- **FR-019**: Once a visitor has paused cycling themselves, it MUST remain paused
  regardless of later pointer movement.
- **FR-020**: The current position within the image set MUST be available to assistive
  technology in words, and MUST NOT be conveyed by colour or shape alone.
- **FR-021**: An item with fewer than three images MUST NOT cycle, and MUST NOT display
  cycling controls.
- **FR-022**: An item with no images MUST remain reachable, MUST NOT display cycling
  controls, and MUST show a clearly labelled placeholder.
- **FR-023**: When an item has more images than the supported maximum, the excess images
  MUST remain reachable through manual controls.
- **FR-024**: The area occupied by item imagery MUST be reserved before images load, so
  that cycling does not cause visible layout movement.

**Readability**

- **FR-025**: Prices, quantities and other figures that appear in more than one place MUST
  be rendered so that figures align in columns and do not shift as their values change.
- **FR-026**: Heading levels MUST look consistent wherever they appear across the site, and
  body text MUST always be rendered in the same face.
- **FR-027**: Long headings MUST wrap without leaving an isolated short line, and body
  paragraphs of differing lengths MUST be separated consistently.
- **FR-028**: The existing font pairing MUST be retained. This release refines how it is
  applied and must not introduce a new typeface.

**Catalogue breadth**

- **FR-029**: The catalogue MUST contain at least twenty-four items spanning at least
  eight categories including sub-categories.
- **FR-030**: All three price presentations MUST remain represented in the catalogue, so
  the fixed, indicative and quote-only presentations all remain reviewable.
- **FR-031**: At least one item MUST have no imagery, so that state is reviewable.
- **FR-032**: Filtering by category, price and availability MUST continue to behave
  correctly across the expanded catalogue, including returning sub-category items when a
  parent category is selected.
- **FR-033**: Search MUST continue to match across item names, summaries and tags
  spanning multiple categories.
- **FR-034**: The article index MUST list at least eight published articles, each opening
  to a readable page, and unpublished articles MUST remain unreachable.

**Live address correctness**

- **FR-035**: Every address the site publishes about itself, including in machine-readable
  address listings and crawler directives, MUST belong to the production domain that
  currently responds.
- **FR-036**: No page served by the site MUST reference an address that no longer resolves.
- **FR-037**: Shared item and article addresses MUST remain stable across this release.

**Preserved behaviour**

- **FR-038**: Searching, filtering, the basket, quantity changes, the delivery form, the
  checkout message, and the contact form MUST behave exactly as they did before this
  release.
- **FR-039**: No visitor-supplied personal detail beyond what they already chose to send
  MUST be collected or stored by this release.
- **FR-040**: The provisional business identity MUST remain obviously provisional, and no
  new hardcoded business value may be introduced.

### Key Entities

- **Item**: Unchanged in meaning. This release changes only how it is presented and how
  many exist.
- **Category**: Unchanged in meaning. This release adds categories so the catalogue spans
  enough of them to be browsable.
- **Article**: Unchanged in meaning. This release adds more published articles.
- **Business Profile**: Unchanged in meaning. Still the single source of every business
  value, and still provisional.
- **Brand Mark**: The official WhatsApp symbol, now a first-class presentation element used
  consistently wherever contact is offered.
- **Image Set**: The ordered photographs belonging to an item, together with the state of
  whether they are cycling, paused by the visitor, or not cycling at all.
- **Production Domain**: The live address the site serves from and advertises, now derived
  from the address actually in use rather than a stored value.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every WhatsApp affordance across the whole site uses the official brand mark,
  verified by inspecting all pages with no generic or lookalike symbol remaining.
- **SC-002**: Every WhatsApp control and every standalone mark meets the recognised minimum
  contrast threshold for readable text, with measured ratios recorded and zero failures.
- **SC-003**: A visitor using assistive technology hears a meaningful description of each
  WhatsApp action, with no control announced merely as "image".
- **SC-004**: Item images begin cycling on their own within five seconds of an item page
  settling, for every item with three or more images.
- **SC-005**: A visitor can stop and resume automatic cycling using only controls visible
  on screen, and no visitor can be shown moving content they have asked to stop.
- **SC-006**: On a device set to reduce motion, zero automatic cycling occurs anywhere on
  the site, while all manual controls continue to work.
- **SC-007**: Once a visitor pauses cycling, it stays paused for the remainder of their
  visit regardless of pointer movement.
- **SC-008**: Across phone, tablet and desktop widths, zero cards show clipped,
  overlapping, or overflowing content.
- **SC-009**: Changing a quantity in the basket causes no horizontal shift in any adjacent
  figure or control.
- **SC-010**: The catalogue presents at least twenty-four items across at least eight
  categories, with every price presentation represented and at least one item with no
  imagery.
- **SC-011**: Filtering and search return correct results across the full expanded
  catalogue, verified against a sample of at least twenty filter and search combinations.
- **SC-012**: Every address published by the site's own address listings resolves to a real
  page, with zero references to any address that no longer responds.
- **SC-013**: Searching, filtering, the basket, the delivery form and the contact form
  behave identically before and after this release, verified by walking each flow end to
  end.
- **SC-014**: A visitor who requests reduced motion experiences no decorative transitions
  anywhere on the site.
- **SC-015**: Every interactive control introduced or restyled retains a touch target of at
  least 44 by 44 pixels and full keyboard operability, with visible focus throughout.

## Assumptions

- This release is presentational. No existing behaviour, message, or stored value changes.
- Real photography arrives later from the business owner, so layouts reserve a fixed shape
  for imagery rather than adapting to whatever is supplied.
- Placeholder imagery continues to be generated locally so the site demonstrates correctly
  with no network connection.
- The brand mark is used at the officially published shape and colour, and the surrounding
  control is styled to suit it rather than the mark being adapted to the site's palette.
- Business identity remains provisional throughout; this release does not attempt to
  confirm or replace it.
- The catalogue expansion is representative rather than the owner's actual stock, and is
  entirely deletable when real content is entered.
- The production domain is treated as environment-specific configuration, so the same
  build behaves correctly across preview and production addresses.
