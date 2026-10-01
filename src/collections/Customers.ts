import type { CollectionConfig } from 'payload'

/**
 * DEFERRED AUTH SEAM - deliberately unused in v1.
 *
 * The client deferred customer sign-in until the business confirms it is
 * needed. Defining the collection now means enabling Google login later is a UI
 * and strategy task rather than a data migration against live enquiry records.
 *
 * Every operation is denied, so this collection cannot be reached or populated
 * until sign-in is switched on. `auth: true` is retained so the session machinery
 * is already correct when that happens.
 *
 * Enabling it requires (see research.md decision D8): Google Cloud OAuth
 * credentials from the owner; a custom Payload auth strategy rather than Auth.js,
 * because Payload already issues its own JWT and cookie; an internally generated
 * random password per login, since Payload cannot remove the password field from
 * an auth-enabled collection; and a published privacy policy, which the storefront
 * already provides.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    plural: 'Customers',
    singular: 'Customer',
  },
  auth: true,
  access: {
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    defaultColumns: ['name', 'email', 'phone', 'createdAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'googleSub',
      type: 'text',
      admin: {
        description: 'OIDC subject identifier from Google.',
        readOnly: true,
      },
      index: true,
      unique: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'recipientName', type: 'text' },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        {
          name: 'province',
          type: 'select',
          options: [
            'Punjab',
            'Sindh',
            'Khyber Pakhtunkhwa',
            'Balochistan',
            'Islamabad Capital Territory',
            'Gilgit-Baltistan',
            'Azad Jammu & Kashmir',
          ],
          required: true,
        },
        { name: 'postalCode', type: 'text' },
        { name: 'notes', type: 'textarea' },
        { name: 'isDefault', type: 'checkbox' },
      ],
    },
  ],
}
