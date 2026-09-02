import type { PayloadRequest } from 'payload';
import { z } from 'zod';
import { compactSection } from '@/plugins/mcp/utils/compactSection';
import { findPage } from '@/plugins/mcp/utils/findPage';
import { resolveSection } from '@/plugins/mcp/utils/resolveSection';

const handler = async (args: Record<string, unknown>, req: PayloadRequest) => {
	const { brand, eventYear, pageKey, section: selector } = args as {
		brand: string;
		eventYear: string;
		pageKey: string;
		section: string;
	};

	const page = await findPage(req, { brand, eventYear, pageKey });
	const { index, section } = resolveSection(page.sections ?? [], selector);

	return {
		content: [
			{
				type: 'text' as const,
				text: `${brand} / ${eventYear} / ${pageKey} #${index + 1} ${section.blockType}\n\n${JSON.stringify(compactSection(section), null, 2)}\n\nChange it with updateSection — send only the fields that differ.`,
			},
		],
	};
};

export const getSection = {
	name: 'getSection',
	description:
		'One section of one page, with rich text already serialized to html and empty fields dropped. Use it instead of reading the whole page.',
	parameters: {
		brand: z.string().describe('Brand title, e.g. Amsterdam_JSNation'),
		eventYear: z.string().describe('Event year of the edition, e.g. Y2027'),
		pageKey: z.string().describe('Page key, e.g. main, faq, checkout'),
		section: z.string().describe('Position from the outline ("#1") or the block type ("hero")'),
	},
	handler,
};
