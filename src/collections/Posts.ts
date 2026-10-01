import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    plural: 'Blog posts',
    singular: 'Blog post',
  },
  access: {
    create: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'publishedAt', '_status'],
    useAsTitle: 'title',
  },
  versions: {
    // See Products for why autosave is off.
    drafts: { autosave: false },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Shown on the blog index and in search results.',
      },
      required: true,
    },
    { name: 'body', type: 'richText', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'author',
      type: 'relationship',
      admin: { position: 'sidebar' },
      relationTo: 'users',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            // Default to now on first publish, so ordering never depends on a
            // forgotten date field.
            if (siblingData?._status === 'published' && !value) return new Date().toISOString()
            return value
          },
        ],
      },
    },
  ],
}
