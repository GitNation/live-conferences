import type { Block } from 'payload';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// What a full ticket or multipass gets you — a mosaic of perk cards, one of
// which can span the row.
export const FullTicket: Block = {
  slug: 'fullTicket',
  interfaceName: 'FullTicketBlock',
  labels: { singular: 'Full ticket perks', plural: 'Full ticket sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      {
        name: 'items',
        type: 'array',
        labels: { singular: 'Perk', plural: 'Perks' },
        admin: rowLabel('Perk'),
        fields: [
          { name: 'title', type: 'text' },
          simpleRichText('description'),
          // Icon shown next to the title; the background fills the card.
          { name: 'image', type: 'upload', relationTo: 'media' },
          { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
          { name: 'fullWidth', type: 'checkbox', defaultValue: false },
          // The whole card is the link — no separate button.
          { name: 'url', type: 'text' },
        ],
      },
    ],
  }),
};
