import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The page decides how the questions are grouped: a heading is typed here and
// the questions under it are attached from the shared Faqs collection. Nothing
// is styled, so the block has no Style tab.
export const Faq: Block = {
	slug: 'faq',
	interfaceName: 'FaqBlock',
	labels: { singular: 'FAQ', plural: 'FAQ sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			...simpleRichText('description'),
			{
				name: 'groups',
				type: 'array',
				minRows: 1,
				labels: { singular: 'Group', plural: 'Groups' },
				admin: rowLabel('Group'),
				fields: [
					{ name: 'title', type: 'text', required: true },
					{ name: 'items', type: 'relationship', relationTo: 'faqs', hasMany: true, required: true },
				],
			},
		],
	}),
};
