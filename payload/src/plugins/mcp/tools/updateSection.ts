import type { PayloadRequest } from 'payload';
import { z } from 'zod';
import { richTextValue } from '@/fields/richTextField';
import { compactSection } from '@/plugins/mcp/utils/compactSection';
import { findPage } from '@/plugins/mcp/utils/findPage';
import { resolveSection, type Section } from '@/plugins/mcp/utils/resolveSection';
import { deepMerge } from '@/utils/deepMerge';

// The `<field>Html` siblings are virtual — they exist only on read, so they must not
// travel back into the document.
const stripSerialized = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(stripSerialized);
	if (!value || typeof value !== 'object') return value;

	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>)
			.filter(([key]) => !key.endsWith('Html'))
			.map(([key, raw]) => [key, stripSerialized(raw)])
	);
};

// A plain string where the section keeps rich text becomes the one-paragraph Lexical
// value the field expects — otherwise every text edit would mean hand-writing that tree.
const toFieldValues = (section: Section, patch: Record<string, unknown>) =>
	Object.fromEntries(
		Object.entries(patch).map(([key, value]) =>
			typeof value === 'string' && `${key}Html` in section ? [key, richTextValue(value)] : [key, value]
		)
	);

const handler = async (args: Record<string, unknown>, req: PayloadRequest) => {
	const { brand, eventYear, pageKey, section: selector, patch } = args as {
		brand: string;
		eventYear: string;
		pageKey: string;
		section: string;
		patch: string;
	};

	let parsed: Record<string, unknown>;
	try {
		parsed = JSON.parse(patch) as Record<string, unknown>;
	} catch {
		throw new Error(`patch is not valid JSON: ${patch}`);
	}

	const page = await findPage(req, { brand, eventYear, pageKey });
	const sections = (page.sections ?? []).map(stripSerialized) as Section[];
	const { index, section } = resolveSection(page.sections ?? [], selector);

	sections[index] = deepMerge(sections[index], toFieldValues(section, parsed));

	const updated = await req.payload.update({
		collection: 'pages',
		id: page.id,
		data: { sections },
		depth: 0,
		overrideLock: true,
	});

	const saved = (updated.sections ?? [])[index];

	return {
		content: [
			{
				type: 'text' as const,
				text: `Updated ${brand} / ${eventYear} / ${pageKey} #${index + 1} ${section.blockType}\n\n${JSON.stringify(compactSection(saved), null, 2)}`,
			},
		],
	};
};

export const updateSection = {
	name: 'updateSection',
	description:
		'Change one section of one page. Send only the fields that differ — the server merges them into the page, so the other sections are never rewritten. Objects merge field by field, arrays and scalars are replaced whole, and a plain string given for a rich text field becomes a single paragraph.',
	parameters: {
		brand: z.string().describe('Brand title, e.g. Amsterdam_JSNation'),
		eventYear: z.string().describe('Event year of the edition, e.g. Y2027'),
		pageKey: z.string().describe('Page key, e.g. main, faq, checkout'),
		section: z.string().describe('Position from the outline ("#1") or the block type ("hero")'),
		patch: z.string().describe('JSON object of the fields to change, e.g. {"date":"June 12, 2027"}'),
	},
	handler,
};
