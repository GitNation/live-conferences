const { resolveConference, switchConference } = require('./resolveConference');

const respond = (statusCode, body, headers) => ({ statusCode, headers: { 'Cache-Control': 'no-store', ...headers }, body });

// Plain text: the CMS shows it in the admin's own origin, and it echoes request input.
const error = (statusCode, message) => respond(statusCode, message, { 'Content-Type': 'text/plain; charset=utf-8' });

const CONTENT_TTL_MS = 10 * 60 * 1000;
const cached = new Map();

// A saved page is always read fresh. Unsaved edits arrive every few keystrokes, and only
// their own page changes — the rest of the conference is reused until the next saved render.
const conferenceContent = async (conf, fresh) => {
	const hit = cached.get(conf);
	if (!fresh && hit && Date.now() - hit.at < CONTENT_TTL_MS) return hit.content;
	const { addPayloadContent } = require('../../../gulp/util/payloadContent');
	const content = await addPayloadContent({});
	if (Object.keys(content.payload.pages).length) cached.set(conf, { at: Date.now(), content });
	return content;
};

/**
 * One page of one conference, rendered by the build's own templates — the saved page, or `doc`
 * (a page as Payload reads it) in its place. `local` is `yarn start`, which builds one
 * conference at its own root: no sub-path, and no other conference to switch to.
 */
const renderPreview = async (query, { local = false, doc = null } = {}) => {
	const pageKey = (doc && doc.key) || query.page || 'main';

	try {
		const conf = resolveConference(query);
		if (!conf) return error(404, `Unknown conference: ${query.title || '(no title given)'}`);

		if (process.env.CONF_CODE !== conf) {
			if (local) return error(409, `This server runs ${process.env.CONF_CODE} — start yarn start:${conf} to preview it`);
			switchConference(conf);
		}

		const { toPage } = require('../../../gulp/util/payloadContent');
		const { renderPage, hasTemplate } = require('../../../gulp/util/renderPage');
		const { subPath } = require('../../../gulp/util/getSettings');

		if (!hasTemplate(pageKey)) return error(404, `No template for page: ${pageKey}`);

		const saved = await conferenceContent(conf, !doc);
		if (!Object.keys(saved.payload.pages).length) {
			return error(502, `Payload returned no pages for ${query.title} ${query.year} — check PAYLOAD_URL and PAYLOAD_READ_TOKEN for this site's functions`);
		}
		const content = doc
			? { ...saved, payload: { ...saved.payload, pages: { ...saved.payload.pages, [pageKey]: toPage(doc) } } }
			: saved;
		if (!content.payload.pages[pageKey]) return error(404, `Page not found in the CMS: ${pageKey}`);

		return respond(200, renderPage({ pageKey, content }), {
			'Content-Type': 'text/html; charset=utf-8',
			'X-Preview-Base': local ? '' : subPath || '',
		});
	} catch (err) {
		console.error('preview failed', err);
		return error(500, `Preview failed to render: ${(err && err.message) || err}`);
	}
};

module.exports = { renderPreview, error };
