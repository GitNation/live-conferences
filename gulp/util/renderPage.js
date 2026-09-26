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

const renderPage = ({ pageKey, content }) => {
	const parsed = frontMatter(fs.readFileSync(templatePathFor(pageKey), 'utf8'));

	const pages = conferenceSettings.cms === 'payload' ? (content.payload || {}).pages : content.pages;
	const data = Object.assign({}, parsed.attributes, conferenceSettings, content, {
		__validPageKeys: pages ? Object.keys(pages) : [],
		PREVIEW: true,
	});

	return getEnvironment().renderString(parsed.body, data);
};

module.exports = { renderPage, hasTemplate };
