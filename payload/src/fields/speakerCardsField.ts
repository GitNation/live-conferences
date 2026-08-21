import type { Field } from 'payload';
import { button } from '@/fields/buttonFields';
import { hidden } from '@/fields/hiddenField';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { uniqueBy } from '@/fields/uniqueValidation';

type CardKind = { label: string; value: string };

// `value` is the css suffix the template appends: jsn styles the three the same,
// jsnus and rs do not.
export const CARD_KINDS = {
	cfp: { label: 'CFP', value: 'cfp' },
	propose: { label: 'Propose a speaker', value: 'ask' },
	more: { label: 'More speakers', value: 'more' },
};

// The cards that sit in the same grid as the people. Taken by the speakers
// section with all three kinds, and by past speakers with one.
export const speakerCards = (kinds: CardKind[]): Field => ({
	name: 'cards',
	type: 'array',
	maxRows: kinds.length,
	labels: { singular: 'Card', plural: 'Cards' },
	admin: rowLabel('Card', {
		labelFrom: 'kind',
		labels: Object.fromEntries(kinds.map(({ label, value }) => [value, label])),
	}),
	validate: uniqueBy('kind'),
	fields: [
		hidden,
		{
			name: 'kind',
			type: 'select',
			options: kinds,
			defaultValue: kinds[0].value,
			required: true,
		},
		{ name: 'title', type: 'text' },
		simpleRichText('description'),
		{
			name: 'buttons',
			type: 'array',
			maxRows: 2,
			labels: { singular: 'Button', plural: 'Buttons' },
			admin: rowLabel('Button'),
			fields: button(),
		},
	],
});
