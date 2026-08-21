import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The tech logos strip: a heading and a list of logo + name cards.
//
// Usable in two places with one definition: on its own in a page's `sections`,
// or dropped into another section's `blocks` slot (see Event) — a conference
// decides where it lives without a second schema or a second template.
export const Techs: Block = {
	slug: 'techs',
	interfaceName: 'TechsBlock',
	labels: { singular: 'Techs', plural: 'Tech sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			simpleRichText('description'),
			{
				name: 'items',
				type: 'array',
				labels: { singular: 'Tech', plural: 'Techs' },
				admin: rowLabel('Tech'),
				fields: [
					{ name: 'title', type: 'text', required: true },
					{ name: 'icon', type: 'upload', relationTo: 'media' },
					{ name: 'url', type: 'text' },
				],
			},
		],
	}),
};
