import type { Block } from 'payload';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';
import { CARD_KINDS, speakerCards } from '@/fields/speakerCardsField';

// Speakers of earlier editions, pulled from EMS.
// The list itself is fetched at build time and is never authored here.
export const PastSpeakers: Block = {
	slug: 'pastSpeakers',
	interfaceName: 'PastSpeakersBlock',
	labels: { singular: 'Past speakers', plural: 'Past speaker sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [{ name: 'title', type: 'text' }, speakerCards([CARD_KINDS.more])],
	}),
};
