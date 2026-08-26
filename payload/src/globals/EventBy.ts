import type { GlobalConfig } from 'payload';
import { anyone, editor } from '@/access';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';

// The organiser credit in the footer basement — "Event by GitNation". Same for every brand
// and edition, which is why it is a global rather than a field on the conference.
export const EventBy: GlobalConfig = {
	slug: 'event-by',
	label: 'Event by',
	access: {
		read: anyone,
		update: editor,
	},
	admin: { group: 'Global components' },
	fields: [
		{ name: 'label', type: 'text', defaultValue: 'Event by' },
		{
			name: 'link',
			type: 'group',
			fields: button({
				variant: false,
				overrides: {
					label: { defaultValue: 'GitNation' },
					url: { defaultValue: 'https://gitnation.org' },
				},
			}),
		},
		// The partnership pitch beside the credit. Its contact address is a link inside the
		// text, so this is rich text — `simpleRichText` carries its own serializing sibling,
		// and the bridge swaps that in, so templates still receive HTML.
		...simpleRichText('text'),
	],
};
