# Feature Specification: WhatsApp Service Storefront

**Feature Branch**: `001-whatsapp-storefront`
**Created**: 2026-10-01
**Status**: Draft
**Input**: Client brief for a single-page service storefront: catalogue with categories and sub-categories, product cards showing 3-5 scrollable images, product detail pages, filters, search, delivery details, contact form with email notification to the business, WhatsApp as the ordering channel, blog and about pages, and a self-service admin so the business owner can upload his own imagery. Online payment and customer login are excluded from this release.

## User Scenarios & Testing *(mandatory)*

Two parties are served by this feature: the **visitor** browsing and enquiring, and
the **business owner** publishing content without developer involvement. Stories for
both are included because the owner's self-sufficiency is a stated requirement, not
an implementation detail.

### User Story 1 - Browse and find an item in the catalogue (Priority: P1)

A visitor lands on the homepage and wants to see what the business sells. They scroll
through the page, view categories, and narrow the list using filters for category,
price and availability. They type a word into search and see only matching items. Each
item appears as a card showing several of its images that the visitor can scroll
through.

**Why this priority**: A catalogue with no way to browse or narrow it delivers no
value. Every other journey depends on items already being published and findable, so
this story must work first.

**Independent Test**: Load the homepage with a seeded catalogue, apply each filter,
run a search, and scroll a card's images. Delivers a browsable, filterable catalogue.

**Acceptance Scenarios**:

1. **Given** items exist across several categories, **When** the visitor views the
   homepage, **Then** every category is shown and a representative selection of items
   is visible without requiring search.
2. **Given** items exist across several categories, **When** the visitor selects one
   category, **Then** only items in that category, or its sub-categories, are shown.
3. **Given** an item has four images, **When** the visitor swipes or uses the controls
   on its card, **Then** the card advances through all four and the current position
   is indicated.
4. **Given** items exist, **When** the visitor types part of an item's name or tags,
   **Then** only matching items are shown and the result count updates as they type.
5. **Given** a search matches nothing, **When** the visitor searches, **Then** a clear
   no-results message appears with a way to clear the search.

---

### User Story 2 - Owner publishes an item with its own imagery (Priority: P1)

The business owner signs in to his admin area and adds a new item. He types the name,
writes a description, assigns a category, sets the price, and uploads three to five
photographs. He arranges them in the order he wants them seen. When he saves, the item
appears on the live site immediately. Later he corrects a typo or swaps a photograph
without asking a developer.

**Why this priority**: The client named self-service image upload as his central
reason for wanting this built. Without it he would have to pay for every product
change for the life of the site.

**Independent Test**: As the owner, create one item with four images, edit its title,
replace one image, reorder the images, then delete a test item. Every change appears
on the public site without a developer or a redeployment.

**Acceptance Scenarios**:

1. **Given** a signed-in owner, **When** they upload several photographs and save an
   item, **Then** each image appears on the item card and detail page in the order
   chosen.
2. **Given** a published item, **When** the owner changes its title or price, **Then**
   the change is visible to visitors on the next page load without a redeployment.
3. **Given** an item's photograph has been replaced, **When** the owner publishes, **Then**
   visitors see the new photograph and the old one is no longer served.
4. **Given** an owner uploads a file that is not an image, **When** they attempt to
   save, **Then** the upload is refused with a clear message and nothing is saved.
5. **Given** an image has no alternative text, **When** the owner tries to save, **Then**
   they are asked to supply it, because it is required.

---

### User Story 3 - Ask about one item on WhatsApp (Priority: P1)

A visitor is on an item's detail page and wants to ask a question before committing.
They press the enquiry button and a WhatsApp conversation opens with the business's
number and the item's name already in the message, so the business can see what they
are asking about.

**Why this priority**: Contacting the business is the entire commercial outcome of the
site. It must work from an individual item, not only from a cart.

**Independent Test**: From one item's detail page, press the enquiry button and confirm
a WhatsApp chat opens addressed to the business number with the item identified.

**Acceptance Scenarios**:

1. **Given** a visitor on an item page, **When** they press the enquiry button, **Then**
   a WhatsApp conversation opens with the business's number and a message naming that
   item.
