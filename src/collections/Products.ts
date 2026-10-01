import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated'

export type PriceType = 'fixed' | 'from' | 'quote'

/**
 * The catalogue entity.
 *
 * `priceType` is the load-bearing field. The client's catalogue composition is
 * unconfirmed, so rather than guessing, the model accommodates all three pricing
 * presentations at once. That is what makes deferring the catalogue decision safe.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    plural: 'Products',
    singular: 'Product',
  },
  access: {
    create: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'category', 'priceType', 'price', 'inStock', 'featured'],
    useAsTitle: 'title',
  },
  versions: {
    // Autosave is disabled deliberately. Payload 3.81.0 and 3.82.0 have a
    // serverless autosave race causing intermittent 500s that cannot be
    // reproduced on a local dev server. Fixed in 3.83.0; disabling removes the
    // class of problem entirely. See research.md decision D5.
    drafts: { autosave: false },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'One or two sentences. Also used in search and card listings.',
      },
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      index: true,
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description:
          'Three to five images. Drag to reorder - the order here is the order shown in the carousel.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          required: true,
          relationTo: 'media',
        },
      ],
      // Deliberately NOT required. The 3-5 rule applies when a gallery is
      // present, so the owner is never blocked from publishing an item without
      // photos. The storefront renders a labelled placeholder instead.
      maxRows: 5,
      minRows: 3,
    },
    {
      name: 'priceType',
      type: 'radio',
      admin: {
        description:
          'Fixed price, a starting price, or no price at all if the price is agreed per enquiry.',
        position: 'sidebar',
      },
      defaultValue: 'fixed',
      options: [
        { label: 'Fixed price', value: 'fixed' },
        { label: 'From (indicative)', value: 'from' },
        { label: 'Request a quote', value: 'quote' },
      ],
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      admin: {
        condition: (data) => data.priceType !== 'quote',
        description: 'In PKR. Leave empty only when the price type is "Request a quote".',
        position: 'sidebar',
      },
      hooks: {
        /**
         * Enforces the pricing invariant at the API, so neither the admin panel
         * nor a direct REST call can persist a contradiction. A quote item with
         * a price would show a number the business never intended to quote.
         */
        beforeValidate: [
          ({ data, siblingData }) => {
            if (data?.priceType === 'quote') {
              data.price = null
            } else if (siblingData?.price === null || siblingData?.price === undefined) {
              throw new Error(
                'A price is required when the price type is "Fixed price" or "From".',
              )
            }

            return data
          },
        ],
      },
      min: 0,
    },
    {
      name: 'currency',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'PKR',
      required: true,
    },
    {
      name: 'specs',
      type: 'array',
      admin: {
        description:
          'Named specifications. Free-form so an unfamiliar category needs no schema change.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        position: 'sidebar',
      },
      fields: [{ name: 'tag', type: 'text', required: true }],
      index: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
    {
      name: 'inStock',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      defaultValue: true,
      index: true,
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'products',
    },
  ],
}
