const chalk = require('chalk');

// Adds the `payload` namespace to the content object (see payload/README.md).
// It does NOT touch the Hygraph `pages` tree — the two sources live side by
// side and each template decides which one it reads:
//
//   {% for section in payload.pages[pageKey].sections %}
//     {% if section.blockType == 'hero' %} ... {% endif %}
//
// Payload not running just means the namespace is empty; the build still runs.

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

// Global components: one document each, shared by every brand and edition. The
// template key is what a page reads (`payload.components.<key>`), the slug is
// the global it comes from.
const COMPONENT_GLOBALS = { subscriptionPopup: 'subscription-popup', noticePanel: 'notice-panel' };

const fetchPayloadComponents = async () => {
	const entries = await Promise.all(
		Object.entries(COMPONENT_GLOBALS).map(async ([key, slug]) => {
			const res = await fetch(`${PAYLOAD_URL}/api/globals/${slug}?depth=1`);
			if (!res.ok) throw new Error(`Payload responded ${res.status} for ${slug}`);
			return [key, await res.json()];
		})
	);
	return Object.fromEntries(entries);
};

// Two normalizations for template consumption:
// - Rich text arrives twice from Payload: raw Lexical JSON under the field name
//   and serialized HTML under `<field>Html` (added by the Pages afterRead hook).
//   Templates only consume HTML — swap it in under the plain name, drop the JSON.
// - Upload docs (media) carry root-relative urls (/api/media/file/...) — prefix
//   them with the Payload origin so the static site can load them.
const normalizeBlockData = (node) => {
	if (Array.isArray(node)) return node.forEach(normalizeBlockData);
	if (!node || typeof node !== 'object') return;
	if (node.mimeType && typeof node.url === 'string' && node.url.startsWith('/')) {
		node.url = PAYLOAD_URL + node.url;
	}
	Object.keys(node).forEach((key) => {
		if (key.endsWith('Html')) {
			node[key.slice(0, -'Html'.length)] = node[key];
			delete node[key];
		} else {
			normalizeBlockData(node[key]);
		}
	});
};

// Anything hidden in the CMS never reaches a template — dropped here once
// instead of guarded in every partial. Sections carry the switch, and so do the
// rows inside them (speaker cards, event dates, price tickets), so every nested
// list of entries is walked rather than a named few.
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
	// Same pair Hygraph selects on — the conference folder's own settings.
	const { conferenceTitle, eventYear } = require('./getSettings');

	let docs = [];
	let components = {};
	try {
		[docs, components] = await Promise.all([fetchPayloadPages(conferenceTitle, eventYear), fetchPayloadComponents()]);
	} catch (err) {
		console.warn(chalk.yellow(`Payload: fetch from ${PAYLOAD_URL} failed (${err.message}). Templates fall back to CMS data.`));
	}

	// Conference-level content: header and footer are filled per edition,
	// socials sit on the brand. Both ride along on the pages request.
	const conference = (docs[0] && docs[0].conference) || {};

	const pages = {};
	docs.forEach((doc) => {
		// Raw Payload doc minus the selector relationship — blocks keep their
		// blockType, ids and field names exactly as the CMS returns them.
		normalizeBlockData(doc.sections);
		pages[doc.key] = { id: doc.id, key: doc.key, seo: doc.seo || {}, sections: dropHidden(doc.sections) };
	});

	// A component the conference switched off is dropped here, so a template
	// checks whether the component is there instead of pairing it with a switch.
	// A component with no switch (the notice panel) is always on.
	const switches = conference.components || {};
	const enabledComponents = Object.fromEntries(
		Object.keys(components).map((key) => [key, key in switches && !switches[key] ? null : components[key]])
	);

	content.payload = {
		conferenceTitle,
		eventYear,
		components: enabledComponents,
		brand: conference.brand || null,
		header: conference.header || null,
		footer: conference.footer || null,
		// Edition-level switches the sections read: how many speakers are still
		// unannounced, and whether the call for speakers is open.
		tbaSpeakersNumber: conference.tbaSpeakersNumber ?? null,
		openForTalks: conference.openForTalks ?? null,
		pages,
	};

	const componentsOn = Object.keys(enabledComponents).filter((key) => enabledComponents[key]);
	console.log(
		chalk.cyan(
			`Payload: pages ${Object.keys(pages).join(', ') || '(none)'}, components ${componentsOn.join(', ') || '(none)'} — see content-log.json`
		)
	);

	return content;
};

module.exports = { addPayloadContent };
