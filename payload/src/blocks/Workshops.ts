import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';
import { uniqueBy } from '@/fields/uniqueValidation';

// Which ticket a workshop needs comes from EMS; the button that sells it is
// authored here, one row per type.
const WORKSHOP_TYPES = [
	{ label: 'Full ticket workshop', value: 'free' },
	{ label: 'Workshop pass', value: 'pass' },
	{ label: 'Pro workshop', value: 'pro' },
];

// Workshops themselves come from EMS. Authored here: the copy above the list,
// the ticket button per workshop type, and the row of links under the list.
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
		tabs: [
			{
				label: 'Settings',
				fields: [
					{
						name: 'typeButtons',
						type: 'array',
						maxRows: WORKSHOP_TYPES.length,
						labels: { singular: 'Button', plural: 'Buttons' },
						admin: rowLabel('Button', {
							labelFrom: 'type',
							labels: Object.fromEntries(WORKSHOP_TYPES.map(({ label, value }) => [value, label])),
						}),
						validate: uniqueBy('type'),
						defaultValue: [
							{ type: 'free', button: { label: 'Get Full Ticket', url: '#tickets' } },
							{ type: 'pass', button: { label: 'Get in-person workshop pass', url: '/checkout#workshops' } },
							{ type: 'pro', button: { label: 'Get workshop', url: '/checkout#workshops' } },
						],
						fields: [
							{ name: 'type', type: 'select', options: WORKSHOP_TYPES, defaultValue: 'free', required: true },
							{ name: 'button', type: 'group', fields: button({ variant: false, openInNewTab: false }) },
						],
					},
				],
			},
		],
	}),
};