2. **Given** any page of the site, **When** the visitor uses the persistent support
   control, **Then** a WhatsApp conversation opens with the business's number.
3. **Given** the message includes spaces and punctuation, **When** the conversation
   opens, **Then** the full message is present and readable rather than truncated.

---

### User Story 4 - Build an order of several items and send it (Priority: P2)

A visitor wants more than one thing. They add several items to a basket, review the
list with quantities, and are asked where the goods should go. They supply a delivery
address anywhere in Pakistan, then press the checkout control. A WhatsApp conversation
opens containing the full itemised order with quantities, prices and the delivery
address, ready to send.

**Why this priority**: Converts single-item interest into a real, actionable enquiry.
Deliberately below the single-item path because it depends on that working first.

**Independent Test**: Add three items to the basket, set a quantity on one, supply a
Pakistani delivery address, press checkout, and confirm the conversation contains all
three lines, quantities, the subtotal, and the address.

**Acceptance Scenarios**:

1. **Given** items have been added, **When** the visitor opens the basket, **Then**
   each item shows its image, name, quantity and line price, and the subtotal is shown.
2. **Given** an item's quantity is increased, **When** the basket is reviewed, **Then**
   the line total and the subtotal both update.
3. **Given** the basket contains an item that has no fixed price, **When** the subtotal
   is shown, **Then** that item is identified as a quote request and the subtotal
   covers only the priced items.
4. **Given** a delivery address is supplied, **When** checkout is pressed, **Then** the
   message names the recipient, contact number, full address, city, province and
   postal code.
5. **Given** the visitor returns to the site later on the same device, **When** they
   start another order, **Then** the address they previously supplied is offered again
   for one-tap reuse.
6. **Given** an order is sent, **When** the business owner opens his admin area, **Then**
   that enquiry appears in his list of enquiries even if WhatsApp is later cleared.

---

### User Story 5 - Owner updates business identity and contact details (Priority: P2)

The business owner changes his business name, uploads his real logo, corrects his phone
number, and updates the address and social links. Every page on the site reflects the
new details immediately. He does not contact a developer to make these changes.

**Why this priority**: The business name and logo are not yet known, so this must be
settled before launch. Keeping it owner-controlled prevents the details being
hardcoded and needing a rebuild whenever they change.

**Independent Test**: Change the business name, logo and contact number in the admin
area, then confirm the new values appear in the header, footer, contact page and
WhatsApp conversations site-wide.

**Acceptance Scenarios**:

1. **Given** a business name is changed, **When** any page loads, **Then** the new name
   is shown everywhere the name appears.
2. **Given** a new logo is uploaded, **When** the site header loads, **Then** the new
   logo is shown without a redeployment.
3. **Given** the WhatsApp number is changed, **When** any WhatsApp control is pressed,
 **Then** the conversation is addressed to the new number.
4. **Given** the notification email address is changed, **When** a contact enquiry is
   submitted, **Then** the notification is sent to the new address.

---

### User Story 6 - Send an enquiry form and confirm it by email (Priority: P2)

A visitor has a question that does not relate to one item. They fill in the contact
form with their name, email, phone and message. They are told it has been received. The
business owner receives an email containing everything the visitor typed, and can also
find the enquiry later in his admin area.

**Why this priority**: A general enquiry route catches demand the catalogue cannot
express, and it is the owner's inbox-based workflow for follow-up.

**Independent Test**: Submit the contact form with a valid Pakistan phone number and
email, confirm the success state appears, confirm the enquiry is listed in the admin
area, and confirm an email containing every submitted field arrives at the owner's
notification address.

**Acceptance Scenarios**:

1. **Given** all required fields are valid, **When** the visitor submits, **Then** they
   see a confirmation that does not reveal where their data goes.
2. **Given** a required field is empty or an email address is malformed, **When** the
   visitor submits, **Then** the form does not send and the affected field explains
   what is wrong.
3. **Given** an enquiry is submitted, **When** the owner receives email, **Then** the
   message contains the visitor's name, email, phone, subject and full message, and
   replying to it reaches the visitor.
