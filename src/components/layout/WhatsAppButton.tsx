'use client'

import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { buildWaLink } from '@/lib/whatsapp'
import { useSiteSettings } from './SiteSettingsProvider'

/**
 * Persistent support control, present on every page.
 *
 * Presentational only: it links to WhatsApp and never sends anything itself. The link
 * is built by `lib/whatsapp`, which this release leaves byte-for-byte unchanged
 * (FR-038) - only the presentation of the control is new.
 *
 * COLOUR, AND WHY IT IS NOT BRAND GREEN
 * -------------------------------------
 * The mark is the official WhatsApp glyph and is not recoloured: Meta's brand
 * guidelines forbid it. The obvious treatments both fail, measured:
 *
 *   brand green background, white text    1.98:1   FAILS
 *   brand green mark on the cream page    1.91:1   FAILS
 *
 * So the background is WhatsApp's own deep teal (#075E54), which is a legitimate
 * brand value and not a modification of the mark. Against it the unmodified
 * brand-green mark measures 3.87:1 (passes the 3:1 UI threshold) and the white label
 * measures 7.67:1 (passes AA for normal text). The numbers are asserted in
 * `src/tests/contrast.test.ts` and the reasoning is recorded in research.md D2.
 *
 * This also satisfies US1 scenario 2: the control is a saturated teal rather than the
 * site's neutral `--color-primary`, so it is distinguishable at a glance from any
 * ordinary button without reading the label.
 */
export function WhatsAppButton({ label = 'Chat with us' }: { label?: string }) {
  const settings = useSiteSettings()
  const href = buildWaLink(settings.whatsappNumber, `Hello ${settings.businessName}, I have a question.`)

  return (
    <div className="support-dock">
      <a
        className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-whatsapp-deep px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-200 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {/* Decorative: the label beside it already names the action, so a title here
            would make a screen reader announce "WhatsApp" twice (US1 scenario 4). */}
        <WhatsAppIcon size={20} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">{label}</span>
      </a>
    </div>
  )
}
