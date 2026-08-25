import type { Field, Tab } from 'payload';
import { hidden } from '@/fields/hiddenField';

// Nothing to tint without a background, so the overlay fields stay hidden until
// there is one. Left empty, overlay means no tint at all.
const hasBackground = (_: unknown, siblingData: Record<string, unknown>) => !!siblingData?.background;

type SectionTabsArgs = {
	content: Field[];
	tabs?: Tab[];
	style?: Field[] | false;
};

export const sectionTabs = ({ content, tabs = [], style = [] }: SectionTabsArgs): Field[] => [
	hidden,
	{
		type: 'tabs',
		tabs: [
			{ label: 'Content', fields: content },
			...tabs,
			...(style === false
				? []
				: [
						{
							// The Style tab every section gets: an optional background asset
							// (image or video, from the background/image and background/video
							// folders) and a black or white overlay on top of it.
							label: 'Style',
							fields: [
								{ name: 'background', type: 'upload', relationTo: 'media' },
								{
									name: 'overlay',
									type: 'select',
									options: [
										{ label: 'Black', value: 'black' },
										{ label: 'White', value: 'white' },
									],
									defaultValue: 'black',
									admin: { condition: hasBackground },
								},
								{
									name: 'overlayOpacity',
									type: 'number',
									label: 'Overlay opacity (%)',
									defaultValue: 50,
									min: 0,
									max: 100,
									admin: {
										step: 10,
										condition: (data: unknown, siblingData: Record<string, unknown>) =>
											hasBackground(data, siblingData) && !!siblingData?.overlay,
									},
								},
								...style,
							] as Field[],
						},
					]),
		],
	},
];

export const sectionAdmin = {
	components: { Label: '@/components/CollapsedLabel#CollapsedLabel' },
};
