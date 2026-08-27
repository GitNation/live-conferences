import type { Field, RichTextField } from 'payload';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';
import { deepMerge } from '@/utils/deepMerge';
import {
	BoldFeature,
	FixedToolbarFeature,
	ItalicFeature,
	LinkFeature,
	OrderedListFeature,
	ParagraphFeature,
	UnderlineFeature,
	UnorderedListFeature,
	lexicalEditor,
} from '@payloadcms/richtext-lexical';

export const simpleRichTextEditor = lexicalEditor({
	features: () => [
		ParagraphFeature(),
		BoldFeature(),
		ItalicFeature(),
		UnderlineFeature(),
		LinkFeature({ enabledCollections: [] }),
		UnorderedListFeature(),
		OrderedListFeature(),
		// Always-visible toolbar; without it Lexical only shows the floating one
		// on text selection.
		FixedToolbarFeature(),
	],
});

export const richTextValue = (text: string) => ({
	root: {
		type: 'root',
		direction: 'ltr',
		format: '',
		indent: 0,
		version: 1,
		children: [
			{
				type: 'paragraph',
				direction: 'ltr',
				format: '',
				indent: 0,
				version: 1,
				children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
			},
		],
	},
});

const htmlSibling = (name: string): Field => ({
	name: `${name}Html`,
	type: 'text',
	virtual: true,
	admin: { hidden: true },
	hooks: {
		afterRead: [
			({ siblingData }) => {
				const value = siblingData?.[name] as Parameters<typeof convertLexicalToHTML>[0]['data'] | undefined;
				return value ? convertLexicalToHTML({ data: value }) : null;
			},
		],
	},
});

export const simpleRichText = (name: string, overrides: Partial<RichTextField> = {}): Field[] => [
	deepMerge<RichTextField>(
		{
			name,
			type: 'richText',
			editor: simpleRichTextEditor,
		} as RichTextField,
		overrides
	),
	htmlSibling(name),
];
