import type { Field, Tab } from 'payload';
import { sectionStyleFields } from '@/fields/background';
import { hidden } from '@/fields/hiddenField';

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
			...(style === false ? [] : [{ label: 'Style', fields: [...sectionStyleFields(), ...style] }]),
		],
	},
];

export const sectionAdmin = {
	components: { Label: '@/components/CollapsedLabel#CollapsedLabel' },
};
