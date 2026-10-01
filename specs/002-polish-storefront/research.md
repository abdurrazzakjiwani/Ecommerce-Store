# Phase 0 Research: Storefront Polish and Professional Upgrade

All external facts below were verified against a live source during this phase, not recalled
(Constitution Principle VI). Sources are named per decision.

## D1. The official WhatsApp mark, and why the current icon is wrong

**Decision.** Use the Simple Icons `whatsapp` glyph, `viewBox="0 0 24 24"`, brand green
`#25D366`, vendored as a local React component (`src/components/brand/WhatsAppIcon.tsx`).
Vendored rather than fetched at runtime so no third-party request sits on the critical path.

**Rationale.** Fetched live from the canonical source during Phase 0. Response was HTTP 200,
1231 bytes, `viewBox 0 0 24 24`, `fill="#25D366"`, with a 1104-character path.

The current icon is wrong on evidence, not preference. `lucide-react` carries **no** brand
icons: they were deprecated and lucide's own deprecation notice directs users to
simpleicons.org. `MessageCircle` is a generic speech bubble that happens to sit next to the
word "WhatsApp" — it is not the brand mark, which is why the client recognised something was
off.

**Alternatives considered.** `react-icons` SiWhatsApp (same Simple Icons source, adds a
dependency for one glyph — rejected). Font Awesome Brands (also a brand set, heavier, and its
WhatsApp glyph is the older pre-2023 handset form). An inline hand-drawn path (rejected: a
brand mark is not an approximation).

**Path data, verified verbatim:**

```
M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94
1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653
-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099
-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173
-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462
1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227
1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124
-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998
-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0
5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413
-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057
24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821
11.821 0 00-3.48-8.413Z
```

## D2. The brand conflict, resolved by measurement

**Decision.** The floating WhatsApp button and header CTA use **WhatsApp teal `#075E54` as the
background with white label text and the unmodified brand-green mark**. The standalone
floating mark uses brand green on a white circular field with a teal ring, because a bare
green glyph on cream cannot meet contrast.

**Rationale.** Meta's brand guidelines prohibit recolouring the mark, so `#25D366` must stay
`#25D366`. Measured this phase (WCAG 2.x relative-luminance formula, computed in-session, not
estimated):

| Treatment | Foreground | Background | Ratio | Verdict |
|---|---|---|---|---|
| brand green on cream | `#25D366` | `#FFFBEB` | **1.91** | FAIL |
| white on brand green | `#FFFFFF` | `#25D366` | **1.98** | FAIL |
| brand green on white | `#25D366` | `#FFFFFF` | **1.98** | FAIL |
| brand green on teal | `#25D366` | `#075E54` | **3.87** | PASS AA-large / UI |
| **white on teal** | `#FFFFFF` | `#075E54` | **7.67** | **PASS AA-normal** |
| near-black on brand green | `#1C1917` | `#25D366` | 8.82 | PASS AA-normal |
| near-black on cream (body text) | `#1C1917` | `#FFFBEB` | 16.86 | PASS AA-normal |

This is why the specification refused to name a colour. The two treatments a person reaches
for first — a loose green icon on cream, or a light-green button — measure **1.91** and
**1.98** and both fail. Teal `#075E54` is WhatsApp's own deep green from the brand palette,
keeps the mark unmodified at 3.87, and carries white label text at 7.67.

**Where the mark appears, and what each site requires:**

| Placement | Background | Mark ratio | Label ratio |
|---|---|---|---|
| Button with visible label | teal `#075E54` | 3.87 (UI, needs ≥3) | 7.67 (needs ≥4.5) |
| Standalone floating mark | white field + teal ring | 3.87 equivalent via ring | n/a — non-text |
| Icon next to dark ink text | cream `#FFFBEB` | 1.91 **fails** | — |

**Consequence, and it is a real design constraint:** the mark may **not** sit directly on the
cream surface. Every placement pairs it with white or teal. Recorded as FR-005.

