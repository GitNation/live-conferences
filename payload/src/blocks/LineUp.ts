import type { Block } from 'payload';
import { richTextValue, simpleRichText } from '@/fields/richTextField';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

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
			// Both read the same on every conference, so they are defaults, not copy
			// an editor has to retype for each edition.
			{ name: 'title', type: 'text', defaultValue: 'Line-up' },
			...simpleRichText('note', { defaultValue: richTextValue('find more speakers & talks below') }),
		],
	}),
};
