import type { PayloadRequest } from 'payload';
import type { Page } from '@/payload-types';

export type PageAddress = { brand: string; eventYear: string; pageKey: string };

// `key` repeats across editions — two `main` pages today, one per conference once
// every brand is migrated — so a page is only addressable together with its brand
// and year. Same selector the static build uses in gulp/util/payloadContent.js.
export const findPage = async (req: PayloadRequest, { brand, eventYear, pageKey }: PageAddress): Promise<Page> => {
	const { docs } = await req.payload.find({
		collection: 'pages',
		depth: 0,
		limit: 1,
		pagination: false,
		where: {
			'conference.brand.title': { equals: brand },
			'conference.eventYear': { equals: eventYear },
			key: { equals: pageKey },
		},
	});

	const page = docs[0];
	if (!page) throw new Error(`No "${pageKey}" page for ${brand} ${eventYear}. Call listConferences for the brands, years and page keys that exist.`);

	return page;
};
