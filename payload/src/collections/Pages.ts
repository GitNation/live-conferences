import type { CollectionConfig } from 'payload';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';
import { anyone, authenticated } from '../access';
import { DeepDives } from '../blocks/DeepDives';
import { Diversity } from '../blocks/Diversity';
import { Event } from '../blocks/Event';
import { Features } from '../blocks/Features';
import { FreeTicket } from '../blocks/FreeTicket';
import { FullTicket } from '../blocks/FullTicket';
import { Hero } from '../blocks/Hero';
import { Location } from '../blocks/Location';
import { Multipass } from '../blocks/Multipass';
import { Party } from '../blocks/Party';
import { Prices } from '../blocks/Prices';
import { Techs } from '../blocks/Techs';
import { uniqueBlocks } from '../fields/uniqueBlocks';
import { seoTab } from '../fields/seo';
import { PAGE_KEYS, slugForKey } from '../pageKeys';
import { pageUrl, previewBreakpoints } from '../preview';

// Rich text is stored as Lexical JSON, but the static build consumes HTML
// strings. Walk the section blocks and add a serialized `<field>Html` sibling
// next to every rich text field — the admin keeps editing the JSON, the Gulp
// bridge swaps the HTML in under the plain field name.
const isLexical = (value: unknown): value is Parameters<typeof convertLexicalToHTML>[0]['data'] =>
  !!value && typeof value === 'object' && 'root' in (value as object);

const serializeRichText = (node: unknown): void => {
  if (Array.isArray(node)) {
    node.forEach(serializeRichText);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  Object.entries(record).forEach(([key, value]) => {
    if (isLexical(value)) {
      record[`${key}Html`] = convertLexicalToHTML({ data: value });
    } else {
      serializeRichText(value);
    }
  });
};

// Minimal PoC shape, mirroring Hygraph's Page: a page key + an ordered array of
// section blocks. The point being proved: `sections` is a plain blocks array, so
// blocks nest directly — no `Blocks` wrapper like Hygraph needed for its
// 4-level nesting cap. Fields stay deliberately few; schema detail comes later.
export const Pages: CollectionConfig = {
  slug: 'pages',
  // Public read for the build fetch; writes stay admin-only.
  access: {
		create: authenticated,
		delete: authenticated,
		read: anyone,
		update: authenticated,
	},
  admin: {
    group: 'Content',
    useAsTitle: 'key',
    defaultColumns: ['key', 'slug', 'conference', 'updatedAt'],
    // Side-by-side view of the built page. The static site is not wired to
    // Payload's live-preview client, so it shows the last build rather than
    // unsaved edits — the front end has to opt in for true live updates.
    livePreview: {
      breakpoints: previewBreakpoints,
      url: ({ data }) => pageUrl(data),
    },
    preview: (data) => pageUrl(data as { key?: string; slug?: string }),
  },
  // One page per (conference, key) — a second "main" for the same conference
  // is rejected at the DB level, so the fixed page list stays fixed.
  indexes: [{ fields: ['conference', 'key'], unique: true }],
  hooks: {
    afterRead: [
      ({ doc }) => {
        serializeRichText(doc.sections);
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'select',
      // Not free text: the shared page registry. Extend it in src/pageKeys.ts.
      options: PAGE_KEYS,
      required: true,
      index: true,
      defaultValue: 'main',
      admin: { position: 'sidebar' },
    },
    {
      // Page url, derived from the key — read-only, kept in sync by the hook
      // below so it can never drift from the template filename.
      name: 'slug',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
      hooks: {
        beforeChange: [({ data }) => slugForKey(data?.key)],
      },
    },
    {
      name: 'conference',
      type: 'relationship',
      relationTo: 'conferences',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'sections',
              type: 'blocks',
              // Roughly the order they sit on a page — the picker lists them
              // as written here.
              blocks: [
                Hero,
                Event,
                Features,
                Techs,
                DeepDives,
                Location,
                Multipass,
                Prices,
                FullTicket,
                FreeTicket,
                Party,
                Diversity,
              ],
              validate: uniqueBlocks,
            },
          ],
        },
        seoTab,
      ],
    },
  ],
};
