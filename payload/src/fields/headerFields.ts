import type { Field } from 'payload';
import { button } from '@/fields/buttonFields';
import { navItem } from '@/fields/navItemFields';
import { rowLabel } from '@/fields/rowLabel';

// One shared field set, filled per conference — each edition has its own links.
// Attached as a named group on Conferences.
export const headerFields = (): Field[] => [
  {
    name: 'navigation',
    type: 'array',
    labels: { singular: 'Link', plural: 'Navigation' },
    admin: rowLabel('Link'),
    fields: navItem(),
  },
  {
    // Always the same style, always same-tab — label and url only.
    name: 'button',
    type: 'group',
    fields: button({ variant: false, openInNewTab: false }),
  },
];
