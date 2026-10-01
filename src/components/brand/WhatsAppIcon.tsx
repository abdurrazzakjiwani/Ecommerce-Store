/**
 * The official WhatsApp brand mark.
 *
 * Source: https://cdn.simpleicons.org/whatsapp - fetched and verified during Phase 0 of
 * feature 002 (specs/002-polish-storefront/research.md, decision D1). Response was
 * `viewBox="0 0 24 24"`, `fill="#25D366"`, 1104-character path, HTTP 200.
 *
 * WHY THIS REPLACES `MessageCircle` FROM lucide-react:
 * lucide carries no brand icons. They were deprecated and lucide's own deprecation
 * notice directs users to simpleicons.org. A generic speech bubble next to the word
 * "WhatsApp" reads as "some messaging app", which is exactly what the client noticed.
 *
 * DO NOT RECOLOUR. Meta's brand guidelines forbid modifying the mark, and the
 * available alternative - darkening brand green until it passes contrast on cream -
 * is therefore not available. The mark measures 1.91:1 on the cream surface, which
 * fails AA. The solution is placement, not colour: every usage pairs the mark with
 * white or with the teal `--color-whatsapp-deep`, where it measures 3.87:1.
 *
 * This is a brand asset, not business identity, which is why it is a code constant
 * and not a `site-settings` field. Exposing it in the admin panel would let the
 * merchant recolour a mark the guidelines forbid changing - a worse failure than
 * requiring a code change.
 */

export type WhatsAppIconProps = {
  /** Rendered width and height in pixels. Default 24, matching the source viewBox. */
  size?: number
  className?: string
  /**
   * Accessible name. When omitted the icon is treated as decorative and hidden from
   * assistive technology - the correct default, because in every button on this site
   * the visible label already names the action, and a `title` would duplicate it.
   * Supply it only for a genuinely standalone mark with no adjacent text.
   */
  title?: string
}

export function WhatsAppIcon({ size = 24, className, title }: WhatsAppIconProps) {
  const labelled = typeof title === 'string' && title.length > 0

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      // Fixed, and deliberately not overridable by className. The guidelines forbid
      // recolouring the mark, so the fill is not a themable value.
      fill="#25D366"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
      focusable="false"
    >
      {labelled ? <title>{title}</title> : null}
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export default WhatsAppIcon
