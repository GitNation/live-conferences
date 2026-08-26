const chalk = require('chalk');

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3100';

const fetchPayloadPages = async (conferenceTitle, eventYear) => {
	const params = new URLSearchParams({
		'where[conference.brand.title][equals]': conferenceTitle,
		'where[conference.eventYear][equals]': eventYear,
		// 2 so the page's conference resolves its brand (socials live there).
		depth: '2',
		limit: '100',
	});
	const res = await fetch(`${PAYLOAD_URL}/api/pages?${params}`);
	if (!res.ok) throw new Error(`Payload responded ${res.status}`);
	const { docs } = await res.json();
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
		Object.entries(COMPONENT_GLOBALS).map(async ([key, slug]) => {
			const res = await fetch(`${PAYLOAD_URL}/api/globals/${slug}?depth=1`);
			if (!res.ok) throw new Error(`Payload responded ${res.status} for ${slug}`);
			return [key, await res.json()];
		})
	);
	const components = Object.fromEntries(entries);
	normalizePayloadData(components);
	return components;
};

const fetchPayloadEms = async (conferenceId, timezone) => {
	if (!conferenceId) return {};
	const params = new URLSearchParams({ conference: String(conferenceId), ...(timezone ? { timezone } : {}) });
	const res = await fetch(`${PAYLOAD_URL}/api/ems/content?${params}`);
	if (!res.ok) throw new Error(`Payload responded ${res.status} for ems/content`);
	return res.json();
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

const dropHidden = (rows) =>
	(rows || [])
		.filter((row) => !row.hidden)
		.map((row) => {
			const lists = Object.entries(row).filter(
				([, value]) => Array.isArray(value) && value.some((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
			);
			if (!lists.length) return row;
			return { ...row, ...Object.fromEntries(lists.map(([key, value]) => [key, dropHidden(value)])) };
		});

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
		normalizePayloadData(doc.sections);
		pages[doc.key] = { id: doc.id, key: doc.key, seo: doc.seo || {}, sections: dropHidden(doc.sections) };
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

module.exports = { addPayloadContent };
