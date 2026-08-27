import type { GlobalConfig } from 'payload';
import { anyone, editor } from '@/access';
import { button } from '@/fields/buttonFields';

// The "event is over" bar. On every page — the browser script decides when it
// appears, so there is no switch to flip.
export const NoticePanel: GlobalConfig = {
	slug: 'notice-panel',
	label: 'Notice panel',
	access: {
		read: anyone,
		update: editor,
	},
	admin: { group: 'Global components' },
	fields: [
		{
			name: 'description',
			type: 'text',
			defaultValue: 'This event is over. Do not miss others with GitNation multipass.',
		},
		{
			name: 'button',
			type: 'group',
			fields: button({
				variant: false,
				openInNewTab: false,
				overrides: {
					label: { defaultValue: 'Learn about multipass' },
					url: { defaultValue: 'https://gitnation.com/multipass' },
				},
			}),
		},
	],
};
