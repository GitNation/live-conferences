import type { Field } from 'payload';

const WORKSHOP_BUTTONS = [
	{ type: 'free', label: 'Full ticket workshop', text: 'Get Full Ticket', link: '#tickets' },
	{ type: 'pass', label: 'Workshop pass', text: 'Get in-person workshop pass', link: '/checkout#workshops' },
	{ type: 'pro', label: 'Pro workshop', text: 'Get workshop', link: '/checkout#workshops' },
];

export const settingsFields = (): Field[] => [
	{
		name: 'workshopButtons',
		type: 'group',
		fields: WORKSHOP_BUTTONS.map(({ type, label, text, link }) => ({
			name: type,
			type: 'group',
			label,
			fields: [
				{
					type: 'row',
					fields: [
						{ name: 'text', type: 'text', defaultValue: text, admin: { width: '50%' } },
						{ name: 'link', type: 'text', defaultValue: link, admin: { width: '50%' } },
					],
				},
			],
		})),
	},
	{
		name: 'optionalBlocks',
		type: 'group',
		fields: [
			{ name: 'subscriptionPopup', type: 'checkbox', defaultValue: true },
			{ name: 'multipassBanner', type: 'checkbox', label: 'Multipass banner in the tickets block', defaultValue: true },
		],
	},
];
