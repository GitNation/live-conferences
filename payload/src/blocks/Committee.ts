import type { Block } from 'payload';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// The program committee, pulled from EMS.
// The list itself is fetched at build time and is never authored here.
export const Committee: Block = {
  slug: 'committee',
  interfaceName: 'CommitteeBlock',
  labels: { singular: 'Committee', plural: 'Committee sections' },
  admin: sectionAdmin,
  fields: sectionTabs({ content: [{ name: 'title', type: 'text' }] }),
};
