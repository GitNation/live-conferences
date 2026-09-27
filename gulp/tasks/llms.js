const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const chalk = require('chalk');

const config = require('../config');
const conferenceSettings = require('../util/getSettings');
const { contentLayer } = require('./nunjucks');
const { editionOf, renderEdition, problems, saveEdition, removeEdition } = require('../util/llmsTxt');

// The pages this build rendered, read back from its output: the page filter in nunjucks.js has
// already decided which templates have a CMS page behind them.
const builtPages = () => {
	const keyOfFile = Object.fromEntries(Object.entries(config.pages.mappings).map(([key, file]) => [file, key]));
	return fs
		.readdirSync(config.dest.html)
		.filter((name) => name.endsWith('.html'))
		.map((name) => path.basename(name, '.html'))
		.map((file) => ({ file, key: keyOfFile[file] || file }));
};

// Only a conference on Payload gets one: its dates, pages and people all come from one shape.
gulp.task('llms', async () => {
	const folder = process.env.CONF_CODE;
	if (conferenceSettings.cms !== 'payload') {
		removeEdition(folder);
		return;
	}

	const edition = editionOf(await contentLayer()(), conferenceSettings, builtPages());
	const text = renderEdition(edition);
	const found = problems(text);
	if (found.length) {
		const message = `llms.txt for ${folder}: ${found.join(', ')}`;
		if (config.env === 'production') throw new Error(message);
		console.warn(chalk.yellow(message));
	}

	fs.writeFileSync(path.join(config.dest.root, 'llms.txt'), text);
	saveEdition(folder, edition);
});