4. **Given** email delivery fails for any reason, **When** the visitor's enquiry is
   stored, **Then** the enquiry is still present in the owner's admin area.
5. **Given** an automated junk submission arrives, **When** it is filtered, **Then** no
   notification email is sent for it.

---

### User Story 7 - Read supporting content (Priority: P3)

A visitor reads an article from the blog, or reads about the business and how to reach
it. The business owner publishes and edits these himself.

**Why this priority**: Useful for credibility and search visibility, but no revenue
depends on it, and the core journeys are complete without it.

**Independent Test**: Publish a blog post with a photograph, confirm it appears in the
blog list and on its own page, then edit it and confirm the change is visible. Confirm
the about and contact pages render the owner's entered content.

**Acceptance Scenarios**:

1. **Given** published posts exist, **When** a visitor opens the blog, **Then** they see
   a list with each post's title, summary and photograph.
2. **Given** a published post, **When** a visitor opens it, **Then** the full text,
   its photograph and its publication date are shown.
3. **Given** an unpublished post, **When** a visitor lists or opens it, **Then** it is
   not reachable.
4. **Given** the owner edits a post, **When** visitors next load it, **Then** the edited
   content is shown.

### Edge Cases

- A visitor arrives with an empty basket: the basket control explains it is empty and
  offers a route back to the catalogue, rather than presenting a zero-value checkout.
- A visitor deletes the last item from the basket: the basket closes or shows the empty
  state cleanly, and no WhatsApp conversation is offered.
- A basket contains only quote-request items: no subtotal is claimed, and the message
  asks for a quotation instead of implying a price.
- A visitor supplies a postal code that is not five digits, or a phone number that is
  not a valid Pakistan mobile number: the field explains the expected format.
- A visitor's province is one of the seven administrative regions of Pakistan: it is
  offered in the list, including the northern territories and the federal capital area.
- An owner uploads a very large image: it is resized into the sizes the site needs, and
  oversized or wrong-format files are refused with a clear message.
- An owner deletes a category that still has items in it: the items must remain
  reachable, and the affected items must be reported to the owner.
- An owner publishes an item with no images: the item must still be reachable and must
  be visually distinguishable from an item with images, rather than rendering broken.
- Several automated submissions arrive rapidly: they must be rejected without sending
  notification email, and must not block a genuine visitor submitting at the same time.
- A visitor's device has previously stored an address that is now out of date: the saved
  value is offered for reuse but remains fully editable before sending.
- WhatsApp is not installed on the visitor's device: the site provides a fallback route
  to reach the business rather than failing silently.
- The site's own support control is present on every page, including the longest
  scrolling page and every detail page.

## Out of Scope and Deferred *(mandatory)*

- **DEFERRED**: Customer sign-in with Google - Seam preserved: a dedicated customer
  record type is defined and each enquiry can be linked to a customer, so enabling
  sign-in later requires no change to existing records. Enabling it would additionally
  require the business owner to obtain Google credentials and publish a privacy policy.
- **DEFERRED**: A customer-facing order history page - Seam preserved: enquiries are
  already stored with their items and delivery details. A history page becomes possible
  once a visitor can be identified. In the meantime the customer's own record is the
  WhatsApp conversation.
- **DEFERRED**: A dark or alternate colour theme - Seam preserved: every colour on the site
  is decided in one place, so an alternate appearance is a single change rather than a
  rebuild of every page. The business owner explicitly required a light cream appearance
  and ruled out a dark theme.
- **EXCLUDED**: Online payment, card handling, deposits and refunds - explicitly declined
  by the business owner. Every purchase completes as a conversation. Adding payment
  later would need a new specification and a formal decision record.
- **EXCLUDED**: Customer accounts with passwords - visitors are never asked to create a
  credential in this release.
- **EXCLUDED**: Online quoting, invoicing and payment tracking - pricing shown on the
  site is indicative and is confirmed in conversation.
- **EXCLUDED**: Multiple currencies and other languages, including Urdu - the business
  operates in Pakistan and prices in local currency.
- **EXCLUDED**: Live chat agents, live stock counts and stock reservation - enquiry is
  the mechanism, not a queue.
