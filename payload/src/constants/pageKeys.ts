export const PAGES = [
	{ key: 'main', label: 'Main', slug: 'index' },
	{ key: 'faq', label: 'FAQ' },
	{ key: 'checkout', label: 'Checkout' },
	{ key: 'schedule', label: 'Schedule', slug: 'schedule-offline' },
	{ key: 'workshops', label: 'Workshops' },
	{ key: 'workshops_alt', label: 'Remote workshops', slug: 'remote-workshops' },
	{ key: 'preEvent', label: 'Pre-event', slug: 'pre-event' },
	{ key: 'jobs', label: 'Jobs' },
	{ key: 'perks', label: 'Perks' },
	{ key: 'teams', label: 'Teams' },
];

export const PAGE_KEYS = PAGES.map(({ key, label }) => ({ label, value: key }));

// Undefined when there is no key to derive from — a partial update carries only the
// fields it changes, and returning a number there would overwrite the stored order.
export const orderForKey = (key?: string | null) => {
	if (!key) return undefined;
	const index = PAGES.findIndex((page) => page.key === key);
	return index === -1 ? PAGES.length : index;
};
