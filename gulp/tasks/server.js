const gulp = require('gulp');
const server = require('browser-sync').create();
const util = require('gulp-util');
const config = require('../config');

// in CL 'gulp server --open' to open current project in browser
// in CL 'gulp server --tunnel siteName' to make project available over http://siteName.localtunnel.me

// What Payload calls when a page is saved, so the preview shows the new content without
// anything being polled. Dev only — it lives on the browsersync server, which never runs
// in production.
const PREVIEW_REFRESH_PATH = '/__payload-preview';

const previewRefresh = (req, res, next) => {
	if (req.url.split('?')[0] !== PREVIEW_REFRESH_PATH) return next();

	// Required here rather than at the top: gulp/tasks is loaded by require-dir, and
	// nunjucks.js registers its own tasks — taking the reference lazily keeps the two
	// files from having to load in a particular order.
	require('./nunjucks').rerenderFromCms();
	res.writeHead(204);
	res.end();
};

gulp.task('server', function() {
	server.init({
		server: {
			baseDir: !config.production ? [config.dest.root, config.src.root] : config.dest.root,
			directory: false,
			middleware: [previewRefresh],
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
