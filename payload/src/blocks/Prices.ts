import type { Block } from 'payload';
import { button } from '../fields/button';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';
import { TICKET_GROUPS } from '../constants/ticketGroups';

// Ticket prices. Hygraph kept one flat list where every card repeated its
// `group` and `groupLabel`; here the groups own their tickets, so the tab
// label is written once and a card cannot end up in a group that has no tab.
export const Prices: Block = {
  slug: 'prices',
  interfaceName: 'PricesBlock',
  labels: { singular: 'Prices', plural: 'Price sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      {
        name: 'groups',
        type: 'array',
        labels: { singular: 'Group', plural: 'Groups' },
        admin: rowLabel('Group'),
        fields: [
          // The tab above the cards, picked from the shared list in
          // src/constants/ticketGroups.ts. A single group renders without tabs.
          { name: 'label', type: 'select', options: TICKET_GROUPS, required: true },
          {
            name: 'tickets',
            type: 'array',
            labels: { singular: 'Ticket', plural: 'Tickets' },
            admin: rowLabel('Ticket'),
            fields: [
              { name: 'title', type: 'text', required: true },
              // When the ticket is valid, e.g. "Jun 11 (in-person)".
              { name: 'date', type: 'text' },
              { name: 'price', type: 'text', required: true },
              { name: 'priceAfter', type: 'text' },
              { name: 'discountBadge', type: 'text' },
              // What the ticket includes — a bullet list.
              simpleRichText('description'),
              { name: 'button', type: 'group', fields: button({ required: false }) },
            ],
          },
        ],
      },
      {
        // The newsletter promo under the cards. Without a button it renders
        // the built-in subscribe form.
        name: 'form',
        type: 'group',
        fields: [
          { name: 'title', type: 'text' },
          simpleRichText('description'),
          {
            name: 'buttons',
            type: 'array',
            maxRows: 2,
            labels: { singular: 'Button', plural: 'Buttons' },
            admin: rowLabel('Button'),
            fields: button(),
          },
        ],
      },
    ],
  }),
};
