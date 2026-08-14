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

const fetchPayloadPages = async (brandKey, eventYear) => {
	const params = new URLSearchParams({
		'where[conference.brand.key][equals]': brandKey,
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

// A section switched off in the CMS never reaches a template — dropped here
// once instead of guarded in every partial. Nested slots are filtered too.
const dropDisabled = (blocks) =>
	(blocks || [])
		.filter((block) => !block.disabled)
		.map((block) => (Array.isArray(block.blocks) ? { ...block, blocks: dropDisabled(block.blocks) } : block));

const addPayloadContent = async (content) => {
	const brandKey = process.env.CONF_CODE;
	const { eventYear } = require('./getSettings');

	let docs = [];
	try {
		docs = await fetchPayloadPages(brandKey, eventYear);
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
		pages[doc.key] = { id: doc.id, key: doc.key, seo: doc.seo || {}, sections: dropDisabled(doc.sections) };
	});

	content.payload = {
		brandKey,
		eventYear,
		brand: conference.brand || null,
		header: conference.header || null,
		footer: conference.footer || null,
		pages,
	};

	console.log(chalk.cyan(`Payload: pages ${Object.keys(pages).join(', ') || '(none)'} — see content-log.json`));

	return content;
};

module.exports = { addPayloadContent };
