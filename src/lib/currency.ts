/**
 * Currency formatting.
 *
 * Formatted explicitly rather than through `Intl.NumberFormat` with
 * `style: 'currency'`. Using the currency style would make the rendered symbol
 * and placement depend on ICU locale data, which can change between Node
 * releases. That would mean a client's prices could subtly reformat after a
 * runtime upgrade. Explicit formatting is deterministic and matches common
 * Pakistani usage.
 *
 * Rounding: prices are whole rupees, so paisa are rounded to the nearest rupee
 * rather than displayed. Note this is rounding, not truncation - 185000.6
 * renders as "Rs 185,001", not "Rs 185,000". Rounding is deliberate: truncating
 * would systematically understate a price, which is the wrong direction to err
 * when the figure may be shown to a customer.
 */

/** en-US grouping is used purely for the thousands separator: 185000 -> 185,000 */
const GROUPED = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Formats a number of Pakistani Rupees.
 *
 * Non-finite input (NaN, Infinity) returns "Rs 0" rather than "Rs NaN", because
 * a non-finite price reaching a visitor means an upstream data problem, and
 * "Rs NaN" on a product card is worse than a harmless zero.
 */
export function formatPKR(amount: number): string {
  if (!Number.isFinite(amount)) {
    return 'Rs 0'
  }

  return `Rs ${GROUPED.format(amount)}`
}

/**
 * Formats the total for a basket line.
 *
 * A quote-priced line has no unit price and must never produce a number. The
 * caller is responsible for omitting those lines; passing NaN here is the
 * signal that it did not, and yields "Rs 0" instead of a misleading figure.
 */
export function formatLineTotal(qty: number, unitPrice: number): string {
  return formatPKR(qty * unitPrice)
}

/**
 * Sums only the priced lines of a basket.
 *
 * `hasQuoteItems` is returned alongside so the caller can label the total as
 * covering priced items only. Presenting a subtotal as a final order figure
 * while lines are awaiting a quotation is the specific failure spec FR-016
 * prohibits.
 */
export function summariseBasket(
  lines: { qty: number, unitPrice: number | null }[],
): { hasQuoteItems: boolean, quoteCount: number, subtotal: number } {
  let subtotal = 0
  let quoteCount = 0

  for (const line of lines) {
    if (line.unitPrice === null || !Number.isFinite(line.unitPrice)) {
      quoteCount += 1
      continue
    }

    subtotal += line.qty * line.unitPrice
  }

  return {
    hasQuoteItems: quoteCount > 0,
    quoteCount,
    subtotal,
  }
}
