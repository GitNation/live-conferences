import type { Block } from 'payload';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// People from EMS — this block only holds the copy above the list.
// The list itself is fetched at build time and is never authored here.
export const Speakers: Block = {
  slug: 'speakers',
  interfaceName: 'SpeakersBlock',
  labels: { singular: 'Speakers', plural: 'Speaker sections' },
  admin: sectionAdmin,
  fields: sectionTabs({ content: [{ name: 'title', type: 'text' }] }),
};
