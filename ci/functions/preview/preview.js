const fs = require('fs');
const path = require('path');

// Renders one page on demand for Payload's Live Preview iframe, so an editor sees a
// change without a deploy. Deploying is unchanged — the Slack command in ../deployProd.

// gulp/config.js builds its paths off the working directory, and nothing promises
// Netlify starts the handler where `src/` sits.
const findRepoRoot = () => {
	let dir = __dirname;
	for (let i = 0; i < 6; i += 1) {
		if (fs.existsSync(path.join(dir, 'src', 'conferences'))) return dir;
		dir = path.dirname(dir);
	}
	throw new Error('preview: could not locate src/conferences from ' + __dirname);
};

// Payload knows a conference by brand title + event year; the folder key (`jsn`) exists
// only here, in conference-settings.js. Reading the mapping off disk keeps it in one
// place — a newly migrated conference is previewable as soon as its folder exists, with
// nothing to add on the CMS side and no per-site environment variable.
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
		// Sub-conferences share a title and differ only by year, so both have to match.
		if (settings.conferenceTitle === title && (!year || settings.eventYear === year)) return entry;
	}
	return null;
};

// Templates write `css/app.css` for a page served at the site root; this answers on
// /.netlify/functions/preview. The build leaves the unhashed app.css/app.js/main.js next
// to their hashed twins, so a base href is all it takes — no hash manifest to read.
const withBaseHref = (html) => html.replace(/<head(\s[^>]*)?>/i, (tag) => `${tag}\n<base href="/">`);

const errorPage = (title, detail) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;
       font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       background:#f7f7f8;color:#1a1a1a}
  .card{max-width:460px;text-align:center;background:#fff;border:1px solid #e6e6e8;border-radius:12px;
        padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  h1{font-size:18px;margin:0 0 8px}
  p{color:#555;margin:0}
  code{background:#f2f2f4;border-radius:4px;padding:1px 5px}
</style></head>
<body><div class="card"><h1>${title}</h1><p>${detail}</p></div></body></html>`;

const html = (statusCode, body) => ({
	statusCode,
	headers: {
		'Content-Type': 'text/html; charset=utf-8',
		'Cache-Control': 'no-store, max-age=0',
		// The site sends X-Frame-Options: SAMEORIGIN, which would blank this inside the
		// admin's iframe. frame-ancestors wins wherever both are sent.
		'Content-Security-Policy': `frame-ancestors ${process.env.PREVIEW_FRAME_ANCESTORS || "'self'"}`,
	},
	body,
});

exports.handler = async (event) => {
	const query = event.queryStringParameters || {};

	// Drafts are unpublished content. Payload's own endpoint adds this secret to the
	// redirect it issues server-side, so it never reaches the admin's browser. Unset
	// means preview is not configured here, and the endpoint stays shut.
	const secret = process.env.PREVIEW_SECRET;
	if (!secret || query.secret !== secret) {
		return html(401, errorPage('Preview unavailable', 'This link is missing a valid preview secret.'));
	}

	const pageKey = query.page || 'main';

	try {
		const root = findRepoRoot();
		process.chdir(root);

		const conf = query.conf || resolveConf(root, { title: query.title, year: query.year });
		if (!conf) {
			return html(404, errorPage('Unknown conference', `No conference folder matches <code>${query.title || '(no title given)'}</code>.`));
		}

		// config.js and getSettings.js read CONF_CODE once, when they load. A warm container
		// asked for a sibling conference (tljs and tljs-london share a site) would otherwise
		// keep serving the first one's templates, so the cache goes when the key changes.
		if (process.env.CONF_CODE !== conf) {
			Object.keys(require.cache)
				.filter((file) => file.includes(`${path.sep}gulp${path.sep}`))
				.forEach((file) => delete require.cache[file]);
			process.env.CONF_CODE = conf;
		}

		const { addPayloadContent } = require('../../../gulp/util/payloadContent');
		const { renderPage, hasTemplate } = require('../../../gulp/util/renderPage');

		if (!hasTemplate(pageKey)) {
			return html(404, errorPage('No template for this page', `The site has no template for <code>${pageKey}</code>.`));
		}

		const content = await addPayloadContent({}, { draft: true });

		const pages = (content.payload || {}).pages || {};
		if (!pages[pageKey]) {
			return html(404, errorPage('Page not found in the CMS', `No page with the key <code>${pageKey}</code> for this conference.`));
		}

		return html(200, withBaseHref(renderPage({ pageKey, content })));
	} catch (err) {
		console.error('preview failed', err);
		return html(500, errorPage('Preview failed to render', String((err && err.message) || err)));
	}
};
