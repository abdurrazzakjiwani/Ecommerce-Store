import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Uploaded imagery.
 *
 * Public read: every image here is rendered into public storefront HTML by
 * design, so public access discloses nothing that is not already on the page.
 * All writes are owner-only.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    // The file-size ceiling is NOT set here. In Payload 3 it is a project-wide
    // setting, configured as `upload.limits.fileSize` in payload.config.ts.
    imageSizes: [
      {
        name: 'thumb',
        width: 400,
        height: 400,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 768,
        position: 'centre',
      },
      {
        name: 'detail',
        width: 1280,
        height: 1280,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      // Spec FR-027: alternative text is mandatory at upload, not optional.
      // An image with no alt text is invisible to screen readers and to search
      // engines, so this is enforced by the schema rather than by convention.
      admin: {
        description:
          'Describe the image for someone who cannot see it. Required for accessibility and search.',
      },
    },
  ],
}
