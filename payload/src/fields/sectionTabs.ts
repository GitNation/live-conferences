import type { Field } from 'payload';
import { sectionStyleFields } from './background';

// Every section block is built from these: an on/off switch, then a Content tab
// and a Style tab. Wrap a block's fields with this instead of declaring tabs by
// hand.
//
// The Style tab is the same everywhere — background, overlay, vertical padding
// — so any section can carry a background; `style` only adds fields specific to
// one block on top of that.
//
// `disabled` rather than `enabled` on purpose: an unset value means the section
// renders, so adding the switch never hides existing content. The Gulp bridge
// drops disabled sections, so the site never sees them.

type SectionTabsArgs = {
  content: Field[];
  style?: Field[];
  // For blocks that sit inside another section (Event's `blocks` slot): the
  // parent section owns the background and the padding, so a nested block has
  // nothing to put in a Style tab.
  nested?: boolean;
};

export const sectionTabs = ({ content, style = [], nested = false }: SectionTabsArgs): Field[] => [
  {
    name: 'disabled',
    type: 'checkbox',
    label: 'Disabled (hidden on the site)',
    defaultValue: false,
  },
  {
    type: 'tabs',
    tabs: [
      { label: 'Content', fields: content },
      ...(nested ? [] : [{ label: 'Style', fields: [...sectionStyleFields(), ...style] }]),
    ],
  },
];

// Shown as the collapsed section header — highlights disabled sections.
export const sectionAdmin = {
  components: { Label: '@/components/SectionLabel#SectionLabel' },
};
