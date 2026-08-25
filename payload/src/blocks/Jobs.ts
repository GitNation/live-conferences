import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The heading above the list is written here, the cards under it are attached
// from the shared Jobs collection. Nothing is styled, so no Style tab.
export const Jobs: Block = {
	slug: 'jobs',
	interfaceName: 'JobsBlock',
	labels: { singular: 'Jobs', plural: 'Jobs sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [{ name: 'title', type: 'text' }, ...simpleRichText('description'), { name: 'items', type: 'relationship', relationTo: 'jobs', hasMany: true }],
	}),
};
