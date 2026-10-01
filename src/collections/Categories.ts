import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Category hierarchy of unbounded depth.
 *
 * No delete hook: Payload blocks deleting a referenced document by default, which
 * is exactly what spec FR-032 requires. Deleting a non-empty category therefore
 * fails safely instead of orphaning its products, and the admin panel surfaces
 * the error naming the blocking documents.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    plural: 'Categories',
    singular: 'Category',
  },
  access: {
    create: authenticated,
    read: () => true,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'parent', 'order'],
    useAsTitle: 'title',
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
      admin: {
        position: 'sidebar',
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        description:
          'Leave empty for a top-level category. Setting a parent makes this a sub-category.',
      },
      hasMany: false,
      index: true,
      relationTo: 'categories',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      admin: {
        description: 'Square image used in the category rail.',
      },
      relationTo: 'media',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Lower numbers appear first.',
        position: 'sidebar',
      },
      index: true,
    },
  ],
}
