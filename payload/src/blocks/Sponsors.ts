import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// Partner logos come from EMS, added to the ones kept in the CMS, and are laid
// out by tier (platinum, gold, silver, bronze). Authored here: the copy and the
// "become a sponsor" pitch under the logos.
export const Sponsors: Block = {
	slug: 'sponsors',
	interfaceName: 'SponsorsBlock',
	labels: { singular: 'Sponsors', plural: 'Sponsor sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [{ name: 'title', type: 'text' }, ...simpleRichText('description'), ...simpleRichText('offer')],
	}),
};
