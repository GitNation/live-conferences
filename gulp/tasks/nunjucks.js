const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const changed = require('gulp-changed');
const prettify = require('gulp-prettify');
const frontMatter = require('gulp-front-matter');
const data = require('gulp-data');
const chalk = require('chalk');
const staticGoogleMap = require('static-google-map');
const filter = require('gulp-filter');

const config = require('../config');
const { getContent } = require('@focus-reactive/graphql-content-layer');
const conferenceSettings = require('../util/getSettings');

let cmsContent;


const fetchContent = async () => {
	const getAndLogContent = async () => {
		const content = await getContent(conferenceSettings);
		fs.writeFileSync(path.resolve(__dirname, '../../content-log.json'), JSON.stringify(content, null, 2));
		return content;
	};
	cmsContent = cmsContent || (await getAndLogContent());
	return cmsContent;
};

const readContent = () => {
	const dataRaw = fs.readFileSync(path.resolve(__dirname, '../../content-mock.json'), 'utf8');
	const data = JSON.parse(dataRaw);
	return data;
};

const contentLayer = () => {
	const arg = process.argv[3];
	const isMock = arg === '-m' || arg === '--mock';

	if (!isMock) return fetchContent;

	console.warn(chalk.yellow('\n*************************************************'));
	console.warn(chalk.yellow('*  Content will be taken from content-log.json  *'));
	console.warn(chalk.yellow('*************************************************\n'));

	return readContent;
};

function renderHtml(onlyChanged) {
	const showSkipMessages = !onlyChanged; // Show messages only during full build
	nunjucksRender.nunjucks.configure({
		watch: false,
		trimBlocks: true,
		lstripBlocks: false,
	});

	var manageEnvironment = function(environment) {
		environment.addGlobal('staticMapUrl', (params) => {
			return staticGoogleMap.staticMapUrl(eval(`(${params})`));
		});

		const tzParts = (iso, timeZone) => {
			if (!iso) return null;
			const d = new Date(iso);
			if (isNaN(d.getTime())) return null;
			const parts = new Intl.DateTimeFormat('en-CA', {
				timeZone: timeZone || 'UTC',
				hour12: false,
				year: 'numeric', month: '2-digit', day: '2-digit',
				hour: '2-digit', minute: '2-digit',
			}).formatToParts(d).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
			const hour = parts.hour === '24' ? '00' : parts.hour;
			return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${hour}:${parts.minute}` };
		};
		environment.addFilter('tzDate', (iso, timeZone) => { const p = tzParts(iso, timeZone); return p ? p.date : ''; });
		environment.addFilter('tzTime', (iso, timeZone) => { const p = tzParts(iso, timeZone); return p ? p.time : ''; });

		// arr | filterBy('attr', value) — items where item.attr === value.
		// value undefined/null is a no-op passthrough (e.g. attendance unset on every other conference/page).
		environment.addFilter('filterBy', (arr, attr, value) => {
			if (value === undefined || value === null) return arr;
			return (arr || []).filter((item) => item && item[attr] === value);
		});

		// confUrl('checkout') — a link to a sibling page of the conference the page belongs to.
		// Reads subPath and pageDir off the render context, so a shared partial does not have to
		// know which conference or page variant it is being rendered into:
		//   plain conference     -> /checkout          (subPath and pageDir both unset)
		//   sub-conference       -> /nyc/checkout
		//   its remote variant   -> /nyc/remote-checkout
		// confUrl() with no page gives the landing page of the same variant: /nyc/remote, or /nyc/.
		environment.addGlobal('confUrl', function (page) {
			const ctx = (this && this.ctx) || {};
			return '/' + (ctx.subPath || '') + [ctx.pageDir, page].filter(Boolean).join('-');
		});
	};

	const pageFilter = filter((file) => {
		const fileName = path.basename(file.path, '.html');
		const match = Object.entries(config.pages.mappings).find(([, mappedName]) => mappedName === fileName);
		const mappedKey = match ? match[0] : undefined;

		const validPageKeys = (file.data && file.data.__validPageKeys) || [];

		// Nested pages (templates/remote/index.html) share a basename with a root page, so the
		// filename mapping cannot tell them apart — trust the front matter when the CMS knows that key.
		const frontMatterKey = file.data && file.data.pageKey;
		if (frontMatterKey && validPageKeys.indexOf(frontMatterKey) !== -1) {
			return true;
		}

		if (mappedKey) {
			if (validPageKeys.indexOf(mappedKey) !== -1) {
				return true;
			} else {
				if (showSkipMessages) {
					console.log(chalk.red(`Page ${fileName}.html with mappedKey '${mappedKey}' not found in content. Skipping.`));
				}
				return false;
			}
		}

		if (validPageKeys.indexOf(fileName) !== -1) {
			return true;
		}

		if (showSkipMessages) {
			console.log(chalk.red(`Page ${fileName}.html does not match any key in content. Skipping.`));
		}
		return false;
	});

	return gulp
		.src([config.src.templates + '/**/[^_]*.html', '!' + config.src.templates + '/removePages/**/*'])
		.pipe(
			plumber({
				errorHandler: config.errorHandler,
			})
		)
		.pipe(gulpif(onlyChanged, changed(config.dest.html)))
		.pipe(frontMatter({ property: 'data' }))
		.pipe(
			data(async () => {
				const content = await contentLayer()();
				const validPageKeys = content.pages ? Object.keys(content.pages) : [];
				// conference-settings.js is exposed to templates too — `subPath` is read by
				// partials/_media-tags.html to build og:url / og:image.
				// PRODUCTION has to travel with the page data: gulp-nunjucks-render only merges
				// `options.data` into the render context, every other option goes to nunjucks itself.
				return { ...conferenceSettings, ...content, PRODUCTION: config.production, __validPageKeys: validPageKeys };
			})
		)
		.pipe(pageFilter)
		.pipe(
			nunjucksRender({
				manageEnv: manageEnvironment,
				path: [config.src.templates],
			})
		)
		.pipe(
			prettify({
				'indent_size': 2,
				'wrap_attributes': 'auto',
				'preserve_newlines': false,
				'end_with_newline': true,
			})
		)
		.pipe(gulp.dest(config.dest.html));
}

gulp.task('nunjucks', function() {
	return renderHtml();
});

gulp.task('nunjucks:changed', function() {
	return renderHtml(true);
});

gulp.task('nunjucks:watch', function() {
	gulp.watch([config.src.templates + '/**/[^_]*.html', '!' + config.src.templates + '/removePages/**/*'], gulp.series('nunjucks:changed'));
	gulp.watch([config.src.templates + '/**/_*.html', '!' + config.src.templates + '/removePages/**/*'], gulp.series('nunjucks'));
	gulp.watch(['src/partials/**/*.html', 'src/eventsBus/**/*.html', 'src/ga/**/*.html'], gulp.series('nunjucks'));
	gulp.watch(['content-log.json'], gulp.series('nunjucks'));
});
