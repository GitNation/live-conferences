import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { hidden } from '@/fields/hiddenField';
import { richTextValue, simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

export const Checkout: Block = {
	slug: 'checkout',
	interfaceName: 'CheckoutBlock',
	labels: { singular: 'Checkout', plural: 'Checkout sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		style: false,
		content: [
			{
				name: 'widgets',
				type: 'array',
				minRows: 1,
				maxRows: 2,
				labels: { singular: 'Widget', plural: 'Widgets' },
				admin: rowLabel('Widget'),
				fields: [
					{ name: 'label', type: 'text', required: true },
					{
						name: 'event',
						type: 'text',
						required: true,
						hooks: { beforeChange: [({ value }) => (value || '').trim().replace(/\/+$/, '')] },
					},
				],
			},
			{ name: 'multipassBanner', type: 'checkbox', label: 'Show multipass banner', defaultValue: true },
		],
		tabs: [
			{
				label: 'Price increase',
				fields: [
					{
						name: 'priceIncrease',
						type: 'group',
						label: false,
						fields: [
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
				],
			},
			{
				label: 'Sidebar',
				fields: [
					{
						name: 'whatToExpect',
						type: 'group',
						label: 'What to expect',
						fields: [{ name: 'title', type: 'text' }, ...simpleRichText('description')],
					},
					{
						name: 'addons',
						type: 'group',
						label: 'Add-ons',
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
									...simpleRichText('description'),
									{ name: 'isMultipass', type: 'checkbox', defaultValue: false },
									{ name: 'cta', type: 'group', fields: button({ variant: false, openInNewTab: false }) },
								],
							},
						],
					},
					{
						name: 'waitlistForm',
						type: 'group',
						label: 'Waitlist form',
						fields: [
							{ name: 'title', type: 'text', defaultValue: 'Not Ready to Buy?' },
							...simpleRichText('description', {
								defaultValue: richTextValue('Leave your details to get updates on discounts and special offers'),
							}),
							{ name: 'formLink', type: 'text' },
						],
					},
				],
			},
		],
	}),
};
