import type { CollectionConfig } from 'payload';
import { admin, adminField, adminOrSelf, authenticated, authenticatedAdminUI } from '../access';

// Admin accounts. Editors manage content; only admins manage accounts, and
// nobody can delete themselves out of the panel.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Brute force protection: lock the account for 10 minutes after 5 misses.
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
  },
  access: {
    admin: authenticatedAdminUI,
    create: admin,
    delete: admin,
    read: authenticated,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['email', 'role', 'updatedAt'],
    group: 'System',
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      access: {
        // An editor must not be able to promote themselves.
        update: adminField,
      },
    },
  ],
};
