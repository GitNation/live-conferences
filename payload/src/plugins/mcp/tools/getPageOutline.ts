import type { PayloadRequest } from 'payload';
import { z } from 'zod';
import { findPage } from '@/plugins/mcp/utils/findPage';

const handler = async (args: Record<string, unknown>, req: PayloadRequest) => {
	const { brand, eventYear, pageKey } = args as { brand: string; eventYear: string; pageKey: string };
	const page = await findPage(req, { brand, eventYear, pageKey });
	const sections = page.sections ?? [];

	const outline = sections.map((section, index) => `#${index + 1} ${section.blockType}${section.hidden ? ' (hidden)' : ''}`).join('\n');

	return {
		content: [
			{
				type: 'text' as const,
				text: `${brand} / ${eventYear} / ${pageKey} — ${sections.length} sections\n\n${outline || 'No sections yet.'}\n\nCall getSection with the number ("#1") or the block type ("hero").`,
			},
		],
	};
};

export const getPageOutline = {
	name: 'getPageOutline',
	description:
		'The ordered blocks of one page: position, block type and whether it is hidden. Costs a few hundred tokens whatever the page weighs, so read this before touching any section.',
	parameters: {
		brand: z.string().describe('Brand title, e.g. Amsterdam_JSNation'),
		eventYear: z.string().describe('Event year of the edition, e.g. Y2027'),
		pageKey: z.string().describe('Page key, e.g. main, faq, checkout'),
	},
	handler,
};
