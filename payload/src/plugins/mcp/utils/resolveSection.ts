import type { Page } from '@/payload-types';

export type Section = NonNullable<Page['sections']>[number];

// `#1`, `1` and `hero` all address the same block: the outline prints numbers,
// but an agent that already read the page reaches for the block type instead.
export const resolveSection = (sections: Section[], selector: string): { index: number; section: Section } => {
	const trimmed = selector.trim().replace(/^[#/]/, '');
	const position = Number(trimmed);

	const index =
		Number.isInteger(position) && position > 0 ? position - 1 : sections.findIndex((section) => section.blockType === trimmed);
	const section = sections[index];

	if (!section) {
		const outline = sections.map((entry, order) => `#${order + 1} ${entry.blockType}`).join(', ');
		throw new Error(`No section "${selector}" on this page. It has: ${outline}`);
	}

	return { index, section };
};
