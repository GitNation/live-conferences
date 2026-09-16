const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');

const config = require('../config');
const conferenceSettings = require('./getSettings');
const { createEnvironment } = require('./nunjucksEnv');

const templatesPath = () => path.resolve(process.cwd(), config.src.templates);

let environment;
const getEnvironment = () => {
	environment = environment || createEnvironment(templatesPath());
	return environment;
};

const fileNameFor = (pageKey) => config.pages.mappings[pageKey] || pageKey;

const templatePathFor = (pageKey) => path.join(templatesPath(), `${fileNameFor(pageKey)}.html`);

const hasTemplate = (pageKey) => fs.existsSync(templatePathFor(pageKey));

/**
 * Renders one page the way `gulp nunjucks` renders it, minus the build's later prettify
 * and asset-hashing steps.
 *
 * The merge order is load-bearing: gulp-front-matter puts the front matter on
 * `file.data`, gulp-data then `extend`s the content over it (shallow, content wins).
 * Reverse it and the preview disagrees with the built page over `pageKey`/`fakeLinks`.
 */
const renderPage = ({ pageKey, content }) => {
	const parsed = frontMatter(fs.readFileSync(templatePathFor(pageKey), 'utf8'));

	const pages = conferenceSettings.cms === 'payload' ? (content.payload || {}).pages : content.pages;
	const data = Object.assign({}, parsed.attributes, conferenceSettings, content, {
		__validPageKeys: pages ? Object.keys(pages) : [],
	});

	return getEnvironment().renderString(parsed.body, data);
};

module.exports = { renderPage, hasTemplate };
