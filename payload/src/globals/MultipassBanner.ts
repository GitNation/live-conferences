import type { GlobalConfig } from 'payload';
import { anyone, editor } from '@/access';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';

export const MultipassBanner: GlobalConfig = {
	slug: 'multipass-banner',
	label: 'Multipass banner',
	access: {
		read: anyone,
		update: editor,
	},
	admin: { group: 'Global components' },
	fields: [
		{ name: 'title', type: 'text' },
		{
			name: 'logos',
			type: 'array',
			labels: { singular: 'Logo', plural: 'Logos' },
			admin: rowLabel('Logo'),
			fields: [
				{ name: 'image', type: 'upload', relationTo: 'media', required: true },
				{ name: 'url', type: 'text' },
			],
		},

		{
			name: 'price',
			type: 'group',
			fields: [
				{
					type: 'row',
					fields: [
						{ name: 'current', type: 'text', admin: { width: '50%' } },
						{ name: 'billingPeriod', type: 'text', admin: { width: '50%' } },
					],
				},
				{ name: 'teamPass', type: 'text' },
				...simpleRichText('description'),
			],
		},
		{
			name: 'button',
			type: 'group',
			fields: button({
				variant: false,
				openInNewTab: false,
			}),
		},
	],
};
