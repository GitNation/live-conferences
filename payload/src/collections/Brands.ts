import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { rowLabel } from '../fields/rowLabel';

// The brand — a conference that recurs year after year (JSNation, React Summit,
// …). Mirrors Hygraph's ConferenceBrand. Brand-level things that don't change
// per edition live here; each year's edition is a Conference pointing at it.
export const Brands: CollectionConfig = {
  slug: 'brands',
  // Content is public — the Gulp build fetches without auth (like Hygraph's
  // published content API). Writes still require an admin user.
  access: {
		create: authenticated,
		delete: authenticated,
		read: anyone,
		update: authenticated,
	},
  admin: {
    group: 'Conferences',
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'url'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      // Host city, e.g. "Amsterdam".
      name: 'city',
      type: 'text',
    },
    {
      // Public site address, e.g. "https://jsnation.com/". Templates build
      // canonical urls from it.
      name: 'url',
      type: 'text',
    },
    {
      // Conference folder key in src/conferences/, e.g. "jsn". Out of the way
      // in the sidebar: it is what the build selects the brand by, not
      // editorial content.
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      // Set once per brand; sections that need them (footer, contacts) pull
      // them from here.
      name: 'socials',
      type: 'array',
      labels: { singular: 'Social link', plural: 'Socials' },
      admin: rowLabel('Social'),
      fields: [
        {
          // Values map to sprite icons in the templates (src/conferences/*/icons).
          name: 'network',
          type: 'select',
          options: [
            'twitter',
            'facebook',
            'linkedin',
            'youtube',
            'instagram',
            'tiktok',
            'bluesky',
            'discord',
            'portal',
          ],
          required: true,
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
};
