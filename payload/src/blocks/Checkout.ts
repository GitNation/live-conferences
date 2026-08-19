import type { Block } from 'payload';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// The ticket page: one Tito widget per tab above the tickets.
//
// The headings the checkout builds over those tickets are not here yet — they
// still come from the browser script and Hygraph. See "Checkout: ticket sections"
// in docs/payload-migration-plan.md.
export const Checkout: Block = {
  slug: 'checkout',
  interfaceName: 'CheckoutBlock',
  labels: { singular: 'Checkout', plural: 'Checkout sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      {
        // A single widget renders without tabs, so `label` only shows with two.
        name: 'widgets',
        type: 'array',
        minRows: 1,
        maxRows: 2,
        labels: { singular: 'Widget', plural: 'Widgets' },
        admin: rowLabel('Widget'),
        fields: [
          { name: 'label', type: 'text', required: true },
          {
            // The ti.to link to the event, pasted whole. A trailing slash goes:
            // the widget takes the path out of this link and chokes on it.
            name: 'event',
            type: 'text',
            required: true,
            hooks: { beforeChange: [({ value }) => (value || '').trim().replace(/\/+$/, '')] },
          },
        ],
      },
    ],
  }),
};