**Alternatives considered.** Near-black mark on brand green (8.82) — rejected: a black WhatsApp
icon reads as a different brand and fights the cream palette. Darkening brand green to reach
4.5 on cream — rejected: it recolours the mark, which the guidelines forbid. White glyph on
brand green (1.98) — rejected on measurement.

**Token placement.** Teal lands in `globals.css` beside the existing tokens, named
`--color-whatsapp` and `--color-whatsapp-deep`, so the frozen accent `#B45309` at 4.91:1 and
its rejected neighbour `#D97706` are untouched (Constitution, Design tokens are frozen).

## D3. Autoplay plugin — version lock and the sticky-pause trap

**Decision.** `embla-carousel-autoplay@8.6.0`, pinned exactly. Pass
`playOnInit: false` and drive `play()` explicitly, with our own
`stopOnInteraction`/`stopOnMouseEnter`/`stopOnFocusIn` configuration.

**Rationale.** Verified against the npm registry this phase:
`embla-carousel-autoplay@8.6.0`, licence **MIT**, `peerDependencies: { embla-carousel: "8.6.0" }`,
`dist-tags.latest: 8.6.0`. The peer dependency is an **exact** version, not a range, so a
mismatched `embla-carousel` would be a peer warning at best and a runtime break at worst.
Pinning to the installed `embla-carousel-react@8.6.0` is not a style preference; it is the
package's own constraint. No licence cost, matching the existing carousel.

**The trap, and why it dictates the configuration.** Plugin defaults are `playOnInit: true`,
`stopOnInteraction: true`, `stopOnFocusIn: true`, `stopOnMouseEnter: false`. Read naively,
`stopOnInteraction: false` plus `stopOnMouseEnter: true` appears to give exactly FR-018 and
FR-019 — pause on hover, resume on leave. But per the plugin's own documented behaviour,
mouse-enter resume happens **only** when `stopOnInteraction` is `false`, and in that
configuration the plugin restarts itself after *every* interaction. So a visitor who drags the
carousel, or clicks a thumbnail, gets it started again behind their back.

**FR-019 — a manual pause is sticky — cannot be delegated to the plugin.** It requires local
state that survives hover, focus, and re-render. The implementation therefore:

- tracks a `userPaused` flag in component state, independent of the plugin;
- calls `plugins().autoplay.stop()` on the visitor's pause action and sets `userPaused = true`;
- never calls `play()` again while `userPaused` is true, regardless of pointer or focus;
- resets `userPaused` only on an explicit resume action.

`playOnInit: false` also lets the reduced-motion check run *before* the first tick, so
FR-017 ("MUST NOT begin") is satisfied literally rather than cancelled milliseconds later.

Verified API surface: `Autoplay({ delay, jump, playOnInit, stopOnInteraction, stopOnMouseEnter,
stopOnFocusIn, stopOnLastSnap, rootNode })`; instance methods are exactly **`play(jump?)`** and
**`stop()`** — there is no `isPlaying()`. The control's pressed state must therefore come from
our own state, not be read back from the plugin.

**Delay.** 5000ms, against SC-004's five-second ceiling. The plugin default of 4000ms is
inside the limit but leaves no margin, and 5000ms is calmer for product photography.

**Alternatives considered.** CSS-only keyframe rotation (rejected: no pause semantics, no
`prefers-reduced-motion` integration, breaks swipe). `setInterval` + transform (rejected:
reimplements Embla, loses touch physics, two sources of truth for slide position). Embla's
`fade` plugin (accepted as optional polish, not required).

## D4. Card images must not auto-advance — enforced structurally

**Decision.** `ProductGallery` gains an explicit `autoPlay` prop. `ProductCard` passes
`autoPlay={false}`; only the item detail page passes `true`.

**Rationale.** The clarification session settled this, and the code shape is what keeps it
true. A future contributor adding a carousel to a card would have to opt in rather than
inherit motion, because the default is off. FR-015's card prohibition becomes a type-level
constraint instead of a review comment.

