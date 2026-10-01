import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * A persisted enquiry.
 *
 * Items are stored as a denormalised snapshot rather than as relations, for two
 * reasons. If an item is later renamed or repriced, past enquiries must still
 * show what was actually agreed. And a quote-only service may never exist as a
 * product at all, so the enquiry must not depend on a live relation to render.
 *
 * All access is admin-only. Orders are created exclusively by the enquiry
 * endpoint, never by a direct API call.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    plural: 'Enquiries',
    singular: 'Enquiry',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['customerName', 'customerPhone', 'subtotal', 'status', 'createdAt'],
    useAsTitle: 'customerName',
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        description: 'Snapshot of what was requested at the moment it was sent.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'qty', type: 'number', min: 1, required: true },
        {
          name: 'unitPrice',
          type: 'number',
          admin: {
            description: 'Null for items awaiting a quotation.',
          },
        },
        {
          name: 'priceType',
          type: 'select',
          options: [
            { label: 'Fixed', value: 'fixed' },
            { label: 'From', value: 'from' },
            { label: 'Quote', value: 'quote' },
          ],
          required: true,
        },
      ],
      required: true,
    },
    {
      name: 'subtotal',
      type: 'number',
      admin: {
        description: 'Priced items only. Null when every item awaits a quotation.',
      },
    },
    {
      name: 'hasQuoteItems',
      type: 'checkbox',
      index: true,
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'recipientName', type: 'text' },
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
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
        },
        {
          name: 'postalCode',
          type: 'text',
          admin: {
            description: 'Five digits, per Pakistan Post.',
          },
        },
        { name: 'notes', type: 'textarea' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Basket checkout', value: 'whatsapp-cart' },
        { label: 'Single item', value: 'whatsapp-single' },
        { label: 'Contact form', value: 'contact-form' },
      ],
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      admin: {
        description:
          'Always empty in v1. Retained as the seam that makes customer sign-in a UI change rather than a data migration.',
        readOnly: true,
      },
      relationTo: 'customers',
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Closed', value: 'closed' },
      ],
      required: true,
    },
  ],
}
