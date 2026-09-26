const chalk = require('chalk');

// A bare hostname here would make every fetch throw "Failed to parse URL", so the scheme
// is filled in rather than trusted to whoever set the variable.
const withScheme = (url) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

const PAYLOAD_URL = withScheme(process.env.PAYLOAD_URL || 'http://localhost:3100').replace(/\/$/, '');

// Content in Payload is not public: reads carry the build's token (PAYLOAD_READ_TOKEN,
// the same value on both sides). Media files stay open, since the built HTML points site
// visitors straight at them. .env reaches this process as a side effect of requiring
// @focus-reactive/graphql-content-layer, which nunjucks.js does first.
const readHeaders = process.env.PAYLOAD_READ_TOKEN ? { Authorization: `Bearer ${process.env.PAYLOAD_READ_TOKEN}` } : undefined;

const fetchPayload = async (path, label) => {
	const res = await fetch(`${PAYLOAD_URL}${path}`, { headers: readHeaders });
	if (!res.ok) throw new Error(`Payload responded ${res.status}${label ? ` for ${label}` : ''}`);
	return res.json();
};

const fetchPayloadPages = async (conferenceTitle, eventYear) => {
	const params = new URLSearchParams({
		'where[conference.brand.title][equals]': conferenceTitle,
		'where[conference.eventYear][equals]': eventYear,
		// 2 so the page's conference resolves its brand (socials live there).
		depth: '2',
		limit: '100',
	});
	const { docs } = await fetchPayload(`/api/pages?${params}`);
	return docs;
};

const COMPONENT_GLOBALS = {
	subscriptionPopup: 'subscription-popup',
	noticePanel: 'notice-panel',
	multipassBanner: 'multipass-banner',
	eventBy: 'event-by',
};

const fetchPayloadComponents = async () => {
	const entries = await Promise.all(
		Object.entries(COMPONENT_GLOBALS).map(async ([key, slug]) => [key, await fetchPayload(`/api/globals/${slug}?depth=1`, slug)])
	);
	const components = Object.fromEntries(entries);
	normalizePayloadData(components);
	return components;
};

const fetchPayloadEms = async (conferenceId, timezone) => {
	if (!conferenceId) return {};
	const params = new URLSearchParams({ conference: String(conferenceId), ...(timezone ? { timezone } : {}) });
	return fetchPayload(`/api/ems/content?${params}`, 'ems/content');
};

const normalizePayloadData = (node) => {
	if (Array.isArray(node)) return node.forEach(normalizePayloadData);
	if (!node || typeof node !== 'object') return;
	Object.keys(node).forEach((key) => {
		if (key.endsWith('Html')) {
			node[key.slice(0, -'Html'.length)] = node[key];
			delete node[key];
		} else {
			normalizePayloadData(node[key]);
		}
	});
};

const isRowList = (value) => Array.isArray(value) && value.some((entry) => entry && typeof entry === 'object' && !Array.isArray(entry));

// Rows sit in arrays of the row itself and in its groups (`addons.items`), at any depth.
const withoutHidden = (node) => {
	const nested = Object.entries(node).filter(([key, value]) => isRowList(value) || (key !== '_path' && isGroup(value)));
	if (!nested.length) return node;
	return { ...node, ...Object.fromEntries(nested.map(([key, value]) => [key, isRowList(value) ? dropHidden(value) : withoutHidden(value)])) };
};

const dropHidden = (rows) => (rows || []).filter((row) => !row.hidden).map(withoutHidden);

// The admin form path of every row, stamped before `dropHidden` shifts the indexes —
// what the preview's click-to-edit sends back to the admin.
// A group (`priceIncrease`, `addons`) is a plain object; a populated document is not one.
const isGroup = (value) => value && typeof value === 'object' && !Array.isArray(value) && !('updatedAt' in value);

const stampPath = (node, path) => {
	node._path = path;
	Object.entries(node).forEach(([key, value]) => {
		if (isRowList(value)) addPaths(value, `${path}.${key}`);
		else if (key !== '_path' && isGroup(value)) stampPath(value, `${path}.${key}`);
	});
};

const addPaths = (rows, prefix) =>
	(rows || []).forEach((row, index) => {
		if (row && typeof row === 'object') stampPath(row, `${prefix}.${index}`);
	});

const toPage = (doc) => {
	normalizePayloadData(doc.sections);
	addPaths(doc.sections, 'sections');
	return { id: doc.id, key: doc.key, mainTitle: doc.mainTitle || null, seo: doc.seo || {}, sections: dropHidden(doc.sections) };
};

const addPayloadContent = async (content) => {
	const { conferenceTitle, eventYear } = require('./getSettings');

	let docs = [];
	let components = {};
	try {
		[docs, components] = await Promise.all([fetchPayloadPages(conferenceTitle, eventYear), fetchPayloadComponents()]);
	} catch (err) {
		console.warn(chalk.yellow(`Payload: fetch from ${PAYLOAD_URL} failed (${err.message}). Templates fall back to CMS data.`));
	}

	const conference = (docs[0] && docs[0].conference) || {};

	let ems = {};
	try {
		ems = await fetchPayloadEms(conference.id, require('./getSettings').timezone);
	} catch (err) {
		console.warn(chalk.yellow(`Payload: EMS fetch failed (${err.message}). Sections fed by EMS render empty.`));
	}

	const pages = {};
	docs.forEach((doc) => {
		pages[doc.key] = toPage(doc);
	});

	const switches = (conference.settings && conference.settings.optionalBlocks) || {};
	const enabledComponents = Object.fromEntries(Object.keys(components).map((key) => [key, key in switches && !switches[key] ? null : components[key]]));

	content.payload = {
		conferenceTitle,
		eventYear,
		components: enabledComponents,
		brand: conference.brand || null,
		header: conference.header || null,
		footer: conference.footer || null,
		settings: conference.settings || null,

		tbaSpeakersNumber: conference.tbaSpeakersNumber ?? null,
		openForTalks: conference.openForTalks ?? null,

		startTime: conference.startTime ?? null,
		endTime: conference.endTime ?? null,
		pages,
	};

	// eventInfo is forwarded to the React layer as one value, and an undefined there would
	// render as a hole in the pushContent literal and break the whole inline script — so it
	// is always an object, even when EMS is off or unreachable.
	content.ems = { eventInfo: {}, ...ems };

	return content;
};

module.exports = { addPayloadContent, toPage };
