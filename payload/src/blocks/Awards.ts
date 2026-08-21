import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// JS Open Source Awards: the pitch, the list of nominations and a link to
// submit a project. The award artwork next to it is markup, not content.
export const Awards: Block = {
	slug: 'awards',
	interfaceName: 'AwardsBlock',
	labels: { singular: 'Awards', plural: 'Award sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			simpleRichText('description'),
			{
				name: 'nominations',
				type: 'group',
				fields: [
					{ name: 'title', type: 'text' },

					{
						name: 'items',
						type: 'array',
						labels: { singular: 'Nomination', plural: 'Nominations' },
						admin: rowLabel('Nomination'),
						fields: [{ name: 'title', type: 'text', required: true }],
					},
				],
			},

			{
				name: 'buttons',
				type: 'array',
				maxRows: 2,
				labels: { singular: 'Button', plural: 'Buttons' },
				admin: rowLabel('Button'),
				fields: button(),
			},
		],
	}),
};
