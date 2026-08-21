import type { Field } from 'payload';

// One switch for everything that can be taken off the page without being
// deleted — a section, and the rows inside one.
//
// Hide rather than show on purpose: an unset value means the content renders, so
// adding the switch never hides what is already there. The Gulp bridge drops
// hidden entries, so the site never sees them.
export const hidden: Field = {
  name: 'hidden',
  type: 'checkbox',
  label: 'Hidden on the site',
  defaultValue: false,
};
