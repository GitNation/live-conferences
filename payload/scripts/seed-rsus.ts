// One-off: fills Payload with the Hygraph content of `rsus` (React Summit US 2026).
// Run from payload/: pnpm payload run scripts/seed-rsus.ts
// Reads the dump produced by the migrate-conf skill's step 1.
import fs from 'fs';
import os from 'os';
import path from 'path';
import config from '@payload-config';
import { getPayload } from 'payload';

const DUMP = '/private/tmp/claude-501/-Users-petro-live-conferences/fca6970f-900e-4663-8d83-ef5c0b4ee499/scratchpad/rsus-hygraph.json';

const src = JSON.parse(fs.readFileSync(DUMP, 'utf8'));
const main = src.pages.main.pageSections;
const stats = src.pages.main.pageStatistics;
const checkout = src.pages.checkout.pageSections;
const T = src.pagesPieceOfTexts;

const payload = await getPayload({ config });

/* ---------------------------------------------------------------- html → text */

const stripTags = (html?: string | null) =>
	(html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&#x26;/g, '&')
		.replace(/&amp;/g, '&')
		.replace(/&#x27;|&rsquo;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();

/* ------------------------------------------------------------- html → lexical */

type Node = { tag?: string; attrs?: string; text?: string; children?: Node[] };

const VOID = new Set(['br', 'img', 'hr']);
const decode = (s: string) =>
	s
		.replace(/&#x26;|&amp;/g, '&')
		.replace(/&#x27;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&nbsp;/g, ' ');

const parseHtml = (html: string): Node[] => {
	const root: Node = { children: [] };
	const stack: Node[] = [root];
	const re = /<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)([^>]*?)\/?>|([^<]+)/g;
	let m: RegExpExecArray | null;

	while ((m = re.exec(html))) {
		const top = stack[stack.length - 1];
		if (m[1]) {
			for (let i = stack.length - 1; i > 0; i--) {
				if (stack[i].tag === m[1].toLowerCase()) {
					stack.length = i;
					break;
				}
			}
		} else if (m[2]) {
			const tag = m[2].toLowerCase();
			const node: Node = { tag, attrs: m[3] || '', children: [] };
			top.children!.push(node);
			if (!VOID.has(tag)) stack.push(node);
		} else if (m[4]) {
			top.children!.push({ text: decode(m[4]) });
		}
	}
	return root.children!;
};

const textNode = (text: string, format: number) => ({
	type: 'text',
	text,
	detail: 0,
	format,
	mode: 'normal',
	style: '',
	version: 1,
});

const href = (attrs = '') => (attrs.match(/href\s*=\s*"([^"]*)"/) || [])[1] || '';

// bold 1, italic 2, underline 8 — the only marks the editor keeps
const FORMAT: Record<string, number> = { strong: 1, b: 1, em: 2, i: 2, u: 8 };

const inline = (nodes: Node[], format = 0): any[] =>
	nodes.flatMap((node) => {
		if (node.text !== undefined) return node.text ? [textNode(node.text, format)] : [];
		const tag = node.tag!;
		if (tag === 'br') return [{ type: 'linebreak', version: 1 }];
		if (tag === 'a') {
			const children = inline(node.children || [], format);
			if (!children.length) return [];
			return [
				{
					type: 'link',
					version: 3,
					direction: 'ltr',
					format: '',
					indent: 0,
					fields: { linkType: 'custom', url: href(node.attrs), newTab: !href(node.attrs).startsWith('#') },
					children,
				},
			];
		}
		return inline(node.children || [], format | (FORMAT[tag] || 0));
	});

const paragraph = (children: any[]) => ({
	type: 'paragraph',
	direction: 'ltr',
	format: '',
	indent: 0,
	version: 1,
	textFormat: 0,
	children,
});

const listItem = (children: any[], value: number) => ({
	type: 'listitem',
	direction: 'ltr',
	format: '',
	indent: 0,
	version: 1,
	value,
	checked: undefined,
	children,
});

// A <li> may hold another <ul> (Hygraph does that for every faq answer) — the
// editor has no nesting, so inner items are lifted into the same list.
const listItems = (nodes: Node[]): Node[] =>
	nodes.flatMap((node) =>
		node.tag === 'li' && (node.children || []).some((child) => child.tag === 'ul' || child.tag === 'ol')
			? listItems((node.children || []).flatMap((child) => (child.tag === 'ul' || child.tag === 'ol' ? child.children || [] : [child])))
			: node.tag === 'li'
				? [node]
				: []
	);

const list = (node: Node) => {
	const items = listItems(node.children || []);
	if (!items.length) return null;
	return {
		type: 'list',
		direction: 'ltr',
		format: '',
		indent: 0,
		version: 1,
		listType: node.tag === 'ol' ? 'number' : 'bullet',
		tag: node.tag === 'ol' ? 'ol' : 'ul',
		start: 1,
		children: items.map((item, index) => listItem(inline(item.children || []), index + 1)),
	};
};

const BLOCK = new Set(['p', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote']);

const blocks = (nodes: Node[]): any[] =>
	nodes.flatMap((node) => {
		if (node.text !== undefined) return node.text.trim() ? [paragraph([textNode(node.text.trim(), 0)])] : [];
		const tag = node.tag!;
		if (tag === 'ul' || tag === 'ol') return [list(node)].filter(Boolean);
		if (tag === 'div') return blocks(node.children || []);
		if (BLOCK.has(tag)) {
			// headings collapse to a bold paragraph — the editor has no heading node
			const heading = /^h[1-6]$/.test(tag) ? 1 : 0;
			const children = inline(node.children || [], heading);
			return children.length ? [paragraph(children)] : [];
		}
		const children = inline([node]);
		return children.length ? [paragraph(children)] : [];
	});

const rich = (html?: string | null): any => {
	const children = blocks(parseHtml(html || ''));
	if (!children.length) return null;
	return { root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children } };
};

const richList = (items: string[]): any =>
	items.length
		? {
				root: {
					type: 'root',
					direction: 'ltr',
					format: '',
					indent: 0,
					version: 1,
					children: [
						{
							type: 'list',
							direction: 'ltr',
							format: '',
							indent: 0,
							version: 1,
							listType: 'bullet',
							tag: 'ul',
							start: 1,
							children: items.map((item, index) => listItem([textNode(item, 0)], index + 1)),
						},
					],
				},
			}
		: null;

/* ----------------------------------------------------------------- media */

const FOLDERS = { techs: 5, dates: 6, features: 7, location: 9, fullTicket: 10 };
const uploaded = new Map<string, number>();

// A bare Hygraph handle only resolves through the project's asset endpoint —
// the same pair src/partials/_mixins.html:16 builds its urls from.
const ASSETS = 'https://eu-central-1.graphassets.com/AjSmXWlchQ7Cnl2Jcg81Jz';

const media = async (url: string | undefined | null, alt: string, folder: number) => {
	if (!url) return null;
	const full = url.startsWith('http') ? url : `${ASSETS}/${url}`;
	if (uploaded.has(full)) return uploaded.get(full)!;

	const res = await fetch(full);
	if (!res.ok) {
		console.warn('  ! media', res.status, full);
		return null;
	}
	const type = res.headers.get('content-type') || 'image/jpeg';
	const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('svg') ? 'svg' : 'jpg';
	// The Hygraph handle is the asset's identity — keeping it as the filename is
	// what makes a re-run reuse the upload instead of adding another copy.
	const name = `${full.split('/').pop()!.replace(/[^a-zA-Z0-9._-]/g, '')}.${ext}`;

	const seen = await payload.find({ collection: 'media', where: { filename: { equals: name } }, depth: 0, limit: 1, sort: 'id' });
	if (seen.docs.length) {
		uploaded.set(full, seen.docs[0].id as number);
		return seen.docs[0].id as number;
	}

	const file = path.join(os.tmpdir(), name);
	fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));

	const doc = await payload.create({ collection: 'media', data: { alt, folder }, filePath: file });
	fs.unlinkSync(file);
	uploaded.set(full, doc.id as number);
	return doc.id as number;
};

const seoText = (value?: string | null) => stripTags(value) || undefined;

// What a `text` field gets. Markup an editor wrote by hand is part of the copy —
// hero__title is three <span>s with a data attribute the typewriter script reads —
// so it goes in as it is. The one tag that is not authored is the <p> markdown
// wraps a line in, and that comes off.
const HAS_TAG = /<[a-z][^>]*>/i;

const plainText = (html?: string | null) => {
	const value = (html || '').trim().replace(/\s+$/, '');
	if (!value) return undefined;
	const unwrapped = value.replace(/^<p>([\s\S]*)<\/p>$/, '$1').trim();
	return HAS_TAG.test(unwrapped) ? unwrapped : decode(unwrapped).replace(/\s+/g, ' ');
};

/* ----------------------------------------------------------------- reset */

// Scoped to this one edition: a brand can hold several years, and dropping the
// brand outright would take the others with it. The brand is reused if it is
// already there, and only removed once nothing points at it any more.
const YEAR = src.conferenceSettings.eventYear;

const brands = await payload.find({ collection: 'brands', where: { title: { equals: src.conference.title } }, depth: 0, sort: 'id' });
let brandId = brands.docs[0]?.id as number | undefined;

if (brandId) {
	const editions = await payload.find({
		collection: 'conferences',
		where: { and: [{ brand: { equals: brandId } }, { eventYear: { equals: YEAR } }] },
		depth: 0,
	});
	for (const edition of editions.docs) {
		const pages = await payload.find({ collection: 'pages', where: { conference: { equals: edition.id } }, depth: 0, limit: 100 });
		for (const page of pages.docs) await payload.delete({ collection: 'pages', id: page.id });
		await payload.delete({ collection: 'conferences', id: edition.id });
		console.log('reset: removed', src.conference.title, YEAR, `(${pages.docs.length} pages)`);
	}
	console.log('brand', brandId, 'reused');
}

/* ------------------------------------------------------------- brand + conference */

const socialFor = [
	['twitter', src.conference.twitterUrl],
	['facebook', src.conference.facebookUrl],
	['instagram', src.conference.instagramUrl],
	['tiktok', src.conference.tiktokUrl],
	['youtube', src.conference.youtubeUrl],
	['linkedin', src.conference.linkedinUrl],
	['bluesky', src.conference.blueskyUrl],
	['discord', src.conference.discordUrl],
	['portal', src.conference.gnPortal],
] as const;

const brandData = {
	title: src.conference.title,
	city: src.conference.city,
	url: src.conference.url,
	socials: socialFor.filter(([, url]) => url).map(([network, url]) => ({ network, url })),
};

const brand = brandId
	? await payload.update({ collection: 'brands', id: brandId, data: brandData })
	: await payload.create({ collection: 'brands', data: brandData });
brandId = brand.id as number;
console.log('brand', brand.id, brand.title);

const nav = src.pages.main.pageNavigation;
const info = src.customContent.eventInfo;

const conference = await payload.create({
	collection: 'conferences',
	data: {
		brand: brand.id,
		title: 'React Summit US 2026',
		eventYear: src.conferenceSettings.eventYear,
		startTime: info.conferenceStart,
		endTime: info.conferenceFinish,
		emsEventId: info.emsEventId,
		useEmsData: true,
		tbaSpeakersNumber: info.tbaSpeakersNumber,
		openForTalks: false,
		components: { subscriptionPopup: Boolean(main.popupSubscription) },
		header: {
			navigation: (nav.headerNav || []).map((item: any) => ({
				text: item.text,
				url: item.href,
				openInNewTab: item.href.startsWith('http'),
			})),
			button: { label: T.ticket__text, url: T.ticket__link },
		},
		footer: {
			heading: plainText(T.footer__tip),
			navigation: (nav.footerNav || []).map((item: any) => ({
				text: item.text,
				url: item.href,
				openInNewTab: item.href.startsWith('http'),
			})),
		},
	},
});
console.log('conference', conference.id, conference.title);

/* ----------------------------------------------------------------- faqs */

// The faqs collection is not scoped to a conference and the question bank is
// largely the same GitNation wording everywhere — reuse a match, never duplicate.
const faqGroups: { title: string; items: number[] }[] = [];
let reused = 0;

for (const group of src.faqs) {
	const items: number[] = [];
	for (const item of group.items) {
		const question = stripTags(item.question);
		// sort by id: find defaults to newest first, which would pick a duplicate
		// over the original the other conferences already point at
		const match = await payload.find({ collection: 'faqs', where: { question: { equals: question } }, depth: 0, limit: 1, sort: 'id' });
		if (match.docs.length) {
			items.push(match.docs[0].id as number);
			reused++;
			continue;
		}
		const doc = await payload.create({ collection: 'faqs', data: { question, answer: rich(item.answer) } });
		items.push(doc.id as number);
	}
	faqGroups.push({ title: group.sectionTitle, items });
}
console.log('faqs reused', reused);
console.log('faqs', faqGroups.reduce((sum, group) => sum + group.items.length, 0), 'in', faqGroups.length, 'groups');

/* ----------------------------------------------------------------- main page */

const cta = (pair: any) =>
	[pair?.heroMainCTA, pair?.heroSecondaryCTA]
		.filter((button) => button && button.text)
		.map((button, index) => ({
			label: button.text,
			url: button.link,
			variant: index === 0 ? 'default' : 'outline',
			openInNewTab: String(button.link).startsWith('http'),
		}));

const techItems = [];
for (const tech of stats.techScope || []) {
	techItems.push({ title: tech.title, url: tech.link || undefined, icon: await media(tech.imageHandle, tech.title, FOLDERS.techs) });
}

const featureItems = [];
for (const item of main.featuresGrid || []) {
	const isVideo = Boolean(item.videoId);
	featureItems.push({
		type: isVideo ? 'video' : 'card',
		width: item.width === 'half' ? 'half' : 'quarter',
		title: item.title || undefined,
		description: rich(item.description),
		image: await media(item.bgImage || item.videoCover, item.title || 'React Summit US', FOLDERS.features),
		url: item.link || undefined,
		videoId: isVideo ? item.videoId : undefined,
		hiddenOnMobile: false,
	});
}

const ticketItems = [];
for (const item of main.fullTicket || []) {
	ticketItems.push({
		title: item.title,
		description: rich(item.desc),
		image: await media(item.img, item.title, FOLDERS.fullTicket),
		backgroundImage: await media(item.bg, item.title, FOLDERS.fullTicket),
		fullWidth: Boolean(item.fullWidth),
		url: item.btnLink || undefined,
	});
}

const eventDates = [];
for (const date of src.extendeds.dates || []) {
	eventDates.push({
		date: plainText(date.subtitle),
		title: plainText(date.title),
		description: rich(date.description),
		backgroundImage: await media(date.image, stripTags(date.title), FOLDERS.dates),
	});
}

const locationVideo = (src.extendeds.locationVideo || [])[0];

// extendeds.prices carries the group in `companyName` ("hybrid", "combo", …)
const GROUP_LABEL: Record<string, string> = { hybrid: 'In-person', remote: 'Remote', combo: 'Combo' };
const priceGroups: Record<string, any[]> = {};

for (const row of src.extendeds.prices || []) {
	const label = GROUP_LABEL[String(row.companyName || '').toLowerCase()] || 'In-person';
	const paragraphs = (row.title || '').split(/<\/p>/).map(stripTags).filter(Boolean);
	const price = (stripTags(row.subtitle).match(/\$[\d,]+|€[\d,]+/) || [])[0] || stripTags(row.subtitle);
	const badge = stripTags(((row.subtitle || '').match(/<del>([\s\S]*?)<\/del>/) || [])[1] || '');

	(priceGroups[label] ||= []).push({
		title: paragraphs[0] || 'Ticket',
		date: paragraphs[1] || undefined,
		price,
		discountBadge: badge || undefined,
		description: rich(row.location),
		button: row.registerLink
			? { label: row.locationLink || 'Order now', url: row.registerLink, variant: 'default', openInNewTab: false }
			: undefined,
	});
}

const sections: any[] = [
	{
		blockType: 'hero',
		title: plainText(T.hero__title),
		date: plainText(T.hero__dateInPerson || T.hero__date),
		stats: (stats.eventStats || []).map((stat: any) => ({ value: stat.statNumber, description: stat.statDescr })),
		buttons: {
			default: cta(stats.heroButtons?.buttonsDefault),
			daysBefore: cta(stats.heroButtons?.buttonsDaysbefore),
			during: cta(stats.heroButtons?.buttonsDuringConf),
			weekAfter: cta(stats.heroButtons?.buttonsWeekAfterConf),
		},
		switch: {
			leftLabel: T.hero__switchLeft,
			rightLabel: T.hero__switchRight,
			url: T.hero__switchLeftLink,
			rightIsActive: true,
		},
	},
	{ blockType: 'event', title: plainText(T.event__boldtitle), description: rich(T.event__text), dates: eventDates },
	{
		blockType: 'deepDives',
		title: plainText(T.program__title),
		items: (main.program || []).map((dive: any) => ({
			title: dive.title,
			description: rich(dive.description),
			list: richList((dive.list || []).map((row: any) => row.item)),
			button: dive.link?.text ? { label: dive.link.text, url: dive.link.url } : undefined,
		})),
	},
	{ blockType: 'features', title: plainText(T.features__title), items: featureItems },
	{ blockType: 'lineUp' },
	{ blockType: 'techs', description: rich(T.event__techstitle), items: techItems },
	{
		blockType: 'speakers',
		title: plainText(T.speakers__title),
		cards: [
			// `_cfp` — switched off in Hygraph by the underscore, so it comes over
			// hidden rather than not at all.
			main._cfp && {
				kind: 'cfp',
				hidden: true,
				title: main._cfp._title,
				description: rich(main._cfp._desc),
				buttons: main._cfp._link ? [{ label: main._cfp._linkText, url: main._cfp._link, variant: 'default', openInNewTab: false }] : [],
			},
			main.speakersMore && {
				kind: 'more',
				title: main.speakersMore.title,
				description: rich(main.speakersMore.desc),
				buttons: main.speakersMore.link ? [{ label: main.speakersMore.linkText, url: main.speakersMore.link, variant: 'default', openInNewTab: false }] : [],
			},
		].filter(Boolean),
	},
	// toggle is off in Hygraph, the copy is there — migrate it hidden
	{ blockType: 'pastSpeakers', hidden: true, title: plainText(T.pastSpeakers__title) },
	{ blockType: 'mcs', title: plainText(T.mcs__title) },
	{ blockType: 'committee', title: plainText(T.committee__title) },
	{
		blockType: 'workshops',
		title: plainText(T.workshopsList__title),
		description: rich(T.workshopsList__info),
	},
	{ blockType: 'followUs', title: plainText(T.contactForm__title), description: rich(T.contactForm__desc) },
	{ blockType: 'multipass', title: plainText(T.multipass__title), description: rich(T.multipass__desc) },
	{
		blockType: 'prices',
		title: plainText(T.prices__title),
		offerBanner: main.lockPrice
			? {
					title: main.lockPrice.title,
					description: rich(main.lockPrice.text),
					button: main.lockPrice.link?.text ? { label: main.lockPrice.link.text, url: main.lockPrice.link.url } : undefined,
				}
			: undefined,
		groups: Object.entries(priceGroups).map(([label, tickets]) => ({ label, tickets })),
	},
	{ blockType: 'fullTicket', title: plainText(T.fullaccess__title), items: ticketItems },
	{
		blockType: 'freeTicket',
		title: plainText(T.freeTicket__title),
		description: rich(T.freeTicket__desc),
		buttons: [{ label: T.freeTicket__btnText, url: T.freeTicket__btnLink, variant: 'default', openInNewTab: true }],
	},
	{ blockType: 'discussions', title: plainText(T.videorooms__title), description: rich(T.videorooms__subtitle) },
	{ blockType: 'party', hidden: true, title: plainText(T._party__title), description: rich(T._party__desc) },
	{
		blockType: 'location',
		layout: 'map',
		title: stripTags((T.location__venue || '').split('</h3>')[0]),
		description: rich((T.location__venue || '').split('</h3>')[1]),
		address: rich(T.location__address),
		// extendeds.locationVideo keeps the youtube id in `registerLink` and the
		// poster in `image` — the row has no title, that is the whole record.
		video: locationVideo
			? { poster: await media(locationVideo.image?.url, 'Liberty Science Center', FOLDERS.location), youtubeId: locationVideo.registerLink }
			: undefined,
	},
	{ blockType: 'sponsors', title: plainText(T.sponsors__title), description: rich(T.sponsors__intro), offer: rich(T.sponsors__offer) },
];

const mainPage = await payload.create({
	collection: 'pages',
	data: {
		key: 'main',
		conference: conference.id,
		seo: {
			title: seoText(src.pages.main.titleSeo),
			description: seoText(src.pages.main.seoDescription),
			keywords: seoText(src.pages.main.keywords),
		},
		sections,
	},
});
console.log('page main', mainPage.id, sections.length, 'sections');

/* ----------------------------------------------------------------- checkout page */

const checkoutPage = await payload.create({
	collection: 'pages',
	data: {
		key: 'checkout',
		conference: conference.id,
		seo: { title: seoText(src.pages.checkout.titleSeo), description: seoText(src.pages.checkout.seoDescription) },
		sections: [
			{
				blockType: 'checkout',
				widgets: [{ label: checkout.checkout.default.text, event: checkout.checkout.default.link }],
				multipassBanner: Boolean(checkout.multipassBanner),
				priceIncrease: {
					title: checkout.priceIncrease.title,
					items: (checkout.priceIncrease.list || []).map((step: any) => ({
						title: step.name,
						date: step.date,
						price: step.price,
						isActive: Boolean(step.isActive),
					})),
				},
				whatToExpect: { title: checkout.whatToExpect.title, description: richList(checkout.whatToExpect.list || []) },
				addons: {
					title: checkout.addons.title,
					items: (checkout.addons.list || []).map((addon: any) => ({
						title: addon.title,
						description: rich(addon.text),
						isMultipass: false,
						cta: { label: addon.cta?.text, url: addon.cta?.link },
						colors: { background: addon.bgColor || undefined, text: addon.textColor || undefined },
					})),
				},
				waitlistForm: {
					title: checkout.waitlistForm.title,
					description: rich(checkout.waitlistForm.text),
					formLink: checkout.waitlistForm.formLink,
				},
			},
		],
	},
});
console.log('page checkout', checkoutPage.id);

/* ----------------------------------------------------------------- faq page */

const faqPage = await payload.create({
	collection: 'pages',
	data: {
		key: 'faq',
		conference: conference.id,
		seo: { title: seoText(src.pages.faq.titleSeo), description: seoText(src.pages.faq.seoDescription) },
		sections: [
			{ blockType: 'heroInner', title: src.pages.faq.titlePage },
			{ blockType: 'faq', description: rich(T.faq__descr), groups: faqGroups },
		],
	},
});
console.log('page faq', faqPage.id);

console.log('media uploaded:', uploaded.size);
process.exit(0);
