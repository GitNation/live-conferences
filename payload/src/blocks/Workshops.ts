import type { Block } from 'payload';
import { button } from '../fields/button';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// Workshops come from EMS, merged with the CMS ones by title. The list is split
// into free and pass-only groups, and each group has its own heading here.
export const Workshops: Block = {
	slug: 'workshops',
	interfaceName: 'WorkshopsBlock',
	labels: { singular: 'Workshops', plural: 'Workshop sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			simpleRichText('description'),
			{
				name: 'links',
				type: 'array',
				maxRows: 2,
				labels: { singular: 'Link', plural: 'Links' },
				admin: rowLabel('Link'),
				fields: [
					{ name: 'note', type: 'text' },
					{ name: 'button', type: 'group', fields: button() },
				],
			},
		],
	}),
};
