import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// Share-your-badge offer. The badge artwork next to the text is markup, not
// content, so it stays in the template.
export const FreeTicket: Block = {
  slug: 'freeTicket',
  interfaceName: 'FreeTicketBlock',
  labels: { singular: 'Free ticket', plural: 'Free ticket sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      ...simpleRichText('description'),
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
