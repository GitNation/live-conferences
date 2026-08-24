import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '@/access';
import { Awards } from '@/blocks/Awards';
import { Checkout } from '@/blocks/Checkout';
import { DeepDives } from '@/blocks/DeepDives';
import { Discussions } from '@/blocks/Discussions';
import { Diversity } from '@/blocks/Diversity';
import { Event } from '@/blocks/Event';
import { Features } from '@/blocks/Features';
import { FollowUs } from '@/blocks/FollowUs';
import { FreeTicket } from '@/blocks/FreeTicket';
import { FullTicket } from '@/blocks/FullTicket';
import { Hero } from '@/blocks/Hero';
import { Location } from '@/blocks/Location';
import { Multipass } from '@/blocks/Multipass';
import { Party } from '@/blocks/Party';
import { Prices } from '@/blocks/Prices';
import { Techs } from '@/blocks/Techs';
import { ZoomBars } from '@/blocks/ZoomBars';
import { Committee } from '@/blocks/Committee';
import { LineUp } from '@/blocks/LineUp';
import { Mcs } from '@/blocks/Mcs';
import { PastSpeakers } from '@/blocks/PastSpeakers';
import { Speakers } from '@/blocks/Speakers';
import { Sponsors } from '@/blocks/Sponsors';
import { Workshops } from '@/blocks/Workshops';
import { uniqueBlocks } from '@/fields/uniqueValidation';
import { seoTab } from '@/fields/seo';
import { withPreviews } from '@/utils/blockPreviewImage';
import { PAGE_KEYS } from '@/constants/pageKeys';
import { slugForKey } from '@/utils/slugForKey';

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
  },
  // One page per (conference, key) — a second "main" for the same conference
  // is rejected at the DB level, so the fixed page list stays fixed.
  indexes: [{ fields: ['conference', 'key'], unique: true }],
  fields: [
    {
      name: 'key',
      type: 'select',
      // Not free text: the shared page registry. Extend it in src/constants/pageKeys.ts.
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
              blocks: withPreviews([
                Hero,
                Event,
                Features,
                DeepDives,
                LineUp,
                Techs,
                Speakers,
                PastSpeakers,
                Mcs,
                Committee,
                FollowUs,
                Workshops,
                Location,
                Multipass,
                Prices,
                Checkout,
                FullTicket,
                FreeTicket,
                Discussions,
                Party,
                ZoomBars,
                Awards,
                Diversity,
                Sponsors,
              ]),
              validate: uniqueBlocks,
            },
          ],
        },
        seoTab,
      ],
    },
  ],
};
