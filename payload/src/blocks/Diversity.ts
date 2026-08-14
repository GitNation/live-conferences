import type { Block } from 'payload';
import { button } from '../fields/button';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// Diversity support: the pitch, the sponsor's logo and how much of the
// sponsored-ticket goal is covered (drawn as a ring).
export const Diversity: Block = {
  slug: 'diversity',
  interfaceName: 'DiversityBlock',
  labels: { singular: 'Diversity', plural: 'Diversity sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      simpleRichText('description'),
      { name: 'sponsorLogo', type: 'upload', relationTo: 'media' },
      {
        name: 'sponsoredTickets',
        type: 'number',
        min: 0,
        max: 100,
        admin: { step: 1 },
      },
      {
        name: 'buttons',
        type: 'array',
        maxRows: 2,
        labels: { singular: 'Button', plural: 'Buttons' },
        admin: rowLabel('Button'),
        fields: button(),
      },
    ],
  }),
};