- **EXCLUDED**: Discount codes, coupons, gift wrapping and loyalty schemes.
- **EXCLUDED**: Customer reviews and ratings - no moderation process has been agreed.

### Unconfirmed Inputs

- **Business name** - provisional: `YourBrand`, chosen deliberately so it cannot
  plausibly reach a customer by mistake - awaiting: the business owner.
- **Logo and brand artwork** - provisional: a neutral placeholder mark - awaiting: the
  business owner. The name was deliberately not inferred from the notification email
  address, since that would present a guess as a confirmed fact.
- **Catalogue contents** - provisional: representative sample items covering physical
  goods, software and services - awaiting: the business owner. Prices are modelled to
  accommodate fixed, starting-from and quote-only items so any of the three can be
  imported without a change.
- **Notification email address** - provisional: `co.auraztech@gmail.com`, confirmed by
  the user - awaiting: confirmation this should remain the permanent notification inbox.
- **Support telephone number** - provisional: not yet supplied, shown as unavailable
  rather than displaying an invented number - awaiting: the business owner.
- **Business address and social links** - provisional: not yet supplied - awaiting: the
  business owner.
- **Delivery timeframe and charges** - provisional: described in general terms, editable
  by the owner - awaiting: the business owner's actual terms.

## Requirements *(mandatory)*

### Functional Requirements

**Catalogue and discovery**

- **FR-001**: The system MUST present all published items on the homepage organised by
  category, without requiring the visitor to search.
- **FR-002**: Categories MUST nest to at least two levels, and selecting a parent
  category MUST include items in its sub-categories.
- **FR-003**: Visitors MUST be able to narrow the catalogue by category, price range and
  availability, and MUST be able to clear all narrowing at once.
- **FR-004**: Visitors MUST be able to search item names, summaries and tags, and the
  result list MUST update as they type.
- **FR-005**: Each item MUST display between three and five images that the visitor can
  advance through, with the current position indicated.
- **FR-006**: When a search or filter combination matches nothing, the system MUST show a
  clear empty state that explains how to continue.

**Item detail**

- **FR-007**: Every item MUST have its own permanently addressable page showing its full
  description, all images, its category, its price or quote status, and any specifications.
- **FR-008**: Items MUST support three pricing presentations: a fixed price, a starting
  price indicated as "from", and no price indicated as a quote request.
- **FR-009**: Item pages MUST recommend related items.
- **FR-010**: Item pages MUST identify the item in the language search engines and social
  platforms expect, so shared links render a meaningful preview.

**Contact and enquiry**

- **FR-011**: Every enquiry control MUST open a conversation with the business's
  WhatsApp number, with a message already prepared and left editable by the visitor.
- **FR-012**: The business's WhatsApp number MUST be a single value the owner can change,
  and every enquiry control MUST use the current value.
- **FR-013**: Messages sent to the business MUST always contain correctly readable text,
  including spaces and punctuation, regardless of what the item names contain.
- **FR-014**: Visitors MUST be able to add items to a basket, set quantities, remove
  items, and see a running subtotal.
- **FR-015**: Basket contents MUST survive the visitor closing and reopening the site.
- **FR-016**: When a basket contains quote-request items, the system MUST NOT present a
  total as if the order were final, and MUST state which items need a quotation.
- **FR-017**: Before checkout the system MUST capture a delivery recipient name, contact
  number, address, city, province and postal code.
- **FR-018**: Provinces MUST be limited to the administrative regions of Pakistan.
- **FR-019**: Postal codes MUST be validated as five digits, and contact numbers as
  valid Pakistan mobile numbers, with the expected format explained on rejection.
- **FR-020**: A delivery address the visitor has supplied before MUST be offered again for
  reuse on their device, and MUST remain editable until the enquiry is sent.
- **FR-021**: The system MUST disclose that a remembered address is stored on the
  visitor's own device and is not transmitted to the business's records.
- **FR-022**: Every enquiry sent MUST also be recorded so the owner retains it
  independently of whether the conversation is later cleared or searched.
- **FR-023**: The enquiry record MUST capture the items, quantities, prices or quote
  status, the delivery details and any note, at the moment of sending.

**Owner self-service**

