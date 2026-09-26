const gulp = require('gulp');
const server = require('browser-sync').create();
const util = require('gulp-util');
const config = require('../config');

// in CL 'gulp server --open' to open current project in browser
// in CL 'gulp server --tunnel siteName' to make project available over http://siteName.localtunnel.me

// No secret here: this server already hands out every page it has built.
const PREVIEW_RENDER_PATH = '/.netlify/functions/preview';

const previewRender = (req, res, next) => {
	const [pathname, search] = req.url.split('?');
	if (pathname !== PREVIEW_RENDER_PATH) return next();

	const { renderPreview } = require('../../ci/functions/preview/renderPreview');
	const query = Object.fromEntries(new URLSearchParams(search));

	const chunks = [];
	req.on('data', (chunk) => chunks.push(chunk));
	req.on('end', () => {
		let doc = null;
		try {
			doc = req.method === 'POST' && chunks.length ? JSON.parse(Buffer.concat(chunks).toString()).doc : null;
		} catch {
			res.writeHead(400);
			return res.end('Preview body is not JSON.');
		}
		renderPreview(query, { local: true, doc }).then(({ statusCode, headers, body: html }) => {
			res.writeHead(statusCode, headers);
			res.end(html);
		});
	});
};

gulp.task('server', function() {
	server.init({
		server: {
			baseDir: !config.production ? [config.dest.root, config.src.root] : config.dest.root,
			directory: false,
			middleware: [previewRender],
			serveStaticOptions: {
				extensions: ['html'],
				// No conditional caching in dev, or a rebuilt page is served from the browser's
				// cache. serve-static builds its ETag from size and mtime, and gulp.dest stamps
				// the output with the *source template's* mtime — so a page rebuilt from changed
				// CMS content keeps its timestamp, and an edit that does not change the length
				// (a date from 2027 to 2028) keeps its size too. Same ETag, 304, stale page.
				etag: false,
				lastModified: false,
			},
		},
		files: [config.dest.html + '/*.html', config.dest.css + '/*.css', config.dest.img + '/**/*', config.dest.js + '/*.js'],
		port: util.env.port || 8080,
		logLevel: 'info', // 'debug', 'info', 'silent', 'warn'
		logConnections: false,
		logFileChanges: true,
		open: Boolean(util.env.open),
		notify: false,
		ghostMode: false,
		online: Boolean(util.env.tunnel),
		tunnel: util.env.tunnel || null,
	});
});

module.exports = server;
