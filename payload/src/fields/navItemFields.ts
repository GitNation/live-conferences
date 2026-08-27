import type { Field } from 'payload';

// A navigation link — same shape the header/footer nav had in Hygraph.
export const navItem = (): Field[] => [
  { name: 'text', type: 'text', required: true },
  { name: 'url', type: 'text', required: true },
  { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
];
