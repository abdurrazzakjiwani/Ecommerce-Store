/**
 * Pakistan delivery geography and address validation.
 *
 * The province list and the postal code format are both externally verified
 * rather than assumed:
 *
 * - The seven top-level units come from the Pakistan Post delivery directory,
 *   which associates every delivery post office with a province.
 * - Postal codes are five digits: two identify the district for routing, three
 *   narrow it to the exact post office. Introduced by Pakistan Post in 1988.
 */

import { z } from 'zod'

/**
 * Deliberately fixed rather than an international country selector. The business
 * delivers nationwide within Pakistan, so offering a country list would be noise,
 * and a free-text country field produces unrouteable addresses.
 */
export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
] as const

export type Province = (typeof PROVINCES)[number]

/**
 * Pakistan mobile numbers: 10 digits beginning 03.
 *
 * Accepts the shapes people actually type - `03001234567`,
 * `+923001234567`, `0092 300 1234567` - and normalises to the local form so the
 * message the business receives is consistent.
 */
export const PAKISTAN_MOBILE_REGEX = /^(?:\+?92|0)?3\d{9}$/

export function normalisePakistaniPhone(value: string): string {
  const digits = value.replace(/[^\d]/g, '')

  // "0092" international prefix, then the 10-digit local number = 14 total.
  if (digits.startsWith('0092') && digits.length === 14) {
    return `0${digits.slice(4)}`
  }

  // "92" country code, then the 10-digit local number = 12 total.
  if (digits.startsWith('92') && digits.length === 12) {
    return `0${digits.slice(2)}`
  }

  if (digits.startsWith('03') && digits.length === 11) {
    return `0${digits.slice(1)}`
  }

  return digits
}

/** Shared field schemas, reused by the checkout and contact forms. */
export const nameField = z
  .string()
  .trim()
  .min(2, 'Please enter your full name.')
  .max(120, 'That name is too long.')

export const phoneField = z
  .string()
  .trim()
  .min(1, 'Please enter a contact number.')
  .refine((value) => PAKISTAN_MOBILE_REGEX.test(value.replace(/[\s-]/g, '')), {
    message: 'Enter a Pakistan mobile number, for example 03001234567.',
  })

export const emailField = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .max(254, 'That email address is too long.')
  .email('Enter a valid email address, for example name@example.com.')

export const postalCodeField = z
  .string()
  .trim()
  .regex(/^\d{5}$/, 'Enter a 5-digit postal code, for example 54660.')

export const provinceField = z.enum(PROVINCES, {
  message: 'Choose a province or territory.',
})

export const line1Field = z
  .string()
  .trim()
  .min(4, 'Enter your street address.')
  .max(200, 'That address is too long.')

export const line2Field = z
  .string()
  .trim()
  .max(200, 'That address is too long.')
  .optional()
  .or(z.literal(''))

export const cityField = z
  .string()
  .trim()
  .min(2, 'Enter your city.')
  .max(100, 'That city name is too long.')

export const notesField = z
  .string()
  .trim()
  .max(1000, 'Please keep notes under 1000 characters.')
  .optional()
  .or(z.literal(''))

/** Full delivery address, used at checkout. */
export const addressSchema = z.object({
  city: cityField,
  line1: line1Field,
  line2: line2Field,
  notes: notesField,
  postalCode: postalCodeField,
  province: provinceField,
})

export type AddressInput = z.infer<typeof addressSchema>

/** Contact form. Messages are deliberately length-bounded. */
export const contactSchema = z.object({
  email: emailField,
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little more about what you need.')
    .max(5000, 'Please keep your message under 5000 characters.'),
  name: nameField,
  phone: phoneField.optional().or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(3, 'Please add a short subject.')
    .max(160, 'That subject is too long.'),
})

export type ContactInput = z.infer<typeof contactSchema>

/** Spammer guard, enforced server-side in production. */
export const MIN_FILL_SECONDS = 3
