const fs = require('fs');
const path = require('path');

const findRepoRoot = () => {
	let dir = __dirname;
	for (let i = 0; i < 6; i += 1) {
		if (fs.existsSync(path.join(dir, 'src', 'conferences'))) return dir;
		dir = path.dirname(dir);
	}
	throw new Error('preview: could not locate src/conferences from ' + __dirname);
};

const resolveConf = (root, { title, year }) => {
	if (!title) return null;
	const dir = path.join(root, 'src', 'conferences');
	for (const entry of fs.readdirSync(dir)) {
		const settingsPath = path.join(dir, entry, 'conference-settings.js');
		if (!fs.existsSync(settingsPath)) continue;
		let settings;
		try {
			settings = require(settingsPath);
		} catch {
			continue;
		}
		if (settings.conferenceTitle === title && (!year || settings.eventYear === year)) return entry;
	}
	return null;
};

const html = (statusCode, body, headers = {}) => ({
	statusCode,
	headers: {
		'Content-Type': 'text/html; charset=utf-8',
		'Cache-Control': 'no-store, max-age=0',
		...headers,
	},
	body,
});

const CONTENT_TTL_MS = 60 * 1000;
const cached = new Map();

// A saved page is always read fresh. Unsaved edits arrive every few keystrokes, and only
// their own page changes — the rest of the conference is reused for a minute.
const conferenceContent = async (conf, fresh) => {
	const hit = cached.get(conf);
	if (!fresh && hit && Date.now() - hit.at < CONTENT_TTL_MS) return hit.content;
	const { addPayloadContent } = require('../../../gulp/util/payloadContent');
	const content = await addPayloadContent({});
	cached.set(conf, { at: Date.now(), content });
	return content;
};

const preview = async (query, { local = false, doc = null } = {}) => {
	const pageKey = (doc && doc.key) || query.page || 'main';

	try {
		const root = findRepoRoot();
		process.chdir(root);

		const conf = query.conf || resolveConf(root, { title: query.title, year: query.year });
		if (!conf) {
			return html(404, `Unknown conference: ${query.title || '(no title given)'}`);
		}

		if (process.env.CONF_CODE !== conf) {
			if (local) return html(409, `This server runs ${process.env.CONF_CODE} — start yarn start:${conf} to preview it`);

			Object.keys(require.cache)
				.filter((file) => file.includes(`${path.sep}gulp${path.sep}`))
				.forEach((file) => delete require.cache[file]);
			process.env.CONF_CODE = conf;
		}

		const { toPage } = require('../../../gulp/util/payloadContent');
		const { renderPage, hasTemplate } = require('../../../gulp/util/renderPage');
		const { subPath } = require('../../../gulp/util/getSettings');

		if (!hasTemplate(pageKey)) {
			return html(404, `No template for page: ${pageKey}`);
		}

		const saved = await conferenceContent(conf, !doc);
		const content = doc
			? { ...saved, payload: { ...saved.payload, pages: { ...saved.payload.pages, [pageKey]: toPage(doc) } } }
			: saved;

		const pages = (content.payload || {}).pages || {};
		if (!pages[pageKey]) {
			return html(404, `Page not found in the CMS: ${pageKey}`);
		}

		return html(200, renderPage({ pageKey, content }), { 'X-Preview-Base': local ? '' : subPath || '' });
	} catch (err) {
		console.error('preview failed', err);
		return html(500, `Preview failed to render: ${(err && err.message) || err}`);
	}
};

exports.handler = async (event) => {
	const query = event.queryStringParameters || {};

	const secret = process.env.PREVIEW_SECRET;
	if (!secret || query.secret !== secret) {
		return html(401, 'Preview unavailable: missing or invalid secret.');
	}

	const doc = event.httpMethod === 'POST' && event.body ? JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body).doc : null;
	return preview(query, { doc });
};

exports.preview = preview;
