import type { Field } from 'payload';
import { navItem } from '@/fields/navItemFields';
import { rowLabel } from '@/fields/rowLabel';

// One shared field set, filled per conference — each edition has its own links.
// Attached as a named group on Conferences.
export const footerFields = (): Field[] => [
  {
    // Heading above the links, e.g. "Follow us".
    name: 'heading',
    type: 'text',
  },
  {
    name: 'navigation',
    type: 'array',
    labels: { singular: 'Link', plural: 'Navigation' },
    admin: rowLabel('Link'),
    fields: navItem(),
  },
];
