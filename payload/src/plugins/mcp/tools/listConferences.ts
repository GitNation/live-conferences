import type { PayloadRequest } from 'payload';

// Three flat reads instead of one `depth: 1` — the `pages` join on a conference
// expands whole page documents, which turns this listing into 160 KB.
const handler = async (_args: Record<string, unknown>, req: PayloadRequest) => {
	const [brands, conferences, pages] = await Promise.all([
		req.payload.find({ collection: 'brands', depth: 0, limit: 100, pagination: false, select: { title: true } }),
		req.payload.find({ collection: 'conferences', depth: 0, limit: 200, pagination: false, select: { brand: true, eventYear: true } }),
		req.payload.find({
			collection: 'pages',
			depth: 0,
			limit: 1000,
			pagination: false,
			select: { conference: true, key: true, slug: true },
			sort: 'order',
		}),
	]);

	const titleOf = new Map(brands.docs.map((brand) => [brand.id, brand.title]));

	const lines = conferences.docs
		.map((conference) => {
			const brand = typeof conference.brand === 'object' ? conference.brand.title : titleOf.get(conference.brand);
			const keys = pages.docs
				.filter((page) => (typeof page.conference === 'object' ? page.conference.id : page.conference) === conference.id)
				.map((page) => (page.key === page.slug ? page.key : `${page.key} (/${page.slug})`));

			return `${brand} / ${conference.eventYear}\n  ${keys.join(' · ') || 'no pages yet'}`;
		})
		.sort();

	const body = lines.length ? lines.join('\n') : 'No conferences yet.';

	return {
		content: [
			{
				type: 'text' as const,
				text: `${body}\n\nAddress a page as brand + eventYear + key, then call getPageOutline.`,
			},
		],
	};
};

export const listConferences = {
	name: 'listConferences',
	description:
		'Every conference in the CMS as brand + eventYear, with the page keys each one has. Start here: page keys repeat across conferences, so this is what makes a page addressable.',
	parameters: {},
	handler,
};