- **FR-024**: The owner MUST be able to create, edit, reorder, feature and delete items
  without developer involvement.
- **FR-025**: The owner MUST be able to upload several images per item, order them, and
  replace or remove any of them.
- **FR-026**: The system MUST generate appropriately sized versions of uploaded images so
  visitors receive images suited to their device.
- **FR-027**: The system MUST refuse non-image files, files above the size ceiling, and
  images submitted without alternative text, each with a message explaining the refusal.
- **FR-028**: The owner MUST be able to manage categories, sub-categories and their order
  of appearance.
- **FR-029**: The owner MUST be able to change the business name, logo, contact details,
  WhatsApp number, notification email address and social links in one place, and every
  change MUST be reflected site-wide without a redeployment.
- **FR-030**: The owner MUST be able to publish and edit blog posts, about content and
  contact page content.
- **FR-031**: Unpublished content MUST NOT be reachable by visitors.
- **FR-032**: Deleting a category that still contains items MUST NOT make those items
  unreachable, and MUST report the affected items to the owner.
- **FR-033**: Every enquiry received MUST be listed in the owner's area with the details
  submitted, and MUST be markable as read.
- **FR-034**: Only the owner MUST be able to reach owner-only areas; visitors MUST NOT be
  able to read, create or change any content, enquiry or setting.

**Contact form**

- **FR-035**: Visitors MUST be able to send an enquiry containing their name, email
  address, contact number, subject and message.
- **FR-036**: The system MUST validate required fields and the email address format
  before sending, and MUST explain any problem on the affected field.
- **FR-037**: On successful submission the visitor MUST see a confirmation that does not
  reveal where their details are stored.
- **FR-038**: The owner MUST receive an email notification containing every field the
  visitor submitted, the page the enquiry came from, and the time, with the visitor's
  address set so a direct reply reaches them.
- **FR-039**: The notification destination MUST be a single value the owner can change.
- **FR-040**: Every submission MUST be retained in the owner's area independently of
  whether notification email is delivered.
- **FR-041**: The system MUST reject automated submissions using techniques that do not
  burden a genuine visitor, and MUST NOT send notification email for a rejected
  submission.
- **FR-042**: Automated-submission defences MUST NOT prevent a genuine visitor from
  submitting within a normal reading and typing timeframe.

**Presentation and reachability**

- **FR-043**: All pages MUST be usable on a phone screen 375 pixels wide with no
  horizontal scrolling.
- **FR-044**: All pages MUST be usable at 768, 1024 and 1440 pixel widths.
- **FR-045**: All text and meaningful graphics MUST meet the WCAG 2.1 AA contrast
  thresholds.
- **FR-046**: All functionality MUST be reachable and operable by keyboard alone, with a
  visibly indicated focus position at all times.
- **FR-047**: Interactive controls MUST offer a touch target of at least 44 by 44 pixels.
- **FR-048**: When a visitor has asked their device to reduce motion, non-essential
  animation MUST be omitted and content MUST appear immediately.
- **FR-049**: Each page MUST NOT display more than one ambiguous primary action.
- **FR-050**: Every page MUST include the support control and a way to reach the blog and
  about content.
- **FR-051**: The business owner's name, logo, telephone number, email address, address
  and social links MUST appear where visitors expect them.
- **FR-052**: No credential, key or account detail MUST appear anywhere a visitor can
  read.
- **FR-053**: The site MUST NOT collect or store any personal detail about a visitor
  beyond the enquiries they choose to send.

### Key Entities

- **Item**: Something the business offers. Carries a name, description, category,
  pricing presentation, availability, and between three and five ordered images. May
  carry named specifications. May recommend other items.
- **Category**: A grouping of items. May sit under another category, allowing
  sub-categories to any depth the owner finds useful.
- **Image**: A single photograph belonging to an item, carrying required alternative
  text and an explicit display order, available in several sizes.
- **Basket**: A visitor's temporary selection of items with quantities, held on their own
  device until an enquiry is sent. Not a confirmed order and not held by the business.
- **Enquiry**: A conversation started by a visitor. Captures the recipient, contact
  number, delivery details, the items requested with quantities and prices or quote
  status, any note, and the time. This is the business's permanent record.
