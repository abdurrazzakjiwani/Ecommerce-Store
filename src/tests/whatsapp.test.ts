import { describe, expect, it } from 'vitest'

import {
  buildOrderMessage,
  buildProductEnquiryMessage,
  buildWaLink,
  normaliseWhatsAppNumber,
} from '../lib/whatsapp'

/**
 * Adversarial input is mandatory here. This module's output is a live WhatsApp
 * URL that a real person will open and send, so encoding correctness is not an
 * internal detail. An unencoded message truncates at the first space, which is
 * WhatsApp's documented behaviour.
 */
describe('normaliseWhatsAppNumber', () => {
  it('strips formatting WhatsApp rejects', () => {
    expect(normaliseWhatsAppNumber('+92 3394299873')).toBe('923394299873')
    expect(normaliseWhatsAppNumber('+92-339-429-9873')).toBe('923394299873')
    expect(normaliseWhatsAppNumber('(092) 339 4299873')).toBe('0923394299873')
  })

  it('leaves already-clean digits untouched', () => {
    expect(normaliseWhatsAppNumber('923394299873')).toBe('923394299873')
  })

  it('handles empty and missing values', () => {
    expect(normaliseWhatsAppNumber('')).toBe('')
    expect(normaliseWhatsAppNumber(null)).toBe('')
    expect(normaliseWhatsAppNumber(undefined)).toBe('')
  })
})

