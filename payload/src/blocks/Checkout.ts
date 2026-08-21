import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { hidden } from '@/fields/hiddenField';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The ticket page: one Tito widget per tab above the tickets, the price steps in
// the header, and the three panels beside the widgets.
//
// The headings the checkout builds over the tickets themselves are not here yet —
// they still come from the browser script and Hygraph. See "Checkout: ticket
// sections" in docs/TECH-DEBT.md.
export const Checkout: Block = {
	slug: 'checkout',
	interfaceName: 'CheckoutBlock',
	labels: { singular: 'Checkout', plural: 'Checkout sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{
				// A single widget renders without tabs, so `label` only shows with two.
				name: 'widgets',
				type: 'array',
				minRows: 1,
				maxRows: 2,
				labels: { singular: 'Widget', plural: 'Widgets' },
				admin: rowLabel('Widget'),
				fields: [
					{ name: 'label', type: 'text', required: true },
					{
						// The ti.to link to the event, pasted whole. A trailing slash goes:
						// the widget takes the path out of this link and chokes on it.
						name: 'event',
						type: 'text',
						required: true,
						hooks: { beforeChange: [({ value }) => (value || '').trim().replace(/\/+$/, '')] },
					},
				],
			},
			{
				name: 'priceIncrease',
				type: 'group',
				fields: [
					// Every edition has called this the same thing for years.
					{ name: 'title', type: 'text', defaultValue: 'Price Increase' },
					{
						name: 'items',
						type: 'array',
						labels: { singular: 'Step', plural: 'Steps' },
						admin: rowLabel('Step'),
						fields: [
							{ name: 'title', type: 'text' },
							{ name: 'date', type: 'text' },
							{ name: 'price', type: 'text' },
							{ name: 'isActive', type: 'checkbox', defaultValue: false },
						],
					},
				],
			},
			{
				name: 'whatToExpect',
				type: 'group',
				fields: [{ name: 'title', type: 'text' }, simpleRichText('description')],
			},
			{
				name: 'addons',
				type: 'group',
				fields: [
					{ name: 'title', type: 'text' },
					{
						name: 'items',
						type: 'array',
						labels: { singular: 'Addon', plural: 'Addons' },
						admin: rowLabel('Addon'),
						fields: [
							hidden,
							{ name: 'title', type: 'text', required: true },
							simpleRichText('description'),
							{ name: 'isMultipass', type: 'checkbox', defaultValue: false },
							// Always the same style, always same-tab — label and url only.
							{ name: 'cta', type: 'group', fields: button({ variant: false, openInNewTab: false }) },
						],
					},
				],
			},
			{
				name: 'waitlistForm',
				type: 'group',
				fields: [
					// The wording every edition has shipped with.
					{ name: 'title', type: 'text', defaultValue: 'Not Ready to Buy?' },
					simpleRichText('description'),
					{ name: 'formLink', type: 'text' },
				],
			},
		],
	}),
};
