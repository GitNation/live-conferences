import type { RichTextField } from 'payload';
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

export const simpleRichText = (name: string, overrides: Partial<RichTextField> = {}): RichTextField =>
  ({
    name,
    type: 'richText',
    editor: simpleRichTextEditor,
    ...overrides,
  }) as RichTextField;