- **Contact Message**: A general enquiry sent through the contact form, captured with the
  visitor's details, subject, message, originating page and time.
- **Business Profile**: The single set of business identity values - name, logo, contact
  details, WhatsApp number, notification email and social links - that applies site-wide.
- **Blog Post**: A dated, publishable article with a summary, body and optional image.
- **Saved Delivery Address**: A delivery address stored on a visitor's own device for
  reuse, never transmitted to the business's records.
- **Owner**: The single business user permitted to publish content and read enquiries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor who knows an item's name can find it within 30 seconds of
  arriving, without assistance.
- **SC-002**: A visitor can open a conversation with the business about a specific item
  in no more than two interactions from that item's page.
- **SC-003**: A visitor can assemble a basket of at least three items and send a
  complete enquiry, including delivery details, in under three minutes.
- **SC-004**: At least 95% of visitors who attempt to contact the business succeed on
  their first attempt, measured by enquiries recorded against visits to item pages.
- **SC-005**: The business owner can publish a complete new item, including at least
  three images, in under five minutes without developer involvement, and can verify the
  result on the live site himself.
- **SC-006**: The business owner can change the business name, logo, contact number and
  notification email address in a single session, and see every change reflected across
  the site without any further action.
- **SC-007**: Every enquiry shown to the owner includes the items, quantities and
  delivery details exactly as the visitor entered them, verified by direct comparison
  on a sample of at least 20 enquiries.
- **SC-008**: Every enquiry recorded in the owner's area survives clearing all browser
  data and clearing the WhatsApp conversation, verified on a sample of at least 10
  enquiries.
- **SC-009**: Every contact form submission is either recorded for the owner or visibly
  refused with an explanation; no submission disappears silently. Verified across at
  least 30 submissions including invalid input.
- **SC-010**: With 100 published items, applying any filter or running a search updates
  what the visitor sees within one second on an ordinary mobile connection.
- **SC-011**: No page shows a visible message that only appears when the business has not
  yet supplied details; such information is either present or omitted from the layout.
- **SC-012**: Every page can be completed using only a keyboard, and every focus position
  is visible. Verified by manual keyboard-only traversal of the main journeys.
- **SC-013**: No horizontal scrolling occurs at 375, 768, 1024 or 1440 pixel widths on
  any page.
- **SC-014**: All text meets WCAG 2.1 AA contrast, verified by automated check across all
  pages with failures corrected to zero.
- **SC-015**: Every page carries a unique title and description, every item page carries
  a valid product description for search engines, and a site map covers all public pages.
- **SC-016**: A visitor with reduced-motion enabled experiences no non-essential
  animation on any page.
- **SC-017**: No item becomes unreachable as a consequence of owner housekeeping, across
  a full pass of editing, reordering and deleting categories and items.

## Assumptions

- Prices are in Pakistani Rupees and are whole numbers.
- The business operates nationwide in Pakistan, so no international country selection is
  needed and the delivery province list is fixed.
- A visitor who wants to buy completes the transaction in conversation; the site
  establishes interest and captures the request, and does not confirm payment.
- A quote-request item has no usable price at checkout, so its value is negotiated in
  conversation.
- The WhatsApp number is a single number used for all enquiries and is active.
- The owner's notification inbox is a single address that he alone monitors.
- Catalogue size remains below roughly one hundred items initially; if it grows well
  beyond that, searching and filtering need to move from the visitor's device to the
  business's records.
- The site is in English.
- The owner expects to work on a desktop or tablet when publishing, and primarily views
  the public site on a phone.
- Where the owner has not supplied business details, the site shows the item as
  unavailable rather than inventing a value.

## Dependencies

- Availability of an email delivery service that sends from the business's own domain, so
  notifications are not treated as spam.
- Availability of durable remote file storage, so uploaded images survive a site
  redeployment. Storing images on the site's own transient disk is not acceptable.
- Availability of a hosted data store the business owner does not have to maintain, so
  content and enquiries persist.
- Availability of a hosting platform able to run the site as an application, which rules
  out plain static hosting and ordinary shared hosting.