describe('buildWaLink', () => {
  it('builds the documented click-to-chat form', () => {
    expect(buildWaLink('923394299873', 'Hello')).toBe(
      'https://wa.me/923394299873?text=Hello',
    )
  })

  it('normalises a formatted number so the link cannot break', () => {
    expect(buildWaLink('+92 3394299873', 'Hello')).toBe(
      'https://wa.me/923394299873?text=Hello',
    )
  })

  it('falls back to a picker link when no number is configured', () => {
    // Degraded but working: WhatsApp opens the contact picker rather than failing.
    expect(buildWaLink('', 'Hello')).toBe('https://wa.me/?text=Hello')
    expect(buildWaLink(null, 'Hello')).toBe('https://wa.me/?text=Hello')
  })

  describe('adversarial encoding', () => {
    it('encodes spaces so the message does not truncate', () => {
      const link = buildWaLink('923394299873', 'New Order - Dell Latitude')
      expect(link).toBe(
        'https://wa.me/923394299873?text=New%20Order%20-%20Dell%20Latitude',
      )
      expect(link).not.toContain(' ')
    })

    it('encodes characters that would otherwise alter the URL structure', () => {
      const hostile = 'a&b=c?d#e/f+g%h'

      const link = buildWaLink('923394299873', hostile)

      // Everything dangerous must be percent-encoded, leaving only the
      // separator we ourselves introduced as a literal.
      expect(link).toBe(
        'https://wa.me/923394299873?text=a%26b%3Dc%3Fd%23e%2Ff%2Bg%25h',
      )
      expect(link.split('?text=')[1]).not.toMatch(/[&#?]/)
    })

    it('cannot inject an extra parameter into the link', () => {
      const link = buildWaLink('923394299873', 'hello&phone=999&text=stolen')

      // Exactly one '?' and exactly one '=', the one we put there.
      expect(link.split('?').length - 1).toBe(1)
      expect(link.split('=').length - 1).toBe(1)
    })

    it('encodes newlines rather than emitting raw ones', () => {
      const link = buildWaLink('923394299873', 'line one\nline two\r\nline three')

      expect(link).not.toContain('\n')
      expect(link).not.toContain('\r')
    })

    it('round-trips emoji and right-to-left text intact', () => {
      const message = 'Urdu: ٹیکسٹ 🚀'
      const link = buildWaLink('923394299873', message)

      const encoded = link.split('?text=')[1] ?? ''
      expect(decodeURIComponent(encoded)).toBe(message)
    })

    it('round-trips a message containing every reserved character', () => {
      const message = `Reserved: & = ? # / % + space "quote" 'apos' \`tick\``
      const link = buildWaLink('923394299873', message)

      const encoded = link.split('?text=')[1] ?? ''
      expect(decodeURIComponent(encoded)).toBe(message)
    })
  })
})

describe('buildOrderMessage', () => {
  const contact = { name: 'Ahmed Khan', phone: '03001234567' }
  const address = {
    city: 'Lahore',
    line1: 'House 12, Street 4',
    line2: 'Gulberg III',
    notes: 'Call before delivery',
    postalCode: '54660',
    province: 'Punjab',
  }

  it('lists priced items with quantity and line total', () => {
    const message = buildOrderMessage(
      [{ priceType: 'fixed', qty: 2, title: 'Business Laptop 14"', unitPrice: 185000 }],
      contact,
      address,
      'YourBrand',
    )

    expect(message).toContain('New Enquiry - YourBrand')
    expect(message).toContain('1. Business Laptop 14"')
    expect(message).toContain('2 x Rs 185,000 = Rs 370,000')
    expect(message).toContain('Subtotal: Rs 370,000')
  })

  it('marks quote items and excludes them from the subtotal', () => {
    const message = buildOrderMessage(
      [
        { priceType: 'fixed', qty: 1, title: 'Monitor', unitPrice: 34000 },
        { priceType: 'quote', qty: 1, title: 'Network Install', unitPrice: null },
      ],
      contact,
      address,
      'YourBrand',
    )

    expect(message).toContain('1 x Request quote')
    // Subtotal must cover priced lines only, and must say it is not final.
    expect(message).toContain('Subtotal: Rs 34,000')
    expect(message).toContain('1 item to quote - total not final')
  })

  it('claims no total at all when every line awaits a quote', () => {
    const message = buildOrderMessage(
      [{ priceType: 'quote', qty: 1, title: 'Support Contract', unitPrice: null }],
      contact,
      address,
      'YourBrand',
    )

    expect(message).toContain('Please quote for the items above')
    expect(message).not.toContain('Subtotal:')
  })

  it('uses singular wording for a single quote item', () => {
    const message = buildOrderMessage(
      [
        { priceType: 'fixed', qty: 1, title: 'Monitor', unitPrice: 1000 },
        { priceType: 'quote', qty: 1, title: 'Install', unitPrice: null },
      ],
      contact,
      address,
      'YourBrand',
    )

    expect(message).toContain('1 item to quote')
  })

  it('omits the notes line entirely when there are no notes', () => {
    const message = buildOrderMessage(
      [{ priceType: 'fixed', qty: 1, title: 'Monitor', unitPrice: 1000 }],
      contact,
      { ...address, notes: '' },
      'YourBrand',
    )

    expect(message).not.toContain('Notes:')
  })

  it('includes every delivery field when an address is supplied', () => {
    const message = buildOrderMessage(
      [{ priceType: 'fixed', qty: 1, title: 'Monitor', unitPrice: 1000 }],
      contact,
      address,
      'YourBrand',
    )

    expect(message).toContain('Name: Ahmed Khan')
    expect(message).toContain('Phone: 03001234567')
    expect(message).toContain('Address: House 12, Street 4, Gulberg III')
    expect(message).toContain('City: Lahore | Province: Punjab | Postal: 54660')
    expect(message).toContain('Notes: Call before delivery')
  })

  it('omits the address block when there is no address', () => {
    const message = buildOrderMessage(
      [{ priceType: 'fixed', qty: 1, title: 'Monitor', unitPrice: 1000 }],
      contact,
      null,
      'YourBrand',
    )

    expect(message).toContain('--- Delivery ---')
    expect(message).not.toContain('Address:')
    expect(message).not.toContain('Notes:')
  })

  it('flattens a newline in a title so message structure cannot be injected', () => {
    const message = buildOrderMessage(
      [
        {
          priceType: 'fixed',
          qty: 1,
          title: 'Evil\nSubtotal: Rs 1',
          unitPrice: 1000,
        },
      ],
      contact,
      address,
      'YourBrand',
    )

    // The injected line must not survive as its own line.
    expect(message).toContain('1. Evil Subtotal: Rs 1')
    // And only the genuine subtotal may be labelled as one.
    expect(message.match(/^Subtotal: /gm)?.length).toBe(1)
  })

  it('handles an empty basket without crashing', () => {
    const message = buildOrderMessage([], contact, address, 'YourBrand')

    expect(message).toContain('New Enquiry - YourBrand')
    expect(message).not.toContain('Subtotal:')
  })
})

describe('buildProductEnquiryMessage', () => {
  it('names the product and its price', () => {
    const message = buildProductEnquiryMessage(
      { price: 185000, priceType: 'fixed', slug: 'business-laptop-14', title: 'Business Laptop' },
      'YourBrand',
    )

    expect(message).toContain('Hello YourBrand,')
    expect(message).toContain('Business Laptop')
    expect(message).toContain('Rs 185,000')
  })

  it('requests a quote rather than showing a price for quote items', () => {
    const message = buildProductEnquiryMessage(
      { price: null, priceType: 'quote', slug: 'support', title: 'Support Contract' },
      'YourBrand',
    )

    expect(message).toContain('Price: request quote')
  })

  it('does not print a price when priceType is quote but a stale price exists', () => {
    // Defence in depth: the collection hook rejects this combination, but the
    // formatter must not print a number even if one slips through.
    const message = buildProductEnquiryMessage(
      { price: 50000, priceType: 'quote', slug: 'support', title: 'Support' },
      'YourBrand',
    )

    expect(message).toContain('Price: request quote')
    expect(message).not.toContain('50,000')
  })
})
