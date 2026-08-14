import type { Block } from 'payload';
import { button } from '../fields/button';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// GitNation Multipass promo. The card artwork, the conference slider and the
// deep dives list are markup — the last one is the same for every conference
// and is going to become shared content later; only the copy and the CTA are
// editable here.
export const Multipass: Block = {
	slug: 'multipass',
	interfaceName: 'MultipassBlock',
	labels: { singular: 'Multipass', plural: 'Multipass sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			simpleRichText('description'),
			{
				// An array rather than a group: one collapsed row instead of four
				// always-open fields, and no button at all is just an empty list.
				name: 'buttons',
				type: 'array',
				maxRows: 1,
				labels: { singular: 'Button', plural: 'Buttons' },
				admin: rowLabel('Button'),
				fields: button(),
			},
		],
	}),
};
