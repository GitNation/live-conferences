import type { CollectionConfig } from 'payload';
import { admin, adminField, adminOrSelf, authenticated, authenticatedAdminUI } from '@/access';

// Accounts are the admin's business — everyone else only reads the list and
// edits their own.
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
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    group: 'System',
    // The name is what shows up wherever a user is referenced (the editor of a
    // conference, the account menu); email is the fallback until one is set.
    useAsTitle: 'name',
  },
  // Only these travel with a populated relationship — never the auth columns.
  // `id` has to be listed too, or the relationship comes back as a bare id.
  defaultPopulate: { id: true, name: true, email: true, avatar: true },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'editor',
      required: true,
      access: {
        // Nobody but an admin hands out a role, at creation or after.
        create: adminField,
        update: adminField,
      },
    },
  ],
};
