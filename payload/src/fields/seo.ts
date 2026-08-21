import type { Field, Tab } from 'payload';

const limited = (name: string, type: 'text' | 'textarea', max: number): Field =>
	({
		name,
		type,
		maxLength: max,
		admin: {
			components: {
				afterInput: [{ path: '@/components/CharCounterBar#CharCounterBar', clientProps: { max } }],
			},
		},
	} as Field);

export const seoTab: Tab = {
	name: 'seo',
	label: 'SEO',
	fields: [
		// Search engines truncate beyond ~60/~160 chars.
		limited('title', 'text', 60),
		limited('description', 'textarea', 160),
		limited('keywords', 'text', 255),
	],
};
