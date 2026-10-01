import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * The single source of every business identity value.
 *
 * Read publicly, and that is deliberate: every value here is rendered into
 * public storefront HTML anyway (spec FR-051), so public read discloses nothing
 * that is not already on the page. What must NEVER be added to this global is a
 * credential or provider key - those belong in environment variables only
 * (Principle IV).
 *
 * Principle I requires that no component read a business value from anywhere
 * else. Changing any field here changes the whole site with no redeployment.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description:
      'Everything the visitor sees about the business. Changes appear on the site immediately, with no redeployment.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'One line describing what the business does.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description:
          'Leave empty if you have no landline. An empty value is omitted from the site rather than shown as a placeholder.',
      },
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      admin: {
        description:
          'International format, digits only. Do not include +, spaces or dashes - the link breaks silently otherwise.',
      },
      required: true,
      hooks: {
        beforeValidate: [
          ({ data }) => {
            /**
             * Normalise on write. WhatsApp's documented grammar rejects "+",
             * spaces, dashes and brackets, and a stored value like "+92 300
             * 1234567" produces a link that silently fails to open.
             */
            if (typeof data?.whatsappNumber === 'string') {
              data.whatsappNumber = data.whatsappNumber.replace(/\D/g, '')
            }
            return data
          },
        ],
      },
    },
    {
      name: 'notificationEmail',
      type: 'email',
      admin: {
        description:
          'Where contact form notifications are delivered. This is the only email value editable here - the sending credentials stay in environment variables.',
      },
      required: true,
    },
    {
      name: 'address',
      type: 'textarea',
      admin: {
        description: 'Leave empty if you would rather not show a business address.',
      },
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'youtube', type: 'text' },
      ],
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'PKR',
      options: [{ label: 'PKR', value: 'PKR' }],
      required: true,
    },
    {
      name: 'deliveryCharge',
      type: 'number',
      admin: {
        description: 'Leave at zero if delivery is included in the price.',
      },
      min: 0,
    },
    {
      name: 'deliveryTimeframe',
      type: 'text',
      admin: {
        description: 'Shown in the footer and at checkout.',
      },
    },
    {
      name: 'aboutContent',
      type: 'richText',
      admin: {
        condition: (data) => data.businessName !== undefined,
        description: 'The About page. Separate paragraphs with a blank line.',
      },
    },
    {
      name: 'contactIntro',
      type: 'textarea',
      admin: {
        description: 'Introductory text shown above the contact form.',
      },
    },
  ],
}
