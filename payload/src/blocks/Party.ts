import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The party teaser — a heading, a paragraph and (optionally) a looping video
// behind them.
export const Party: Block = {
  slug: 'party',
  interfaceName: 'PartyBlock',
  labels: { singular: 'Party', plural: 'Party sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      simpleRichText('description'),
    ],
  }),
};
