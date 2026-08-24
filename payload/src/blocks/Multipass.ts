import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

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
			...simpleRichText('description'),
			{ name: 'button', type: 'group', fields: button() },
		],
	}),
};
