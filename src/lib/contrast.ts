/**
 * WCAG 2.x relative luminance and contrast ratio.
 *
 * This module exists so the WhatsApp brand decision is a measured, testable fact
 * rather than an assertion in a comment. See specs/002-polish-storefront/research.md
 * decision D2 for the measured values, and `src/tests/contrast.test.ts` for the
 * assertions that guard them.
 *
 * Why it matters: the two obvious WhatsApp treatments both fail. Brand green on the
 * cream surface computes to 1.91:1, and white text on brand green computes to 1.98:1.
 * That is why the adopted treatment uses WhatsApp's deep teal as the background, and
 * why the brand-green mark may never sit directly on cream.
 *
 * Pure functions, no I/O, no browser APIs - the constitution requires unit coverage for
 * everything in `src/lib/`.
 */

function parseHex(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.trim().replace(/^#/, '')

  const isValidLength = cleaned.length === 3 || cleaned.length === 6
  const isValidChars = /^[0-9a-fA-F]+$/.test(cleaned)

  if (!isValidLength || !isValidChars) {
    throw new Error(
      `Invalid hex colour: "${hex}". Expected 3 or 6 hexadecimal digits, with or without a leading "#".`,
    )
  }

  // Expand shorthand (#abc) to full form (#aabbcc) so there is one code path below.
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((char) => char + char)
          .join('')
      : cleaned

  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  }
}

/**
 * Linearises one sRGB channel. Values of 0.03928 or below use the linear segment;
 * above that the power curve applies. The threshold is the WCAG 2.x definition, not
 * a rounding convenience.
 */
function linearise(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

/**
 * Relative luminance of a hex colour, from 0 (black) to 1 (white).
 *
 * @throws if the input is not valid hexadecimal. A plausible wrong number here would
 * let a failing colour combination pass review, which is worse than a loud failure.
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex)
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

/**
 * Contrast ratio between two hex colours, from 1 (identical) to 21 (black on white).
 *
 * Argument order does not matter: the lighter colour is always used as the numerator,
 * so callers cannot get a different answer by swapping the pair.
 *
 * Reference thresholds used by this project:
 *   >= 4.5  normal text
 *   >= 3.0  large text and non-text UI such as icons and borders
 */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)

  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)

  return (lighter + 0.05) / (darker + 0.05)
}

/** True when the pair meets the normal-text threshold of 4.5:1. */
export function meetsNormalText(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5
}

/** True when the pair meets the large-text and UI threshold of 3:1. */
export function meetsUiContrast(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 3
}
