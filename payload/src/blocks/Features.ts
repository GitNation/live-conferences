import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The features mosaic — tiles of two widths laid out in a grid. A tile is
// either a card (image, plus a title and description revealed on hover) or the
// video player; the type picks which fields the editor sees.
//
// Hygraph had one shape for both and decided by "is videoId filled in", with
// the hover state and the networking flag in a customData blob; neither of
// those is read by any template, so they are not modelled here.
const isCard = (_: unknown, siblingData: Record<string, unknown>) => siblingData?.type !== 'video';
export const Features: Block = {
	slug: 'features',
	interfaceName: 'FeaturesBlock',
	labels: { singular: 'Features', plural: 'Feature sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		content: [
			{ name: 'title', type: 'text' },
			{
				name: 'items',
				type: 'array',
				labels: { singular: 'Feature', plural: 'Features' },
				admin: rowLabel('Feature'),
				fields: [
					{
						name: 'type',
						type: 'select',
						options: [
							{ label: 'Card', value: 'card' },
							{ label: 'Video', value: 'video' },
						],
						defaultValue: 'card',
						required: true,
					},
					{
						name: 'width',
						type: 'select',
						options: [
							{ label: 'Quarter (one column)', value: 'quarter' },
							{ label: 'Half (two columns)', value: 'half' },
						],
						defaultValue: 'quarter',
						required: true,
					},
					{ name: 'title', type: 'text', admin: { condition: isCard } },
					...simpleRichText('description', { admin: { condition: isCard } }),
					{ name: 'image', type: 'upload', relationTo: 'media', admin: { condition: isCard } },
					{ name: 'url', type: 'text', admin: { condition: isCard } },
					{
						// YouTube id of the video the play button opens.
						name: 'videoId',
						type: 'text',
						admin: { condition: (_, siblingData) => siblingData?.type === 'video' },
					},
					{ name: 'hiddenOnMobile', type: 'checkbox', defaultValue: false },
				],
			},
		],
	}),
};
