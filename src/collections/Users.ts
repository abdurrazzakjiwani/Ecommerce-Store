import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isFirstUser } from '../access/isFirstUser'

/**
 * The business owner's admin account. The only role issued in v1.
 *
 * Customer accounts live in a separate `customers` collection, which is a
 * retained auth seam and is deliberately unused until Google login is enabled.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: {
    singular: 'Owner',
    plural: 'Owners',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    // Only the very first user may self-register. Everyone after that must be
    // created by an existing owner. This closes the privilege-escalation path
    // where a visitor signs themselves up as an admin.
    create: isFirstUser,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      // A single option, so the owner cannot accidentally create a lesser
      // account. Customer roles do not belong on this collection.
      options: [
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        // Field-level access expects a boolean, not a collection Access query.
        // Only an existing owner may change a role.
        update: ({ req: { user } }) => Boolean(user),
      },
    },
  ],
}
