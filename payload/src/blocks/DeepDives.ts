import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

export const DeepDives: Block = {
	slug: 'deepDives',
	interfaceName: 'DeepDivesBlock',
	labels: { singular: 'Deep dives', plural: 'Deep dive sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			...simpleRichText('description'),
			{
				name: 'items',
				type: 'array',
				labels: { singular: 'Topic', plural: 'Topics' },
				admin: rowLabel('Topic'),
				fields: [
					{ name: 'title', type: 'text', required: true },
					...simpleRichText('description'),
					...simpleRichText('list'),
					{ name: 'button', type: 'group', fields: button({ variant: false }) },
				],
			},
		],
	}),
};