This is also the performance defence. The catalogue reaches ~24 items; a page of results with
24 live autoplay instances would mean 24 timers, 24 `aria-live` position announcements, and 24
pause controls to stay WCAG 2.2.2 compliant. Only the item page mounts an autoplaying instance.

## D5. The stale production domain — root cause identified

**Decision.** Set `NEXT_PUBLIC_SERVER_URL=https://yourecommercestore.vercel.app` in the Vercel
project environment, and add a build-time assertion that the production build is not emitting a
`vercel.app` address other than the configured one.

**Rationale.** Root cause is not a hardcoded string. Both files read the same variable and
correctly default to localhost:

```text
sitemap.ts:7  const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000')...
robots.ts:4   const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000')...
```

The variable is simply **not set in the Vercel project**, so both fall back to localhost, and
the deployed site advertises an address that is not itself. The old domain
`ecommerce-storefront-phi.vercel.app` now returns 404, so search engines are being pointed at a
missing page. FR-035 to FR-037 and SC-012 address it; this is the mechanism.

**Verification.** After redeploy, `curl` both `robots.txt` and `sitemap.xml` and assert the only
host present is `yourecommercestore.vercel.app`. A green build is not evidence — the build
passes today while emitting the wrong URLs.

## D6. Deployment target and protection

**Decision.** Deploy the existing `ecommerce-storefront` project; treat
`yourecommercestore.vercel.app` as a production alias to verify, not a separate project.

**Rationale.** The CLI lists 22 projects, none named `yourecommercestore`, and the domain
serves this app correctly (verified 200, correct title, WhatsApp number present, all routes
200, no login wall). So the new hostname is an alias on `ecommerce-storefront`.

One unresolved risk, recorded rather than assumed: some recent deployment URLs returned a
Vercel login wall. `vercel.json` already pins `"framework": "nextjs"`, which fixed an earlier
mis-detection where the project served `public/` and produced 404s — that file is
load-bearing and stays. After deploy, the **production alias** must be checked specifically,
since a preview-scoped protection setting would not surface on the alias.

## D7. Catalogue expansion through the existing seam

**Decision.** Expand `src/lib/fixtures/data.ts` to ~24 products and 8 articles. No schema
change, no `catalog.ts` widening.

**Rationale.** The seam is what let a 137-task prototype ship with no database. Principle III
keeps deferred items as UI tasks; touching the schema to add placeholder content would
reopen a settled question for no benefit. Categories stay at 8 (3 top-level, 5 sub) and are
reused, so the expansion is breadth within the existing taxonomy, not a new taxonomy.

The exact mix is listed in `spec.md` under *Unconfirmed Inputs* as awaiting the business
owner's real stock. Placeholder content stays self-evidently provisional per SC-010, and
includes one imageless item because FR-031 requires that state to be demonstrable — the
current catalogue has none.

## Consolidated Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Plugin restarts after drag, defeating sticky pause | FR-019 silently fails | Own `userPaused` state; never call `play()` while set (D3) |
| `embla-carousel` peer version drift | Build warning or runtime break | Pin autoplay to 8.6.0 exactly; verify peer on install (D3) |
| Green mark placed on cream | 1.91:1, fails AA | All placements pair with white or teal; token contract in D2 |
| 24 card carousels mount and animate | CLS and INP budget breach | `autoPlay={false}` on cards, default off (D4) |
| Env var unset, localhost URLs deployed | Search engines sent to a dead address | Set in Vercel; assert on built output (D5) |
| Preview login wall mistaken for success | False green on deploy | Check the production alias, not the preview URL (D6) |
| Catalogue content read as real | Client trust damage | Provisional placeholders, obviously temporary (D7) |

## Resolved Clarifications

No `NEEDS CLARIFICATION` markers remain in `plan.md`. Every technical unknown from the
specification was either answered by a user decision in the clarification session (four
recorded) or resolved here by measurement or vendor verification: the brand colour (D2, by
computation), the cycling mechanism (D3, by registry and docs), the domain mechanism (D5, by
reading the source), and the deployment target (D6, by inspecting the project list).
