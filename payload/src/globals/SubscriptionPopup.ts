import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '@/access';

// Newsletter popup, same wording for every brand and edition. Whether a page
// shows it is the `components` checkbox on the conference.
export const SubscriptionPopup: GlobalConfig = {
	slug: 'subscription-popup',
	label: 'Subscription popup',
	access: {
		read: anyone,
		update: authenticated,
	},
	admin: { group: 'Global components' },
	fields: [
		{ name: 'title', type: 'text', defaultValue: 'Follow us for updates' },
		{
			name: 'description',
			type: 'text',
			defaultValue: 'Sign up to newsletter to receive conference updates & exclusive deals',
		},
		// Mailchimp needs POST and its own field names; the template reads that
		// off the url, so pasting a list-manage.com link is enough.
		{
			name: 'formAction',
			type: 'text',
			defaultValue: 'https://gitnation.com/newsletter-preferences',
		},
	],
};
