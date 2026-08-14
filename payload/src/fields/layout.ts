import type { Field } from 'payload';
import { button } from './button';
import { navItem } from './navItem';
import { rowLabel } from './rowLabel';

// Header and footer: one shared field set, filled per conference (each edition
// has its own links). Attached as groups on Conferences.

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
