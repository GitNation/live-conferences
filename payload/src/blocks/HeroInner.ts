import type { Block } from 'payload';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The short hero every inner page opens with — one line of text over a picture.
// The logo and the link back to the main page are the same everywhere, so they
// stay in the markup; only the title and the background are authored.
export const HeroInner: Block = {
	slug: 'heroInner',
	interfaceName: 'HeroInnerBlock',
	labels: { singular: 'Hero inner', plural: 'Hero inner sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [{ name: 'title', type: 'text', required: true }],
	}),
};
