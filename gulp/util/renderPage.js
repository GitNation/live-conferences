const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');

const config = require('../config');
const conferenceSettings = require('./getSettings');
const { createEnvironment } = require('./nunjucksEnv');
const { withResolvedLinks } = require('./linkUrl');

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
	const validPageKeys = pages ? Object.keys(pages) : [];
	const payload =
		conferenceSettings.cms === 'payload' && content.payload
			? withResolvedLinks(content.payload, {
					subPath: conferenceSettings.subPath,
					pageDir: parsed.attributes.pageDir,
					validPageKeys,
				})
			: content.payload;
	const data = Object.assign({}, parsed.attributes, conferenceSettings, content, {
		payload,
		__validPageKeys: validPageKeys,
		PREVIEW: true,
	});

	return getEnvironment().renderString(parsed.body, data);
};

module.exports = { renderPage, hasTemplate };
