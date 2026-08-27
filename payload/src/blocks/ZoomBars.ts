import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// Afterparty bars. Like Discussions, the rooms come from EMS — only the text
// above them is authored.
export const ZoomBars: Block = {
	slug: 'zoomBars',
	interfaceName: 'ZoomBarsBlock',
	labels: { singular: 'Zoom bars', plural: 'Zoom bar sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [{ name: 'title', type: 'text' }, ...simpleRichText('description')],
	}),
};
