const NOISE = new Set(['id', 'blockName']);

const isEmpty = (value: unknown) => value === null || value === undefined || (Array.isArray(value) && value.length === 0);

// Lexical trees and their `<field>Html` siblings are three quarters of a page
// document, and the tree itself is unreadable for a model. Keep the html under the
// plain field name — the same swap the static build makes — and drop the rest of
// the noise, so one section costs hundreds of tokens instead of thousands.
export const compactSection = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(compactSection);
	if (!value || typeof value !== 'object') return value;

	const source = value as Record<string, unknown>;
	const serialized = new Set(Object.keys(source).filter((key) => key.endsWith('Html')));

	const entries = Object.entries(source).flatMap(([key, raw]) => {
		if (NOISE.has(key) || serialized.has(`${key}Html`)) return [];

		const compacted = compactSection(raw);
		if (isEmpty(compacted)) return [];

		const name = key.endsWith('Html') ? key.slice(0, -'Html'.length) : key;
		return [[name, compacted] as const];
	});

	return Object.fromEntries(entries);
};
