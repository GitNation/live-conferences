import type { CollectionConfig } from 'payload';
import { anyone, editor } from '@/access';
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
import { Faq } from '@/blocks/Faq';
import { Hero } from '@/blocks/Hero';
import { HeroInner } from '@/blocks/HeroInner';
import { Jobs } from '@/blocks/Jobs';
import { Schedule } from '@/blocks/Schedule';
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
import { PAGE_KEYS, orderForKey } from '@/constants/pageKeys';
import { slugForKey } from '@/utils/slugForKey';

export const Pages: CollectionConfig = {
	slug: 'pages',

	access: {
		create: editor,
		delete: editor,
		read: anyone,
		update: editor,
	},
	admin: {
		group: 'Content',
		useAsTitle: 'key',
		defaultColumns: ['key', 'slug', 'conference', 'updatedAt'],
	},
	indexes: [{ fields: ['conference', 'key'], unique: true }],
	fields: [
		{
			name: 'key',
			type: 'select',

			options: PAGE_KEYS,
			required: true,
			index: true,
			defaultValue: 'main',
			admin: { position: 'sidebar' },
		},
		{
			name: 'slug',
			type: 'text',
			index: true,
			admin: { position: 'sidebar', readOnly: true },
			hooks: {
				beforeChange: [({ data }) => slugForKey(data?.key)],
			},
		},
		{
			// Position in the shared registry. The only reader is the `pages` join on
			// Conferences, which sorts by it so an edition lists its pages in page
			// order rather than by creation date. Derived, never authored.
			name: 'order',
			type: 'number',
			index: true,
			admin: { hidden: true },
			hooks: {
				beforeChange: [({ data }) => orderForKey(data?.key)],
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
							// A full page is 20+ sections — open them one at a time.
							admin: { initCollapsed: true },
							// Roughly the order they sit on a page — the picker lists them
							// as written here.
							blocks: withPreviews([
								Hero,
								HeroInner,
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
								Faq,
								Jobs,
								Schedule,
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
