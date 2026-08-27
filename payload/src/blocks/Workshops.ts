import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// Workshops themselves come from EMS. Authored here: the copy above the list and the row of
// links under it. The button per ticket type lives on the conference instead (Settings tab) —
// the workshop dialog needs the same three buttons, and two copies would drift apart.
export const Workshops: Block = {
	slug: 'workshops',
	interfaceName: 'WorkshopsBlock',
	labels: { singular: 'Workshops', plural: 'Workshop sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			...simpleRichText('description'),
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
