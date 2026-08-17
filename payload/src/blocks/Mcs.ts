import type { Block } from 'payload';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// The hosts, pulled from EMS.
// The list itself is fetched at build time and is never authored here.
export const Mcs: Block = {
  slug: 'mcs',
  interfaceName: 'McsBlock',
  labels: { singular: 'MCs', plural: 'MC sections' },
  admin: sectionAdmin,
  fields: sectionTabs({ content: [{ name: 'title', type: 'text' }] }),
};
