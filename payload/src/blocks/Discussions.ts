import type { Block } from 'payload';
import { simpleRichText } from '../fields/richText';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// Tech discussion rooms. Only the copy is editable — the rooms themselves come
// from EMS at build time and are never authored here.
export const Discussions: Block = {
  slug: 'discussions',
  interfaceName: 'DiscussionsBlock',
  labels: { singular: 'Discussions', plural: 'Discussion sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      simpleRichText('description'),
    ],
  }),
};
