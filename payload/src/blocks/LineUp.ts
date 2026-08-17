import type { Block } from 'payload';
import { simpleRichText } from '../fields/richText';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// A strip of announced talks — speaker and talk title, taken from EMS. Only
// renders once enough talks are announced, so it also carries the line shown
// under the strip while the line-up is still filling up.
export const LineUp: Block = {
	slug: 'lineUp',
	interfaceName: 'LineUpBlock',
	labels: { singular: 'Line-up', plural: 'Line-up sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			// e.g. "and more to be announced...".
			simpleRichText('note'),
		],
	}),
};
