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
		// Search engines truncate beyond ~60/~160 chars, so the counter is what an
		// editor should watch. The caps sit above that on purpose: descriptions
		// coming over from Hygraph run to ~215, and cutting real copy to fit a soft
		// limit is the wrong trade.
		limited('title', 'text', 80),
		limited('description', 'textarea', 250),
		limited('keywords', 'text', 255),
	],
};
