import type { Block, Field } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

const phaseButtons = (name: string, label: string): Field => ({
	name,
	type: 'array',
	label,
	maxRows: 2,
	labels: { singular: 'Button', plural: 'Buttons' },
	admin: rowLabel('Button'),
	fields: button(),
});

const switchGroup = (): Field => ({
	name: 'switch',
	type: 'group',
	fields: [
		{ name: 'leftLabel', type: 'text' },
		{ name: 'rightLabel', type: 'text' },
		{ name: 'url', type: 'text' },
		{ name: 'rightIsActive', type: 'checkbox', defaultValue: false },
	],
});

export const Hero: Block = {
	slug: 'hero',
	interfaceName: 'HeroBlock',
	labels: { singular: 'Hero', plural: 'Hero sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text', required: true },
			{ name: 'date', type: 'text' },
			...simpleRichText('description'),
			{
				name: 'stats',
				type: 'array',
				labels: { singular: 'Stat', plural: 'Stats' },
				admin: rowLabel('Stat'),
				fields: [
					{ name: 'value', type: 'text', required: true },
					{ name: 'description', type: 'text', required: true },
				],
			},
			{
				name: 'buttons',
				type: 'group',
				fields: [
					phaseButtons('default', 'Before the conference (default)'),
					phaseButtons('daysBefore', 'Conference days, before start'),
					phaseButtons('during', 'While live'),
					phaseButtons('weekAfter', 'Week after'),
				],
			},
			switchGroup(),
		],
	}),
};
