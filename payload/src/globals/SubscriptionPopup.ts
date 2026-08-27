import type { GlobalConfig } from 'payload';
import { anyone, editor } from '@/access';

// Newsletter popup, same wording for every brand and edition. Whether a page
// shows it is the `components` checkbox on the conference.
export const SubscriptionPopup: GlobalConfig = {
	slug: 'subscription-popup',
	label: 'Subscription popup',
	access: {
		read: anyone,
		update: editor,
	},
	admin: { group: 'Global components' },
	fields: [
		{ name: 'title', type: 'text', defaultValue: 'Follow us for updates' },
		{
			name: 'description',
			type: 'text',
			defaultValue: 'Sign up to newsletter to receive conference updates & exclusive deals',
		},
	],
};
