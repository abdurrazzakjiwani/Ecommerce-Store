'use client'

import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { buildWaLink } from '@/lib/whatsapp'
import { useSiteSettings } from './SiteSettingsProvider'

/**
 * Standalone floating WhatsApp mark, present on every page.
 *
 * WHY THIS NEEDS A WHITE FIELD (FR-005)
 * --------------------------------------
 * The official mark is brand green and cannot be recoloured - Meta's brand guidelines
 * forbid it, which is also why the obvious fix of darkening it until it passes is not
 * available. Measured against the cream page background `#FFFBEB`, brand green reaches
 * only **1.91:1** and fails.
 *
 * So a bare green glyph floating directly on the cream page is not acceptable at any
 * size. Pairing it with a white circular field and a teal ring gives the mark a
 * controlled backdrop instead of relying on whatever is behind it, and the mark then
 * measures comfortably against white. The ring keeps the control recognisable as a
 * brand action rather than a generic floating button.
 *
 * This is a separate control from `WhatsAppButton`, which carries a text label. The
 * distinction matters for accessibility: a label-less control must expose its action
 * through an accessible name, which is why the `sr-only` span below is not optional.
 *
 * The link is built by `lib/whatsapp`, unchanged by this release (FR-038).
 */
export function WhatsAppFab() {
  const settings = useSiteSettings()
  const href = buildWaLink(settings.whatsappNumber, `Hello ${settings.businessName}, I have a question.`)

  return (
    <div className="support-dock">
      <a
        aria-label={`Chat with ${settings.businessName} on WhatsApp`}
        className="flex size-14 cursor-pointer items-center justify-center rounded-full border-2 border-whatsapp-deep bg-surface shadow-lg transition-transform duration-200 hover:scale-[1.04] motion-reduce:transition-none motion-reduce:hover:scale-100"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <WhatsAppIcon size={28} />
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
    </div>
  )
}
