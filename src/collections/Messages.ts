import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { MIN_FILL_SECONDS } from '../lib/address'

/**
 * Contact form submissions.
 *
 * `create` is ADMIN ONLY, deliberately. Submissions are made exclusively through
 * the custom contact endpoint, which runs the spam defences below first. Leaving
 * the REST route open would let anyone bypass them entirely.
 *
 * All read access is admin-only, so enquiry contents can never be enumerated by
 * a visitor.
 */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: {
    plural: 'Messages',
    singular: 'Message',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    useAsTitle: 'subject',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'referringPage',
      type: 'text',
      admin: {
        description: 'Which page the enquiry came from.',
        readOnly: true,
      },
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
        { label: 'Read', value: 'read' },
      ],
      required: true,
    },
    {
      name: 'emailSent',
      type: 'checkbox',
      admin: {
        description:
          'Whether notification was delivered. The record exists regardless, so email is a convenience layer and never the only copy.',
        position: 'sidebar',
        readOnly: true,
      },
      defaultValue: false,
    },

    /* --- Spam defences. Run server-side, so they cannot be bypassed. --- */
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Leave empty. Bots fill every field they find.',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.website && data.website.trim() !== '') {
              throw new Error('Rejected.')
            }
            return data
          },
        ],
      },
    },
    {
      name: 'formStartedAt',
      type: 'number',
      admin: { readOnly: true },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            const started = Number(data?.formStartedAt)

            // Bots submit in well under three seconds. A genuine visitor has to
            // read and type, so this floor never rejects a real submission.
            if (Number.isFinite(started) && Date.now() - started < MIN_FILL_SECONDS * 1000) {
              throw new Error('Rejected.')
            }
            return data
          },
        ],
      },
    },
  ],
}
