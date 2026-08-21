import type { RichTextField } from 'payload';
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

// Section rich text: inline formatting — bold, italic, underline, links — plus
// bullet and numbered lists. No headings, no code. Long-form page content will
// get its own full-editor factory when a page actually needs one.
//
// Stored as Lexical JSON; the Pages afterRead hook serializes every rich field
// to a `<field>Html` sibling for the static build.

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

// A default for a rich text field: Lexical has no plain-text shorthand, so the
// one-paragraph state is spelled out. Pass it as `defaultValue`.
export const richTextValue = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
        children: [
          { type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 },
        ],
      },
    ],
  },
});

export const simpleRichText = (name: string, overrides: Partial<RichTextField> = {}): RichTextField =>
  deepMerge<RichTextField>(
    {
      name,
      type: 'richText',
      editor: simpleRichTextEditor,
    } as RichTextField,
    overrides
  );
